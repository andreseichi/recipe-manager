import type { BeforeSendEvent } from "@vercel/analytics/next";

const ANALYTICS_URL_BASE = "https://recipe-manager.local";
const RECIPES_SEGMENT = "recipes";
const NEW_RECIPE_SEGMENT = "new";

function sanitizeAnalyticsPathname(pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPathname.split("/").filter(Boolean);

  if (segments[0] !== RECIPES_SEGMENT) {
    return normalizedPathname || "/";
  }

  if (segments.length === 2 && segments[1] !== NEW_RECIPE_SEGMENT) {
    return "/recipes/[id]";
  }

  if (
    segments.length === 3 &&
    segments[1] !== NEW_RECIPE_SEGMENT &&
    segments[2] === "edit"
  ) {
    return "/recipes/[id]/edit";
  }

  return normalizedPathname || "/";
}

export function sanitizeAnalyticsUrl(url: string) {
  try {
    const parsedUrl = new URL(url, ANALYTICS_URL_BASE);
    const sanitizedPathname = sanitizeAnalyticsPathname(parsedUrl.pathname);
    const isAbsoluteUrl = /^[a-z][a-z\d+\-.]*:/i.test(url);

    if (isAbsoluteUrl) {
      parsedUrl.pathname = sanitizedPathname;
      parsedUrl.search = "";
      parsedUrl.hash = "";
      return parsedUrl.toString();
    }

    return sanitizedPathname;
  } catch {
    const [pathname = "/"] = url.split(/[?#]/);
    return sanitizeAnalyticsPathname(pathname);
  }
}

export function sanitizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent {
  return {
    ...event,
    url: sanitizeAnalyticsUrl(event.url),
  };
}
