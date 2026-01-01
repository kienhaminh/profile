CREATE TYPE "public"."investment_status" AS ENUM('active', 'sold', 'matured');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('active', 'settled');--> statement-breakpoint
CREATE TYPE "public"."loan_type" AS ENUM('borrow', 'lend');--> statement-breakpoint
CREATE TABLE "finance_investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"amount" numeric NOT NULL,
	"current_value" numeric,
	"currency" "currency" DEFAULT 'KRW' NOT NULL,
	"status" "investment_status" DEFAULT 'active' NOT NULL,
	"date" date NOT NULL,
	"sold_date" date,
	"sold_amount" numeric,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "loan_type" NOT NULL,
	"counterparty" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" "currency" DEFAULT 'KRW' NOT NULL,
	"status" "loan_status" DEFAULT 'active' NOT NULL,
	"date" date NOT NULL,
	"due_date" date,
	"settled_date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_investments_date_idx" ON "finance_investments" USING btree ("date");--> statement-breakpoint
CREATE INDEX "finance_investments_status_idx" ON "finance_investments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "finance_loans_date_idx" ON "finance_loans" USING btree ("date");--> statement-breakpoint
CREATE INDEX "finance_loans_status_idx" ON "finance_loans" USING btree ("status");