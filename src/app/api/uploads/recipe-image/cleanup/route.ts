import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteBlobBestEffort } from "@/lib/images";
import { isOwnedRecipeImage } from "@/lib/image-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisicao invalido." },
      { status: 400 },
    );
  }

  const imageUrl =
    body &&
    typeof body === "object" &&
    "imageUrl" in body &&
    typeof body.imageUrl === "string"
      ? body.imageUrl
      : undefined;

  if (!imageUrl || !isOwnedRecipeImage(imageUrl, session.user.id)) {
    return NextResponse.json({ error: "Imagem invalida." }, { status: 400 });
  }

  const referencedRecipes = await prisma.recipe.count({
    where: {
      userId: session.user.id,
      imageUrl,
    },
  });

  if (referencedRecipes > 0) {
    return NextResponse.json({ deleted: false }, { status: 409 });
  }

  await deleteBlobBestEffort(imageUrl);

  return NextResponse.json({ deleted: true });
}
