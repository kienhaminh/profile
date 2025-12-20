CREATE TABLE "page_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"page_path" text NOT NULL,
	"page_title" text,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exited_at" timestamp with time zone,
	"duration" integer,
	"scroll_depth" integer
);
--> statement-breakpoint
CREATE TABLE "visitor_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"user_agent" text,
	"referrer" text,
	"device" text,
	"country" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"total_duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_visits" ADD CONSTRAINT "page_visits_session_id_visitor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."visitor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_visits_session_id_idx" ON "page_visits" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "page_visits_page_path_idx" ON "page_visits" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "page_visits_entered_at_idx" ON "page_visits" USING btree ("entered_at");--> statement-breakpoint
CREATE INDEX "visitor_sessions_visitor_id_idx" ON "visitor_sessions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "visitor_sessions_started_at_idx" ON "visitor_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "visitor_sessions_created_at_idx" ON "visitor_sessions" USING btree ("created_at");