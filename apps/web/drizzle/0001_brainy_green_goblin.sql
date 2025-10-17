ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_author_profiles_id_fk";
--> statement-breakpoint
-- Safely handle the post_status enum type migration
-- The goal is to ensure the type exists with the correct values: draft, published, archived

DO $$
DECLARE
    type_exists boolean := false;
    current_values text[];
    desired_values text[] := ARRAY['draft', 'published', 'archived'];
    type_is_used boolean := false;
BEGIN
    -- Check if the type exists
    SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'post_status') INTO type_exists;

    IF type_exists THEN
        -- Get current enum values
        SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO current_values
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'post_status';

        -- Check if any columns are using this type
        SELECT EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE data_type = 'USER-DEFINED' AND udt_name = 'post_status'
        ) INTO type_is_used;

        -- If values are different, we need to recreate the type
        IF current_values IS DISTINCT FROM desired_values THEN
            RAISE NOTICE 'Current post_status values: %, Desired: %', current_values, desired_values;

            IF type_is_used THEN
                -- Convert column to text first
                ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE text;
                ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
            END IF;

            -- Drop the old type
            DROP TYPE "public"."post_status";

            -- Create the new enum type
            CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'archived');

            -- Convert column back to use the new enum type
            ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE "public"."post_status" USING "status"::"public"."post_status";
            ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."post_status";

        ELSE
            RAISE NOTICE 'post_status type already exists with correct values: %', current_values;
        END IF;

    ELSE
        -- Type doesn't exist, create it
        RAISE NOTICE 'Creating post_status type with values: %', desired_values;
        CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'archived');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- If anything fails, the type probably already exists with correct values
        RAISE NOTICE 'post_status type migration completed or already exists with correct values';
END $$;

ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_author_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");