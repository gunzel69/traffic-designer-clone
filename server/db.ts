import { eq, desc, and, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, tgsPlans, complianceChecks, uploadedPhotos, pdfExports, projectShares, shareLinks, planRevisions } from "../drizzle/schema";
import type { InsertProject, InsertTgsPlan, InsertComplianceCheck, InsertUploadedPhoto, InsertPdfExport, InsertProjectShare, InsertShareLink, InsertPlanRevision } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ PROJECT HELPERS ============

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  const id = result[0].insertId;
  return getProjectById(id);
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function updateProject(id: number, userId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return getProjectById(id);
}

export async function deleteProject(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

// ============ TGS PLAN HELPERS ============

export async function createTgsPlan(data: InsertTgsPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tgsPlans).values(data);
  const id = result[0].insertId;
  return getTgsPlanById(id);
}

export async function getTgsPlanById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tgsPlans).where(eq(tgsPlans.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getProjectPlans(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tgsPlans).where(eq(tgsPlans.projectId, projectId)).orderBy(desc(tgsPlans.updatedAt));
}

export async function updateTgsPlan(id: number, userId: number, data: Partial<InsertTgsPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tgsPlans).set(data).where(and(eq(tgsPlans.id, id), eq(tgsPlans.userId, userId)));
  return getTgsPlanById(id);
}

export async function deleteTgsPlan(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tgsPlans).where(and(eq(tgsPlans.id, id), eq(tgsPlans.userId, userId)));
}

// ============ COMPLIANCE CHECK HELPERS ============

export async function createComplianceCheck(data: InsertComplianceCheck) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(complianceChecks).values(data);
  return { id: result[0].insertId };
}

export async function getPlanComplianceChecks(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(complianceChecks).where(eq(complianceChecks.planId, planId)).orderBy(desc(complianceChecks.createdAt));
}

// ============ UPLOADED PHOTOS HELPERS ============

export async function createUploadedPhoto(data: InsertUploadedPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(uploadedPhotos).values(data);
  return { id: result[0].insertId, url: data.url || "" };
}

export async function getProjectPhotos(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(uploadedPhotos).where(eq(uploadedPhotos.projectId, projectId)).orderBy(desc(uploadedPhotos.createdAt));
}

export async function updatePhotoAnalysis(id: number, analysis: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(uploadedPhotos).set({ aiAnalysis: analysis, analysisComplete: 1 }).where(eq(uploadedPhotos.id, id));
}

// ============ PDF EXPORT HELPERS ============

export async function createPdfExport(data: InsertPdfExport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pdfExports).values(data);
  return { id: result[0].insertId };
}

export async function getPlanExports(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(pdfExports).where(eq(pdfExports.planId, planId)).orderBy(desc(pdfExports.createdAt));
}

// ============ PROJECT SHARE HELPERS ============

export async function createProjectShare(data: InsertProjectShare) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectShares).values(data);
  return { id: result[0].insertId };
}

export async function getProjectShares(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projectShares).where(eq(projectShares.projectId, projectId)).orderBy(desc(projectShares.createdAt));
}

export async function getProjectShare(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(projectShares).where(
    and(eq(projectShares.projectId, projectId), eq(projectShares.sharedWithUserId, userId))
  ).limit(1);
  return result[0] ?? null;
}

export async function deleteProjectShare(shareId: number, ownerUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projectShares).where(and(eq(projectShares.id, shareId), eq(projectShares.ownerUserId, ownerUserId)));
}

// ============ SHARE LINK HELPERS ============

export async function createShareLink(data: InsertShareLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shareLinks).values(data);
  return { id: result[0].insertId, token: data.token };
}

export async function getShareLinkByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(shareLinks).where(eq(shareLinks.token, token)).limit(1);
  return result[0] ?? null;
}

// ============ PLAN REVISION HELPERS ============

export async function createPlanRevision(data: InsertPlanRevision) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planRevisions).values(data);
  return { id: result[0].insertId };
}

export async function getPlanRevisions(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(planRevisions).where(eq(planRevisions.planId, planId)).orderBy(desc(planRevisions.createdAt));
}

export async function getPlanRevisionById(revisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(planRevisions).where(eq(planRevisions.id, revisionId)).limit(1);
  return result[0] ?? null;
}

// ============ SHARED PROJECTS FOR USER ============

export async function getSharedProjectsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const shares = await db.select().from(projectShares).where(eq(projectShares.sharedWithUserId, userId));
  if (shares.length === 0) return [];
  
  const projectIds = shares.map(s => s.projectId);
  const sharedProjects = await db.select().from(projects).where(inArray(projects.id, projectIds));
  return sharedProjects.map(p => ({
    ...p,
    permission: shares.find(s => s.projectId === p.id)?.permission || "view",
    isShared: true,
  }));
}
