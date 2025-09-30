-- Create project_status enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "public"."project_status" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- Create hashtags table
CREATE TABLE IF NOT EXISTS "hashtags" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "hashtags_name_unique" UNIQUE("name"),
  CONSTRAINT "hashtags_slug_unique" UNIQUE("slug")
);

--> statement-breakpoint

-- Create technologies table
CREATE TABLE IF NOT EXISTS "technologies" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "technologies_name_unique" UNIQUE("name"),
  CONSTRAINT "technologies_slug_unique" UNIQUE("slug")
);

--> statement-breakpoint

-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "status" "project_status" DEFAULT 'DRAFT' NOT NULL,
  "description" text NOT NULL,
  "images" json DEFAULT '[]'::json NOT NULL,
  "github_url" text,
  "live_url" text,
  "start_date" timestamp,
  "end_date" timestamp,
  "is_ongoing" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
