DROP INDEX IF EXISTS "recipe_userId_updatedAt_idx";

CREATE INDEX "recipe_userId_createdAt_id_idx" ON "recipe"("userId", "createdAt", "id");
