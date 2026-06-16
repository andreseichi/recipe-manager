import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthorizedError";
  }
}

export const getCurrentSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  return session.user;
}
