CREATE TYPE "public"."post_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "author_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"avatar" text,
	"social_links" json,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "post_topics" (
	"post_id" text NOT NULL,
	"topic_id" text NOT NULL,
	CONSTRAINT "post_topics_post_id_topic_id_pk" PRIMARY KEY("post_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"status" "post_status" DEFAULT 'DRAFT' NOT NULL,
	"publish_date" timestamp,
	"content" text NOT NULL,
	"excerpt" text,
	"read_time" integer,
	"cover_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"author_id" text NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "topics_name_unique" UNIQUE("name"),
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "post_topics" ADD CONSTRAINT "post_topics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_topics" ADD CONSTRAINT "post_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_author_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author_profiles"("id") ON DELETE no action ON UPDATE no action;