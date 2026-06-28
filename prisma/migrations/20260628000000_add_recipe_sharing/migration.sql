ALTER TABLE "recipe" ADD COLUMN "shareToken" VARCHAR(80);
ALTER TABLE "recipe" ADD COLUMN "sharedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "recipe_shareToken_key" ON "recipe"("shareToken");
