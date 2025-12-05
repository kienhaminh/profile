CREATE TABLE "vocabularies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"meaning" text NOT NULL,
	"part_of_speech" text,
	"language" text DEFAULT 'en' NOT NULL,
	"example" text,
	"pronunciation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vocabulary_relations" ADD CONSTRAINT "vocabulary_relations_source_id_vocabularies_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."vocabularies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_relations" ADD CONSTRAINT "vocabulary_relations_target_id_vocabularies_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."vocabularies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vocabularies_word_idx" ON "vocabularies" USING btree ("word");--> statement-breakpoint
CREATE INDEX "vocabularies_language_idx" ON "vocabularies" USING btree ("language");--> statement-breakpoint
CREATE INDEX "vocabulary_relations_source_id_idx" ON "vocabulary_relations" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "vocabulary_relations_target_id_idx" ON "vocabulary_relations" USING btree ("target_id");