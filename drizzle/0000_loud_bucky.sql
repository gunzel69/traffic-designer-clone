CREATE TABLE `compliance_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`result` enum('pass','fail','warnings') NOT NULL,
	`issues` json,
	`warnings` json,
	`standardsChecked` json,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdf_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pdf_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','in_progress','review','approved','archived') NOT NULL DEFAULT 'draft',
	`location` text,
	`latitude` text,
	`longitude` text,
	`zoomLevel` int DEFAULT 16,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tgs_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`workType` enum('lane_closure','road_closure','shoulder_closure','intersection_work','pedestrian_detour','multi_lane_closure','night_works','other') NOT NULL DEFAULT 'lane_closure',
	`speedZone` int DEFAULT 60,
	`laneCount` int DEFAULT 2,
	`roadGeometry` json,
	`closureGeometry` json,
	`signPlacements` json,
	`conePlacements` json,
	`taperConfig` json,
	`bufferZone` json,
	`controllerPositions` json,
	`vehiclePositions` json,
	`planData` json,
	`complianceStatus` enum('unchecked','compliant','non_compliant','warnings') NOT NULL DEFAULT 'unchecked',
	`aiNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tgs_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`filename` varchar(255),
	`mimeType` varchar(100),
	`aiAnalysis` json,
	`analysisComplete` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
