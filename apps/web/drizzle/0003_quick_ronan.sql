CREATE TABLE "flashcard_vocabularies" (
	"flashcard_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flashcard_vocabularies_flashcard_id_vocabulary_id_pk" PRIMARY KEY("flashcard_id","vocabulary_id")
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"language" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "history_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" text,
	"year" integer,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"was_correct" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcard_vocabularies" ADD CONSTRAINT "flashcard_vocabularies_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_vocabularies" ADD CONSTRAINT "flashcard_vocabularies_vocabulary_id_vocabularies_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabularies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_vocabulary_id_vocabularies_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabularies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flashcard_vocabularies_flashcard_id_idx" ON "flashcard_vocabularies" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "flashcard_vocabularies_vocabulary_id_idx" ON "flashcard_vocabularies" USING btree ("vocabulary_id");--> statement-breakpoint
CREATE INDEX "flashcards_language_idx" ON "flashcards" USING btree ("language");--> statement-breakpoint
CREATE INDEX "flashcards_is_active_idx" ON "flashcards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "flashcards_created_at_idx" ON "flashcards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "history_events_year_idx" ON "history_events" USING btree ("year");--> statement-breakpoint
CREATE INDEX "history_events_created_at_idx" ON "history_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "practice_sessions_flashcard_id_idx" ON "practice_sessions" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_vocabulary_id_idx" ON "practice_sessions" USING btree ("vocabulary_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_created_at_idx" ON "practice_sessions" USING btree ("created_at");