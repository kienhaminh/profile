CREATE TYPE "public"."finance_priority" AS ENUM('must_have', 'nice_to_have', 'waste');--> statement-breakpoint
CREATE TYPE "public"."finance_transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "finance_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "finance_transaction_type" NOT NULL,
	"amount" numeric NOT NULL,
	"category_id" uuid,
	"priority" "finance_priority",
	"description" text,
	"date" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_category_id_finance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."finance_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finance_transactions_date_idx" ON "finance_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "finance_transactions_type_idx" ON "finance_transactions" USING btree ("type");