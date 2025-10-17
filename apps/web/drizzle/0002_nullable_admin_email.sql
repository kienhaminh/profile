-- Make admin email field nullable
ALTER TABLE "admin_users" ALTER COLUMN "email" DROP NOT NULL;
