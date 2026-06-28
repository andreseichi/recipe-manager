CREATE TABLE "release_acknowledgement" (
    "id" TEXT NOT NULL,
    "releaseId" VARCHAR(80) NOT NULL,
    "userId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "release_acknowledgement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "release_acknowledgement_releaseId_idx" ON "release_acknowledgement"("releaseId");
CREATE UNIQUE INDEX "release_acknowledgement_userId_releaseId_key" ON "release_acknowledgement"("userId", "releaseId");

ALTER TABLE "release_acknowledgement" ADD CONSTRAINT "release_acknowledgement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
