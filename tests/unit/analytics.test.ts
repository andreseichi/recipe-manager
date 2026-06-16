import { describe, expect, it } from "vitest";
import {
  sanitizeAnalyticsEvent,
  sanitizeAnalyticsUrl,
} from "@/lib/analytics";

describe("analytics URL sanitization", () => {
  it("keeps a simple public URL", () => {
    expect(sanitizeAnalyticsUrl("/")).toBe("/");
  });

  it("removes query strings and hashes", () => {
    expect(sanitizeAnalyticsUrl("/recipes?q=bolo&tag=cafe&page=2#cards")).toBe(
      "/recipes",
    );
  });

  it("normalizes recipe detail URLs", () => {
    expect(sanitizeAnalyticsUrl("/recipes/clx123")).toBe("/recipes/[id]");
  });

  it("normalizes recipe edit URLs", () => {
    expect(sanitizeAnalyticsUrl("/recipes/clx123/edit?tab=main#top")).toBe(
      "/recipes/[id]/edit",
    );
  });

  it("preserves the new recipe URL", () => {
    expect(sanitizeAnalyticsUrl("/recipes/new?from=empty")).toBe(
      "/recipes/new",
    );
  });

  it("sanitizes beforeSend events", () => {
    expect(
      sanitizeAnalyticsEvent({
        type: "pageview",
        url: "/recipes/clx123?q=privado",
      }),
    ).toEqual({
      type: "pageview",
      url: "/recipes/[id]",
    });
  });
});
