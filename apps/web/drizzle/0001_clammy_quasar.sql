CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"extracted_data" jsonb NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_sessions_created_at_idx" ON "chat_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_sessions_visitor_id_idx" ON "chat_sessions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "knowledge_entries_source_type_idx" ON "knowledge_entries" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "knowledge_entries_status_idx" ON "knowledge_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "knowledge_entries_created_at_idx" ON "knowledge_entries" USING btree ("created_at");