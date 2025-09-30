-- Create post_hashtags junction table
CREATE TABLE IF NOT EXISTS "post_hashtags" (
  "post_id" text NOT NULL,
  "hashtag_id" text NOT NULL,
  CONSTRAINT "post_hashtags_post_id_hashtag_id_pk" PRIMARY KEY("post_id","hashtag_id")
);

--> statement-breakpoint

-- Create project_hashtags junction table
CREATE TABLE IF NOT EXISTS "project_hashtags" (
  "project_id" text NOT NULL,
  "hashtag_id" text NOT NULL,
  CONSTRAINT "project_hashtags_project_id_hashtag_id_pk" PRIMARY KEY("project_id","hashtag_id")
);

--> statement-breakpoint

-- Create project_technologies junction table
CREATE TABLE IF NOT EXISTS "project_technologies" (
  "project_id" text NOT NULL,
  "technology_id" text NOT NULL,
  CONSTRAINT "project_technologies_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id")
);

--> statement-breakpoint

-- Add foreign key constraints for post_hashtags
DO $$ BEGIN
  ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_post_id_posts_id_fk" 
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_hashtag_id_hashtags_id_fk" 
    FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- Add foreign key constraints for project_hashtags
DO $$ BEGIN
  ALTER TABLE "project_hashtags" ADD CONSTRAINT "project_hashtags_project_id_projects_id_fk" 
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "project_hashtags" ADD CONSTRAINT "project_hashtags_hashtag_id_hashtags_id_fk" 
    FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- Add foreign key constraints for project_technologies
DO $$ BEGIN
  ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" 
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_technologies_id_fk" 
    FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
