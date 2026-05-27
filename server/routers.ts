import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ PROJECTS ============
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),

    sharedWithMe: protectedProcedure.query(async ({ ctx }) => {
      return db.getSharedProjectsForUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          // Check if user has shared access
          const share = await db.getProjectShare(input.id, ctx.user.id);
          if (!share) return null;
        }
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description ?? null,
          location: input.location ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "in_progress", "review", "approved", "archived"]).optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateProject(id, ctx.user.id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ TGS PLANS ============
  plans: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectPlans(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const plan = await db.getTgsPlanById(input.id);
        if (!plan || plan.userId !== ctx.user.id) {
          // Check shared access
          if (plan) {
            const share = await db.getProjectShare(plan.projectId, ctx.user.id);
            if (share) return plan;
          }
          return null;
        }
        return plan;
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255),
        workType: z.enum(["lane_closure", "road_closure", "shoulder_closure", "intersection_work", "pedestrian_detour", "multi_lane_closure", "night_works", "other"]).optional(),
        speedZone: z.number().optional(),
        laneCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTgsPlan({
          projectId: input.projectId,
          userId: ctx.user.id,
          name: input.name,
          workType: input.workType ?? "lane_closure",
          speedZone: input.speedZone ?? 60,
          laneCount: input.laneCount ?? 2,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        workType: z.enum(["lane_closure", "road_closure", "shoulder_closure", "intersection_work", "pedestrian_detour", "multi_lane_closure", "night_works", "other"]).optional(),
        speedZone: z.number().optional(),
        laneCount: z.number().optional(),
        roadGeometry: z.any().optional(),
        closureGeometry: z.any().optional(),
        signPlacements: z.any().optional(),
        conePlacements: z.any().optional(),
        taperConfig: z.any().optional(),
        bufferZone: z.any().optional(),
        controllerPositions: z.any().optional(),
        vehiclePositions: z.any().optional(),
        planData: z.any().optional(),
        complianceStatus: z.enum(["unchecked", "compliant", "non_compliant", "warnings"]).optional(),
        aiNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateTgsPlan(id, ctx.user.id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTgsPlan(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ AI TGS GENERATION ============
  ai: router({
    generateTgs: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        planId: z.number(),
        workType: z.string(),
        speedZone: z.number(),
        laneCount: z.number(),
        roadGeometry: z.any().optional(),
        closureGeometry: z.any().optional(),
        additionalContext: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are an expert Australian traffic management engineer specializing in Victorian Traffic Guidance Schemes (TGS). You generate compliant TGS layouts based on AS 1742.3, VicRoads Code of Practice for Worksite Safety, and Victorian traffic management regulations.

Given the work parameters, generate a complete TGS plan including:
1. Sign placements with types, positions, and spacing
2. Taper calculations (approach taper, departure taper)
3. Cone/delineator placements
4. Buffer zone dimensions
5. Traffic controller positions
6. Vehicle positions
7. Compliance notes

Respond in JSON format with the following structure:
{
  "signPlacements": [{"type": "string", "position": {"lat": number, "lng": number}, "distanceFromWork": number, "side": "left|right|both"}],
  "taperConfig": {"approachLength": number, "departureLength": number, "taperRatio": "string", "coneSpacing": number},
  "bufferZone": {"length": number, "width": number},
  "conePlacements": [{"position": {"lat": number, "lng": number}, "type": "cone|delineator"}],
  "controllerPositions": [{"position": {"lat": number, "lng": number}, "role": "string"}],
  "vehiclePositions": [{"position": {"lat": number, "lng": number}, "type": "string"}],
  "complianceNotes": ["string"],
  "warnings": ["string"],
  "calculations": {"taperLength": number, "signSpacing": number, "bufferLength": number, "workZoneLength": number}
}`;

        const userPrompt = `Generate a TGS plan for the following parameters:
- Work Type: ${input.workType}
- Speed Zone: ${input.speedZone} km/h
- Lane Count: ${input.laneCount}
- Road Geometry: ${input.roadGeometry ? JSON.stringify(input.roadGeometry) : "Not specified"}
- Closure Area: ${input.closureGeometry ? JSON.stringify(input.closureGeometry) : "Not specified"}
- Additional Context: ${input.additionalContext || "None"}

Calculate appropriate taper lengths using the formula: Taper Length = Speed^2 / (2 * lateral offset * deceleration factor).
For ${input.speedZone}km/h zones, use standard Victorian sign spacing requirements.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (!rawContent) throw new Error("No response from AI");
          const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          let tgsPlan;
          try {
            const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
            tgsPlan = JSON.parse(jsonStr);
          } catch {
            throw new Error("Failed to parse AI response as JSON");
          }

          // Save the generated plan data
          await db.updateTgsPlan(input.planId, ctx.user.id, {
            signPlacements: tgsPlan.signPlacements ?? [],
            taperConfig: tgsPlan.taperConfig ?? {},
            bufferZone: tgsPlan.bufferZone ?? {},
            conePlacements: tgsPlan.conePlacements ?? [],
            controllerPositions: tgsPlan.controllerPositions ?? [],
            vehiclePositions: tgsPlan.vehiclePositions ?? [],
            planData: tgsPlan,
            aiNotes: (tgsPlan.complianceNotes ?? []).join("\n"),
            complianceStatus: (tgsPlan.warnings?.length ?? 0) > 0 ? "warnings" : "compliant",
          });

          // Save revision automatically
          await db.createPlanRevision({
            planId: input.planId,
            userId: ctx.user.id,
            planData: tgsPlan,
            description: `AI generated TGS for ${input.workType} at ${input.speedZone}km/h`,
          });

          return tgsPlan;
        } catch (error: any) {
          console.error("[AI] TGS generation failed:", error);
          throw new Error("Failed to generate TGS plan: " + (error.message || "Unknown error"));
        }
      }),

    checkCompliance: protectedProcedure
      .input(z.object({
        planId: z.number(),
        planData: z.any(),
        speedZone: z.number(),
        workType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are a Victorian traffic management compliance auditor. Check the provided TGS plan against AS 1742.3 and VicRoads standards. Identify any issues, missing signs, unsafe layouts, incorrect taper lengths, pedestrian safety concerns, tram corridor conflicts, and bike lane conflicts.

Respond in JSON format:
{
  "result": "pass" | "fail" | "warnings",
  "score": number (0-100),
  "issues": [{"severity": "critical|major|minor", "description": "string", "standard": "string"}],
  "warnings": [{"description": "string", "recommendation": "string"}],
  "standardsChecked": ["AS 1742.3", "VicRoads CoP"]
}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Check compliance for this TGS plan:\nSpeed Zone: ${input.speedZone}km/h\nWork Type: ${input.workType}\nPlan Data: ${JSON.stringify(input.planData)}` },
            ],
          });

          const rawContent2 = response.choices?.[0]?.message?.content;
          if (!rawContent2) throw new Error("No response from AI");
          const content2 = typeof rawContent2 === 'string' ? rawContent2 : JSON.stringify(rawContent2);

          let checkResult;
          try {
            const jsonMatch = content2.match(/```json\s*([\s\S]*?)```/) || content2.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content2;
            checkResult = JSON.parse(jsonStr);
          } catch {
            checkResult = { result: "warnings", score: 50, issues: [], warnings: [{ description: "Could not parse compliance check", recommendation: "Review manually" }], standardsChecked: ["AS 1742.3"] };
          }

          // Save the compliance check
          await db.createComplianceCheck({
            planId: input.planId,
            userId: ctx.user.id,
            result: checkResult.result,
            issues: checkResult.issues,
            warnings: checkResult.warnings,
            standardsChecked: checkResult.standardsChecked,
            score: checkResult.score,
          });

          // Update plan compliance status
          await db.updateTgsPlan(input.planId, ctx.user.id, {
            complianceStatus: checkResult.result === "pass" ? "compliant" : checkResult.result === "fail" ? "non_compliant" : "warnings",
          });

          return checkResult;
        } catch (error: any) {
          console.error("[AI] Compliance check failed:", error);
          throw new Error("Failed to check compliance: " + (error.message || "Unknown error"));
        }
      }),

    // AI Chat assistant for the editor
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })),
        planContext: z.object({
          name: z.string(),
          workType: z.string(),
          speedZone: z.number(),
          laneCount: z.number(),
          complianceStatus: z.string(),
          hasPlanData: z.boolean(),
          aiNotes: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemMessage = `You are an expert Victorian traffic management AI assistant. You help users create compliant Traffic Guidance Schemes (TGS) for Victorian/Australian roads.

Your expertise includes:
- AS 1742.3 (Manual of uniform traffic control devices - Traffic control for works on roads)
- VicRoads Code of Practice for Worksite Safety
- Melbourne tram corridor safety requirements
- Sign spacing calculations and taper length formulas
- Pedestrian and cyclist safety in work zones
- Night works requirements
- Multi-lane closure configurations

${input.planContext ? `Current plan context:
- Plan: ${input.planContext.name}
- Work Type: ${input.planContext.workType}
- Speed Zone: ${input.planContext.speedZone} km/h
- Lanes: ${input.planContext.laneCount}
- Compliance: ${input.planContext.complianceStatus}
- Has generated data: ${input.planContext.hasPlanData}
${input.planContext.aiNotes ? `- AI Notes: ${input.planContext.aiNotes}` : ""}` : "No plan context available."}

Provide concise, practical advice. Reference specific standards when relevant. Use metric units (metres, km/h).`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemMessage },
              ...input.messages.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (!rawContent) throw new Error("No AI response");
          const responseText = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          return { response: responseText };
        } catch (error: any) {
          throw new Error("AI chat failed: " + (error.message || "Unknown error"));
        }
      }),
  }),

  // ============ COMPLIANCE ============
  compliance: router({
    list: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPlanComplianceChecks(input.planId);
      }),
  }),

  // ============ PHOTOS ============
  photos: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectPhotos(input.projectId);
      }),

    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        filename: z.string(),
        mimeType: z.string(),
        base64Data: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const fileKey = `photos/${ctx.user.id}/${Date.now()}-${input.filename}`;
        const { key, url } = await storagePut(fileKey, buffer, input.mimeType);

        const photo = await db.createUploadedPhoto({
          projectId: input.projectId,
          userId: ctx.user.id,
          fileKey: key,
          url,
          filename: input.filename,
          mimeType: input.mimeType,
        });

        return photo;
      }),

    analyze: protectedProcedure
      .input(z.object({ photoId: z.number(), photoUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are an expert traffic management site analyst. Analyze the provided site photo and identify:
1. Road type and estimated width
2. Number of lanes and directions
3. Existing signage visible
4. Potential hazards (power lines, trees, drainage, pedestrian areas)
5. Tram tracks or bike lanes
6. Estimated speed zone
7. Recommended TGS considerations

Respond in JSON format:
{
  "roadType": "string",
  "estimatedWidth": "string",
  "laneCount": number,
  "existingSignage": ["string"],
  "hazards": ["string"],
  "tramTracks": boolean,
  "bikeLanes": boolean,
  "estimatedSpeedZone": number,
  "recommendations": ["string"]
}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: [
                { type: "text", text: "Analyze this road site photo for traffic management planning:" },
                { type: "image_url", image_url: { url: input.photoUrl, detail: "high" } },
              ] },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (!rawContent) throw new Error("No AI response");
          const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

          let analysis;
          try {
            const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
            analysis = JSON.parse(jsonStr);
          } catch {
            analysis = { roadType: "Unknown", recommendations: ["Manual analysis required"] };
          }

          await db.updatePhotoAnalysis(input.photoId, analysis);
          return analysis;
        } catch (error: any) {
          throw new Error("Photo analysis failed: " + (error.message || "Unknown error"));
        }
      }),
  }),

  // ============ CONTACT FORM ============
  contact: router({
    submit: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        formType: z.enum(["demo", "inquiry"]),
        topic: z.string(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const title = input.formType === "demo"
          ? `Demo Request from ${input.firstName} ${input.lastName}`
          : `Inquiry from ${input.firstName} ${input.lastName}`;

        const content = [
          `Name: ${input.firstName} ${input.lastName}`,
          `Email: ${input.email}`,
          `Company: ${input.company}`,
          `Type: ${input.formType}`,
          `Topic: ${input.topic}`,
          input.message ? `Message: ${input.message}` : "",
        ].filter(Boolean).join("\n");

        await notifyOwner({ title, content });
        return { success: true };
      }),
  }),

  // ============ PDF EXPORT ============
  exports: router({
    generate: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getTgsPlanById(input.planId);
        if (!plan || plan.userId !== ctx.user.id) throw new Error("Plan not found");

        // Generate real PDF using pdfkit
        const PDFDocument = (await import("pdfkit")).default;

        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          const doc = new PDFDocument({ size: "A4", margin: 50 });
          const chunks: Buffer[] = [];
          doc.on("data", (chunk: Buffer) => chunks.push(chunk));
          doc.on("end", () => resolve(Buffer.concat(chunks)));
          doc.on("error", reject);

          // Header
          doc.fontSize(24).fillColor("#f97316").text("Traffic Guidance Scheme", { align: "center" });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor("#666").text(`Generated: ${new Date().toLocaleDateString("en-AU")} | TGS AI Victoria`, { align: "center" });
          doc.moveDown();
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#f97316").lineWidth(2).stroke();
          doc.moveDown();

          // Plan details
          doc.fontSize(14).fillColor("#333").text("Plan Details");
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor("#444");
          doc.text(`Plan Name: ${plan.name}`);
          doc.text(`Work Type: ${(plan.workType || "lane_closure").replace(/_/g, " ")}`);
          doc.text(`Speed Zone: ${plan.speedZone || 60} km/h`);
          doc.text(`Lane Count: ${plan.laneCount || 2}`);
          doc.text(`Compliance Status: ${plan.complianceStatus || "unchecked"}`);
          doc.moveDown();

          // Sign placements table
          const planData = plan.planData as any;
          if (planData?.signPlacements?.length) {
            doc.fontSize(14).fillColor("#333").text("Sign Placements");
            doc.moveDown(0.5);
            doc.fontSize(9).fillColor("#666");

            const tableTop = doc.y;
            doc.rect(50, tableTop, 495, 18).fillAndStroke("#f0f0f0", "#ddd");
            doc.fillColor("#333").text("Type", 55, tableTop + 4, { width: 200 });
            doc.text("Distance", 260, tableTop + 4, { width: 100 });
            doc.text("Side", 370, tableTop + 4, { width: 100 });
            let rowY = tableTop + 18;

            planData.signPlacements.forEach((sign: any, i: number) => {
              if (rowY > 720) {
                doc.addPage();
                rowY = 50;
              }
              const bgColor = i % 2 === 0 ? "#ffffff" : "#fafafa";
              doc.rect(50, rowY, 495, 16).fillAndStroke(bgColor, "#eee");
              doc.fillColor("#444").text(sign.type || "Unknown", 55, rowY + 3, { width: 200 });
              doc.text(`${sign.distanceFromWork || 0}m`, 260, rowY + 3, { width: 100 });
              doc.text(sign.side || "left", 370, rowY + 3, { width: 100 });
              rowY += 16;
            });
            doc.y = rowY + 10;
            doc.moveDown();
          }

          // Cone placements summary
          if (planData?.conePlacements?.length) {
            doc.fontSize(14).fillColor("#333").text("Cone/Delineator Placements");
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor("#444").text(`Total cones/delineators: ${planData.conePlacements.length}`);
            doc.moveDown();
          }

          // Controller positions
          if (planData?.controllerPositions?.length) {
            doc.fontSize(14).fillColor("#333").text("Traffic Controller Positions");
            doc.moveDown(0.5);
            planData.controllerPositions.forEach((ctrl: any) => {
              doc.fontSize(11).fillColor("#444").text(`- ${ctrl.role || "Controller"} at designated position`);
            });
            doc.moveDown();
          }

          // AI Notes
          if (plan.aiNotes) {
            doc.fontSize(14).fillColor("#333").text("AI Notes & Recommendations");
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor("#555").text(plan.aiNotes, { width: 495 });
            doc.moveDown();
          }

          // Footer
          doc.moveDown(2);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ddd").lineWidth(1).stroke();
          doc.moveDown(0.5);
          doc.fontSize(8).fillColor("#999").text("This document was generated by TGS AI Victoria. All traffic guidance schemes should be reviewed by a qualified traffic management professional before implementation.", { align: "center" });

          doc.end();
        });

        const fileKey = `exports/${ctx.user.id}/${plan.id}-v${Date.now()}.pdf`;
        const { key, url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

        const exportRecord = await db.createPdfExport({
          planId: input.planId,
          userId: ctx.user.id,
          fileKey: key,
          url,
          version: 1,
        });

        return { id: exportRecord.id, url };
      }),

    list: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPlanExports(input.planId);
      }),
  }),

  // ============ PROJECT SHARING ============
  shares: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectShares(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        sharedWithEmail: z.string().email(),
        permission: z.enum(["view", "edit"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Not authorized to share this project");
        }

        const share = await db.createProjectShare({
          projectId: input.projectId,
          ownerUserId: ctx.user.id,
          sharedWithEmail: input.sharedWithEmail,
          permission: input.permission ?? "view",
        });

        // Notify owner about the share
        await notifyOwner({
          title: "Project Shared",
          content: `Project "${project.name}" shared with ${input.sharedWithEmail} (${input.permission || "view"} access)`,
        });

        return share;
      }),

    remove: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProjectShare(input.shareId, ctx.user.id);
        return { success: true };
      }),

    generateLink: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Not authorized");
        }

        const token = crypto.randomUUID();
        await db.createShareLink({
          projectId: input.projectId,
          ownerUserId: ctx.user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return { token };
      }),

    acceptLink: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const link = await db.getShareLinkByToken(input.token);
        if (!link) throw new Error("Invalid or expired share link");
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          throw new Error("Share link has expired");
        }

        // Create a share entry for this user
        await db.createProjectShare({
          projectId: link.projectId,
          ownerUserId: link.ownerUserId,
          sharedWithEmail: ctx.user.email || "unknown",
          sharedWithUserId: ctx.user.id,
          permission: "view",
        });

        return { projectId: link.projectId };
      }),
  }),

  // ============ REVISION HISTORY ============
  revisions: router({
    list: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPlanRevisions(input.planId);
      }),

    create: protectedProcedure
      .input(z.object({
        planId: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getTgsPlanById(input.planId);
        if (!plan || plan.userId !== ctx.user.id) throw new Error("Plan not found");

        return db.createPlanRevision({
          planId: input.planId,
          userId: ctx.user.id,
          planData: plan.planData || {},
          description: input.description || `Manual save at ${new Date().toLocaleString("en-AU")}`,
        });
      }),

    restore: protectedProcedure
      .input(z.object({ revisionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const revision = await db.getPlanRevisionById(input.revisionId);
        if (!revision) throw new Error("Revision not found");

        const plan = await db.getTgsPlanById(revision.planId);
        if (!plan || plan.userId !== ctx.user.id) throw new Error("Not authorized");

        // Save current state as a revision before restoring
        await db.createPlanRevision({
          planId: plan.id,
          userId: ctx.user.id,
          planData: plan.planData || {},
          description: `Auto-save before restoring revision #${revision.id}`,
        });

        // Restore the plan data from the revision
        await db.updateTgsPlan(plan.id, ctx.user.id, {
          planData: revision.planData as any,
          signPlacements: (revision.planData as any)?.signPlacements ?? null,
          conePlacements: (revision.planData as any)?.conePlacements ?? null,
          controllerPositions: (revision.planData as any)?.controllerPositions ?? null,
          vehiclePositions: (revision.planData as any)?.vehiclePositions ?? null,
        });

        return { success: true, planId: plan.id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
