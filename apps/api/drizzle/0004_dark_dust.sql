CREATE TYPE "public"."github_connection_type" AS ENUM('github_app', 'pat');--> statement-breakpoint
ALTER TABLE "github_integration" ADD COLUMN "connection_type" "github_connection_type" DEFAULT 'github_app' NOT NULL;--> statement-breakpoint
ALTER TABLE "github_integration" ADD COLUMN "pat" text;