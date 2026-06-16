import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  MAX_RECIPE_IMAGE_BYTES,
  RECIPE_IMAGE_TYPES,
} from "@/lib/image-constraints";
import { getRecipeImagePrefix } from "@/lib/image-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const prefix = getRecipeImagePrefix(session.user.id);
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const validPathname = new RegExp(
          `^${escapedPrefix}[0-9a-f-]{36}\\.(jpe?g|png|webp)$`,
          "i",
        ).test(pathname);

        if (!validPathname) {
          throw new Error("Caminho de upload inválido.");
        }

        return {
          allowedContentTypes: [...RECIPE_IMAGE_TYPES],
          maximumSizeInBytes: MAX_RECIPE_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload ?? "{}") as {
          userId?: string;
        };

        if (
          !payload.userId ||
          !blob.pathname.startsWith(getRecipeImagePrefix(payload.userId))
        ) {
          throw new Error("Upload callback validation failed.");
        }
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível enviar a imagem.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
