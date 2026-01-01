CREATE TABLE "favorite_tags" (
	"favorite_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "favorite_tags_favorite_id_tag_id_pk" PRIMARY KEY("favorite_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "finance_investments" ALTER COLUMN "currency" SET DEFAULT 'VND';--> statement-breakpoint
ALTER TABLE "favorite_tags" ADD CONSTRAINT "favorite_tags_favorite_id_favorites_id_fk" FOREIGN KEY ("favorite_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_tags" ADD CONSTRAINT "favorite_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_tags_favorite_id_idx" ON "favorite_tags" USING btree ("favorite_id");--> statement-breakpoint
CREATE INDEX "favorite_tags_tag_id_idx" ON "favorite_tags" USING btree ("tag_id");