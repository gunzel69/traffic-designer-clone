import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * TGS Projects - top-level container for traffic guidance scheme work
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "in_progress", "review", "approved", "archived"]).default("draft").notNull(),
  /** Road/location address string */
  location: text("location"),
  /** Latitude of the project center */
  latitude: text("latitude"),
  /** Longitude of the project center */
  longitude: text("longitude"),
  /** Zoom level for the map */
  zoomLevel: int("zoomLevel").default(16),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * TGS Plans - individual traffic guidance scheme plans within a project
 */
export const tgsPlans = mysqlTable("tgs_plans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  /** The type of work being performed */
  workType: mysqlEnum("workType", [
    "lane_closure",
    "road_closure",
    "shoulder_closure",
    "intersection_work",
    "pedestrian_detour",
    "multi_lane_closure",
    "night_works",
    "other"
  ]).default("lane_closure").notNull(),
  /** Speed zone in km/h */
  speedZone: int("speedZone").default(60),
  /** Number of lanes on the road */
  laneCount: int("laneCount").default(2),
  /** Road geometry data as GeoJSON */
  roadGeometry: json("roadGeometry"),
  /** Lane closure geometry as GeoJSON */
  closureGeometry: json("closureGeometry"),
  /** Sign placements as JSON array */
  signPlacements: json("signPlacements"),
  /** Cone/delineator placements as JSON array */
  conePlacements: json("conePlacements"),
  /** Taper configuration */
  taperConfig: json("taperConfig"),
  /** Buffer zone configuration */
  bufferZone: json("bufferZone"),
  /** Traffic controller positions */
  controllerPositions: json("controllerPositions"),
  /** Vehicle positions */
  vehiclePositions: json("vehiclePositions"),
  /** Full plan data snapshot for rendering */
  planData: json("planData").$type<Record<string, any>>(),
  /** Compliance status */
  complianceStatus: mysqlEnum("complianceStatus", ["unchecked", "compliant", "non_compliant", "warnings"]).default("unchecked").notNull(),
  /** AI-generated notes/suggestions */
  aiNotes: text("aiNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TgsPlan = typeof tgsPlans.$inferSelect;
export type InsertTgsPlan = typeof tgsPlans.$inferInsert;

/**
 * Compliance checks - results of compliance validation runs
 */
export const complianceChecks = mysqlTable("compliance_checks", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId").notNull(),
  /** Overall result */
  result: mysqlEnum("result", ["pass", "fail", "warnings"]).notNull(),
  /** Array of issues found */
  issues: json("issues"),
  /** Array of warnings */
  warnings: json("warnings"),
  /** Standards checked against */
  standardsChecked: json("standardsChecked"),
  /** Score out of 100 */
  score: int("score"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = typeof complianceChecks.$inferInsert;

/**
 * Uploaded photos - site photos for AI analysis
 */
export const uploadedPhotos = mysqlTable("uploaded_photos", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  /** S3 storage key */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** Public URL */
  url: text("url").notNull(),
  /** Original filename */
  filename: varchar("filename", { length: 255 }),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** AI analysis result */
  aiAnalysis: json("aiAnalysis"),
  /** Whether AI analysis has been completed */
  analysisComplete: int("analysisComplete").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadedPhoto = typeof uploadedPhotos.$inferSelect;
export type InsertUploadedPhoto = typeof uploadedPhotos.$inferInsert;

/**
 * PDF exports - generated PDF documents
 */
export const pdfExports = mysqlTable("pdf_exports", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId").notNull(),
  /** S3 storage key */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** Public URL */
  url: text("url").notNull(),
  /** Version number */
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PdfExport = typeof pdfExports.$inferSelect;
export type InsertPdfExport = typeof pdfExports.$inferInsert;

/**
 * Project shares - sharing projects with other users
 */
export const projectShares = mysqlTable("project_shares", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  /** Email of the person shared with */
  sharedWithEmail: varchar("sharedWithEmail", { length: 320 }).notNull(),
  /** User ID if they have an account */
  sharedWithUserId: int("sharedWithUserId"),
  /** Permission level */
  permission: mysqlEnum("permission", ["view", "edit"]).default("view").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectShare = typeof projectShares.$inferSelect;
export type InsertProjectShare = typeof projectShares.$inferInsert;

/**
 * Share links - shareable links for projects
 */
export const shareLinks = mysqlTable("share_links", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  /** Unique token for the link */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** Expiration date */
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;

/**
 * Plan revisions - version history for TGS plans
 */
export const planRevisions = mysqlTable("plan_revisions", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId").notNull(),
  /** Snapshot of the plan data at this revision */
  planData: json("planData").$type<Record<string, any>>(),
  /** Description of what changed */
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanRevision = typeof planRevisions.$inferSelect;
export type InsertPlanRevision = typeof planRevisions.$inferInsert;
