CREATE TYPE "public"."currency" AS ENUM('KRW', 'VND');--> statement-breakpoint
CREATE TABLE "finance_exchanges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_currency" "currency" NOT NULL,
	"to_currency" "currency" NOT NULL,
	"from_amount" numeric NOT NULL,
	"to_amount" numeric NOT NULL,
	"rate" numeric NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_budgets" ADD COLUMN "currency" "currency" DEFAULT 'KRW' NOT NULL;--> statement-breakpoint
ALTER TABLE "finance_transactions" ADD COLUMN "currency" "currency" DEFAULT 'KRW' NOT NULL;--> statement-breakpoint
CREATE INDEX "finance_exchanges_date_idx" ON "finance_exchanges" USING btree ("date");