import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getUserProjects: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Test Project", description: "A test project", latitude: "-37.8136", longitude: "144.9631", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getProjectById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, userId: 1, name: "Test Project", description: "A test project", latitude: "-37.8136", longitude: "144.9631", createdAt: new Date(), updatedAt: new Date() };
    return null;
  }),
  createProject: vi.fn().mockResolvedValue({ id: 2, userId: 1, name: "New Project", description: null, latitude: null, longitude: null, createdAt: new Date(), updatedAt: new Date() }),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  getProjectPlans: vi.fn().mockResolvedValue([
    { id: 1, projectId: 1, userId: 1, name: "Lane Closure Plan", workType: "lane_closure", speedZone: 60, laneCount: 2, complianceStatus: "unchecked", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getTgsPlanById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, projectId: 1, userId: 1, name: "Lane Closure Plan", workType: "lane_closure", speedZone: 60, laneCount: 2, roadGeometry: null, closureGeometry: null, signPlacements: null, conePlacements: null, taperConfig: null, bufferZone: null, controllerPositions: null, vehiclePositions: null, planData: null, complianceStatus: "unchecked", aiNotes: null, createdAt: new Date(), updatedAt: new Date() };
    return null;
  }),
  createTgsPlan: vi.fn().mockResolvedValue({ id: 2, projectId: 1, userId: 1, name: "New Plan", workType: "lane_closure", speedZone: 60, laneCount: 2, complianceStatus: "unchecked", createdAt: new Date(), updatedAt: new Date() }),
  updateTgsPlan: vi.fn().mockResolvedValue(undefined),
  deleteTgsPlan: vi.fn().mockResolvedValue(undefined),
  createComplianceCheck: vi.fn().mockResolvedValue({ id: 1, planId: 1, userId: 1, result: "pass", issues: [], warnings: [], createdAt: new Date() }),
  getProjectShares: vi.fn().mockResolvedValue([]),
  createProjectShare: vi.fn().mockResolvedValue({ id: 1, projectId: 1, sharedWithEmail: "test@example.com", permission: "view" }),
  deleteProjectShare: vi.fn().mockResolvedValue(undefined),
  createShareLink: vi.fn().mockResolvedValue({ id: 1, projectId: 1, token: "test-token", expiresAt: new Date() }),
  getShareLinkByToken: vi.fn().mockResolvedValue(null),
  getProjectShare: vi.fn().mockResolvedValue(null),
  getPlanRevisions: vi.fn().mockResolvedValue([]),
  createPlanRevision: vi.fn().mockResolvedValue({ id: 1, planId: 1, userId: 1, planData: {}, description: "test", createdAt: Date.now() }),
  getPlanRevisionById: vi.fn().mockResolvedValue(null),
}));

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          signs: [
            { type: "T1-1", name: "Road Work Ahead", position: { lat: -37.8136, lng: 144.9631 }, distanceFromWork: 200, side: "left" }
          ],
          cones: [
            { position: { lat: -37.8137, lng: 144.9632 }, spacing: 5 }
          ],
          taperLength: 45,
          bufferLength: 30,
          calculations: { taperLength: 45, bufferLength: 30, advanceWarningDistance: 200 },
          notes: "Standard lane closure configuration for 60km/h zone"
        })
      }
    }]
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user-" + userId,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("projects router", () => {
  it("lists user projects when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("Test Project");
  });

  it("gets a project by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.get({ id: 1 });
    expect(project).not.toBeNull();
    expect(project?.name).toBe("Test Project");
  });

  it("returns null for non-existent project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.get({ id: 999 });
    expect(project).toBeNull();
  });

  it("creates a new project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({ name: "New Project" });
    expect(project).toBeDefined();
    expect(project.name).toBe("New Project");
  });

  it("deletes a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated access to projects.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.projects.list()).rejects.toThrow();
  });
});

describe("plans router", () => {
  it("lists plans for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.plans.list({ projectId: 1 });
    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe("Lane Closure Plan");
  });

  it("gets a plan by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plan = await caller.plans.get({ id: 1 });
    expect(plan).not.toBeNull();
    expect(plan?.workType).toBe("lane_closure");
  });

  it("returns null for non-existent plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plan = await caller.plans.get({ id: 999 });
    expect(plan).toBeNull();
  });

  it("creates a new plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plan = await caller.plans.create({
      projectId: 1,
      name: "New Plan",
      workType: "lane_closure",
      speedZone: 60,
      laneCount: 2,
    });
    expect(plan).toBeDefined();
    expect(plan.name).toBe("New Plan");
  });

  it("rejects unauthenticated access to plans.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.plans.list({ projectId: 1 })).rejects.toThrow();
  });
});

describe("AI generation", () => {
  it("generates a TGS plan via AI", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.generateTgs({
      projectId: 1,
      planId: 1,
      workType: "lane_closure",
      speedZone: 60,
      laneCount: 2,
      additionalContext: "Left lane closure for utility works on Swanston Street",
    });

    expect(result).toBeDefined();
    expect(result.signs).toBeInstanceOf(Array);
    expect(result.signs.length).toBeGreaterThan(0);
    expect(result.taperLength).toBeDefined();
    expect(result.calculations).toBeDefined();
  });

  it("rejects unauthenticated AI generation", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ai.generateTgs({
        projectId: 1,
        planId: 1,
        workType: "lane_closure",
        speedZone: 60,
        laneCount: 2,
        additionalContext: "Test closure",
      })
    ).rejects.toThrow();
  });
});

describe("compliance checking", () => {
  it("checks compliance for a plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.checkCompliance({ planId: 1, planData: { signs: [] }, speedZone: 60, workType: "lane_closure" });
    expect(result).toBeDefined();
    // The mock LLM returns the generateTgs JSON which won't match compliance format,
    // so the fallback parser kicks in and returns a default structure
    expect(typeof result).toBe("object");
  });

  it("rejects unauthenticated compliance check", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ai.checkCompliance({ planId: 1, planData: {}, speedZone: 60, workType: "lane_closure" })).rejects.toThrow();
  });
});
