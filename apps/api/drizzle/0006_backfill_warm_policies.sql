-- Every service needs a warm policy for the scheduler to pick it up.
INSERT INTO "warm_policies" ("service_id", "mode", "interval_minutes", "next_warm_at")
SELECT "services"."id", 'interval', 10, now()
FROM "services"
WHERE NOT EXISTS (
  SELECT 1 FROM "warm_policies" WHERE "warm_policies"."service_id" = "services"."id"
);
