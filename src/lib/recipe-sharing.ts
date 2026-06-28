import { randomBytes } from "node:crypto";

export const SHARE_TOKEN_BYTE_LENGTH = 32;
export const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

export function createShareToken() {
  return randomBytes(SHARE_TOKEN_BYTE_LENGTH).toString("base64url");
}

export function isShareToken(value: string) {
  return SHARE_TOKEN_PATTERN.test(value);
}

export function getPublicRecipePath(token: string) {
  return `/receitas/${encodeURIComponent(token)}`;
}
