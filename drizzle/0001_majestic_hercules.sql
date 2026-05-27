CREATE TABLE `plan_revisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`planData` json,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`sharedWithEmail` varchar(320) NOT NULL,
	`sharedWithUserId` int,
	`permission` enum('view','edit') NOT NULL DEFAULT 'view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `share_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `share_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `share_links_token_unique` UNIQUE(`token`)
);
