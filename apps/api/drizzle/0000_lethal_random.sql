CREATE TYPE "public"."service_status" AS ENUM('warm', 'warming', 'cold', 'sleeping', 'down', 'paused');--> statement-breakpoint
CREATE TYPE "public"."warm_policy_mode" AS ENUM('interval', 'schedule', 'manual');--> statement-breakpoint
CREATE TABLE "cold_start_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"readiness_check_id" uuid,
	"baseline_latency_ms" integer NOT NULL,
	"observed_latency_ms" integer NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "readiness_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"status" "service_status" NOT NULL,
	"response_status" integer,
	"latency_ms" integer,
	"cold_start_suspected" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"endpoint" text NOT NULL,
	"status" "service_status" DEFAULT 'cold' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warm_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"mode" "warm_policy_mode" DEFAULT 'interval' NOT NULL,
	"interval_minutes" integer,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"schedule" jsonb,
	"next_warm_at" timestamp with time zone,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cold_start_events" ADD CONSTRAINT "cold_start_events_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cold_start_events" ADD CONSTRAINT "cold_start_events_readiness_check_id_readiness_checks_id_fk" FOREIGN KEY ("readiness_check_id") REFERENCES "public"."readiness_checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readiness_checks" ADD CONSTRAINT "readiness_checks_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warm_policies" ADD CONSTRAINT "warm_policies_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cold_start_events_service_detected_at_index" ON "cold_start_events" USING btree ("service_id","detected_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cold_start_events_check_unique" ON "cold_start_events" USING btree ("readiness_check_id");--> statement-breakpoint
CREATE INDEX "readiness_checks_service_checked_at_index" ON "readiness_checks" USING btree ("service_id","checked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "services_endpoint_unique" ON "services" USING btree ("endpoint");--> statement-breakpoint
CREATE UNIQUE INDEX "warm_policies_service_unique" ON "warm_policies" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "warm_policies_next_warm_at_index" ON "warm_policies" USING btree ("next_warm_at");