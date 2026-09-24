DROP INDEX "services_endpoint_unique";--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "services_user_endpoint_unique" ON "services" USING btree ("user_id","endpoint");--> statement-breakpoint
CREATE INDEX "services_user_id_idx" ON "services" USING btree ("user_id");