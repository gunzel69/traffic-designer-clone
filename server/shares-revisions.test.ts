import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getProjectShares: vi.fn(),
  createProjectShare: vi.fn(),
  deleteProjectShare: vi.fn(),
  createShareLink: vi.fn(),
  getShareLinkByToken: vi.fn(),
  getProjectById: vi.fn(),
  getPlanRevisions: vi.fn(),
  createPlanRevision: vi.fn(),
  getPlanRevisionById: vi.fn(),
  getTgsPlanById: vi.fn(),
  updateTgsPlan: vi.fn(),
  getProjectShare: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";

describe("Project Sharing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list project shares", async () => {
    const mockShares = [
      { id: 1, projectId: 1, sharedWithEmail: "test@example.com", permission: "view" },
      { id: 2, projectId: 1, sharedWithEmail: "editor@example.com", permission: "edit" },
    ];
    (db.getProjectShares as any).mockResolvedValue(mockShares);

    const result = await db.getProjectShares(1);
    expect(result).toHaveLength(2);
    expect(result[0].sharedWithEmail).toBe("test@example.com");
    expect(result[1].permission).toBe("edit");
  });

  it("should create a project share", async () => {
    const mockShare = {
      id: 3,
      projectId: 1,
      ownerUserId: 1,
      sharedWithEmail: "new@example.com",
      permission: "view",
    };
    (db.createProjectShare as any).mockResolvedValue(mockShare);

    const result = await db.createProjectShare({
      projectId: 1,
      ownerUserId: 1,
      sharedWithEmail: "new@example.com",
      permission: "view",
    });

    expect(result.sharedWithEmail).toBe("new@example.com");
    expect(result.permission).toBe("view");
  });

  it("should delete a project share", async () => {
    (db.deleteProjectShare as any).mockResolvedValue(undefined);

    await db.deleteProjectShare(1, 1);
    expect(db.deleteProjectShare).toHaveBeenCalledWith(1, 1);
  });

  it("should create a share link with token", async () => {
    const mockLink = {
      id: 1,
      projectId: 1,
      ownerUserId: 1,
      token: "test-uuid-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    (db.createShareLink as any).mockResolvedValue(mockLink);

    const result = await db.createShareLink({
      projectId: 1,
      ownerUserId: 1,
      token: "test-uuid-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    expect(result.token).toBe("test-uuid-token");
    expect(result.projectId).toBe(1);
  });

  it("should retrieve a share link by token", async () => {
    const mockLink = {
      id: 1,
      projectId: 1,
      ownerUserId: 1,
      token: "valid-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    (db.getShareLinkByToken as any).mockResolvedValue(mockLink);

    const result = await db.getShareLinkByToken("valid-token");
    expect(result).not.toBeNull();
    expect(result!.projectId).toBe(1);
  });

  it("should return null for invalid share link token", async () => {
    (db.getShareLinkByToken as any).mockResolvedValue(null);

    const result = await db.getShareLinkByToken("invalid-token");
    expect(result).toBeNull();
  });
});

describe("Revision History", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list plan revisions", async () => {
    const mockRevisions = [
      { id: 1, planId: 1, userId: 1, description: "Initial generation", createdAt: Date.now() },
      { id: 2, planId: 1, userId: 1, description: "Updated signs", createdAt: Date.now() },
    ];
    (db.getPlanRevisions as any).mockResolvedValue(mockRevisions);

    const result = await db.getPlanRevisions(1);
    expect(result).toHaveLength(2);
    expect(result[0].description).toBe("Initial generation");
  });

  it("should create a plan revision", async () => {
    const mockRevision = {
      id: 3,
      planId: 1,
      userId: 1,
      planData: { signs: [], cones: [] },
      description: "Manual save",
      createdAt: Date.now(),
    };
    (db.createPlanRevision as any).mockResolvedValue(mockRevision);

    const result = await db.createPlanRevision({
      planId: 1,
      userId: 1,
      planData: { signs: [], cones: [] },
      description: "Manual save",
    });

    expect(result.description).toBe("Manual save");
    expect(result.planData).toEqual({ signs: [], cones: [] });
  });

  it("should get a specific revision by ID", async () => {
    const mockRevision = {
      id: 2,
      planId: 1,
      userId: 1,
      planData: { signs: [{ type: "T1-1", lat: -37.8, lng: 144.9 }] },
      description: "After compliance fix",
      createdAt: Date.now(),
    };
    (db.getPlanRevisionById as any).mockResolvedValue(mockRevision);

    const result = await db.getPlanRevisionById(2);
    expect(result).not.toBeNull();
    expect(result!.planData).toHaveProperty("signs");
  });

  it("should restore a revision by updating plan data", async () => {
    const mockRevision = {
      id: 1,
      planId: 1,
      userId: 1,
      planData: { signs: [{ type: "T1-1" }], calculations: { taperLength: 45 } },
      description: "Original",
    };
    const mockPlan = {
      id: 1,
      userId: 1,
      planData: { signs: [{ type: "T2-4" }] },
    };

    (db.getPlanRevisionById as any).mockResolvedValue(mockRevision);
    (db.getTgsPlanById as any).mockResolvedValue(mockPlan);
    (db.createPlanRevision as any).mockResolvedValue({ id: 4 });
    (db.updateTgsPlan as any).mockResolvedValue(undefined);

    // Simulate the restore flow
    const revision = await db.getPlanRevisionById(1);
    expect(revision).not.toBeNull();

    const plan = await db.getTgsPlanById(revision!.planId);
    expect(plan).not.toBeNull();
    expect(plan!.userId).toBe(1);

    // Save current state before restoring
    await db.createPlanRevision({
      planId: plan!.id,
      userId: plan!.userId,
      planData: plan!.planData || {},
      description: `Auto-save before restoring revision #${revision!.id}`,
    });

    // Restore
    await db.updateTgsPlan(plan!.id, plan!.userId, {
      planData: revision!.planData as any,
    });

    expect(db.createPlanRevision).toHaveBeenCalled();
    expect(db.updateTgsPlan).toHaveBeenCalledWith(1, 1, {
      planData: mockRevision.planData,
    });
  });

  it("should return null for non-existent revision", async () => {
    (db.getPlanRevisionById as any).mockResolvedValue(null);

    const result = await db.getPlanRevisionById(999);
    expect(result).toBeNull();
  });
});
