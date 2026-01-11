CREATE TABLE "finance_aggregates" (
	"currency" "currency" PRIMARY KEY NOT NULL,
	"total_income" numeric DEFAULT '0' NOT NULL,
	"total_expense" numeric DEFAULT '0' NOT NULL,
	"total_exchange_in" numeric DEFAULT '0' NOT NULL,
	"total_exchange_out" numeric DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Initialize with existing currencies
INSERT INTO "finance_aggregates" ("currency") VALUES ('KRW'), ('VND');

-- Trigger function for finance_transactions
CREATE OR REPLACE FUNCTION update_aggregates_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE finance_aggregates SET total_income = total_income + NEW.amount, updated_at = NOW() WHERE currency = NEW.currency;
    ELSE
      UPDATE finance_aggregates SET total_expense = total_expense + NEW.amount, updated_at = NOW() WHERE currency = NEW.currency;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE finance_aggregates SET total_income = total_income - OLD.amount, updated_at = NOW() WHERE currency = OLD.currency;
    ELSE
      UPDATE finance_aggregates SET total_expense = total_expense - OLD.amount, updated_at = NOW() WHERE currency = OLD.currency;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle old values
    IF OLD.type = 'income' THEN
      UPDATE finance_aggregates SET total_income = total_income - OLD.amount WHERE currency = OLD.currency;
    ELSE
      UPDATE finance_aggregates SET total_expense = total_expense - OLD.amount WHERE currency = OLD.currency;
    END IF;
    -- Handle new values
    IF NEW.type = 'income' THEN
      UPDATE finance_aggregates SET total_income = total_income + NEW.amount, updated_at = NOW() WHERE currency = NEW.currency;
    ELSE
      UPDATE finance_aggregates SET total_expense = total_expense + NEW.amount, updated_at = NOW() WHERE currency = NEW.currency;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for finance_exchanges
CREATE OR REPLACE FUNCTION update_aggregates_on_exchange()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE finance_aggregates SET total_exchange_out = total_exchange_out + NEW.from_amount, updated_at = NOW() WHERE currency = NEW.from_currency;
    UPDATE finance_aggregates SET total_exchange_in = total_exchange_in + NEW.to_amount, updated_at = NOW() WHERE currency = NEW.to_currency;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE finance_aggregates SET total_exchange_out = total_exchange_out - OLD.from_amount, updated_at = NOW() WHERE currency = OLD.from_currency;
    UPDATE finance_aggregates SET total_exchange_in = total_exchange_in - OLD.to_amount, updated_at = NOW() WHERE currency = OLD.to_currency;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
CREATE TRIGGER trg_transaction_aggregates
AFTER INSERT OR UPDATE OR DELETE ON finance_transactions
FOR EACH ROW EXECUTE FUNCTION update_aggregates_on_transaction();

CREATE TRIGGER trg_exchange_aggregates
AFTER INSERT OR DELETE ON finance_exchanges
FOR EACH ROW EXECUTE FUNCTION update_aggregates_on_exchange();
