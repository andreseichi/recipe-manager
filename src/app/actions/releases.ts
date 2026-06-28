"use server";

import { revalidatePath } from "next/cache";
import {
  acknowledgeReleaseForUser,
  InvalidReleaseError,
} from "@/data/releases";
import { requireCurrentUser, UnauthorizedError } from "@/lib/session";

export type ReleaseActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function markReleaseAsSeen(
  _previousState: ReleaseActionState,
  formData: FormData,
): Promise<ReleaseActionState> {
  const releaseId = String(formData.get("releaseId") ?? "").trim();

  if (!releaseId) {
    return {
      status: "error",
      message: "Atualizacao invalida.",
    };
  }

  try {
    const user = await requireCurrentUser();
    await acknowledgeReleaseForUser(user.id, releaseId);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        status: "error",
        message: "Sua sessao expirou. Entre novamente para continuar.",
      };
    }

    if (error instanceof InvalidReleaseError) {
      return {
        status: "error",
        message: "Nao foi possivel encontrar essa atualizacao.",
      };
    }

    console.error(error);
    return {
      status: "error",
      message: "Nao foi possivel marcar as novidades como vistas.",
    };
  }

  revalidatePath("/recipes", "layout");

  return {
    status: "success",
  };
}
