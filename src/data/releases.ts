import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getLatestRelease,
  getPendingReleaseForSeenIds,
  isKnownReleaseId,
} from "@/lib/releases";

export class InvalidReleaseError extends Error {
  constructor() {
    super("Invalid release.");
    this.name = "InvalidReleaseError";
  }
}

export async function getPendingReleaseForUser(userId: string) {
  const latestRelease = getLatestRelease();

  if (!latestRelease) return null;

  const acknowledgement = await prisma.releaseAcknowledgement.findUnique({
    where: {
      userId_releaseId: {
        userId,
        releaseId: latestRelease.id,
      },
    },
    select: {
      releaseId: true,
    },
  });

  return getPendingReleaseForSeenIds(
    acknowledgement ? [acknowledgement.releaseId] : [],
  );
}

export async function acknowledgeReleaseForUser(
  userId: string,
  releaseId: string,
) {
  if (!isKnownReleaseId(releaseId)) {
    throw new InvalidReleaseError();
  }

  await prisma.releaseAcknowledgement.upsert({
    where: {
      userId_releaseId: {
        userId,
        releaseId,
      },
    },
    update: {
      seenAt: new Date(),
    },
    create: {
      userId,
      releaseId,
    },
  });
}
