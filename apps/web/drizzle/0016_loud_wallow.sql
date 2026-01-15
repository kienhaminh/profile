CREATE TABLE "finance_recurring_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "finance_transaction_type" NOT NULL,
	"amount" numeric NOT NULL,
	"currency" "currency" DEFAULT 'KRW' NOT NULL,
	"category_id" uuid,
	"priority" "finance_priority",
	"day_of_month" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"last_generated_month" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_recurring_transactions" ADD CONSTRAINT "finance_recurring_transactions_category_id_finance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."finance_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finance_recurring_day_idx" ON "finance_recurring_transactions" USING btree ("day_of_month");--> statement-breakpoint
CREATE INDEX "finance_recurring_is_active_idx" ON "finance_recurring_transactions" USING btree ("is_active");