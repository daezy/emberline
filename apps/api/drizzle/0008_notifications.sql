CREATE TABLE "notification_preferences" (
	"user_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"event" text NOT NULL,
	"enabled" boolean NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_channel_event_pk" PRIMARY KEY("user_id","channel","event")
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "consecutive_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "down_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "cold_starts_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;