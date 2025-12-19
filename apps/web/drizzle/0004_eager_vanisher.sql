CREATE TABLE "folktales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"summary" text,
	"category" text,
	"characters" jsonb DEFAULT '[]'::jsonb,
	"moral" text,
	"source_url" text,
	"crawled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "folktales_title_idx" ON "folktales" USING btree ("title");--> statement-breakpoint
CREATE INDEX "folktales_category_idx" ON "folktales" USING btree ("category");--> statement-breakpoint
CREATE INDEX "folktales_created_at_idx" ON "folktales" USING btree ("created_at");