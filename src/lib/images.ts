import "server-only";

import { del } from "@vercel/blob";

export async function deleteBlobBestEffort(imageUrl: string | null) {
  if (!imageUrl || !process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    await del(imageUrl);
  } catch (error) {
    console.error("Failed to remove recipe image from Vercel Blob.", error);
  }
}
