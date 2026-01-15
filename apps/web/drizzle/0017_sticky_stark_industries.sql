CREATE TYPE "public"."finance_frequency" AS ENUM('monthly', 'yearly');--> statement-breakpoint
ALTER TABLE "finance_recurring_transactions" ADD COLUMN "frequency" "finance_frequency" DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "finance_recurring_transactions" ADD COLUMN "month_of_year" integer;