CREATE TABLE "shortlinks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"destination_url" text NOT NULL,
	"title" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shortlinks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "shortlinks_slug_idx" ON "shortlinks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "shortlinks_is_active_idx" ON "shortlinks" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "shortlinks_created_at_idx" ON "shortlinks" USING btree ("created_at");