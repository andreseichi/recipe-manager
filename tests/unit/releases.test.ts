import { describe, expect, it } from "vitest";
import {
  getLatestRelease,
  getPendingReleaseForSeenIds,
  type AppRelease,
} from "@/lib/releases";

const releases: AppRelease[] = [
  {
    id: "2026-06-01-first",
    version: "0.1.0",
    releasedAt: "2026-06-01",
    title: "Primeira versao",
    changes: ["Criacao do caderno de receitas."],
  },
  {
    id: "2026-06-20-second",
    version: "0.2.0",
    releasedAt: "2026-06-20",
    title: "Segunda versao",
    changes: ["Melhorias na busca."],
  },
];

describe("app releases", () => {
  it("selects the most recent release", () => {
    expect(getLatestRelease(releases)).toEqual(releases[1]);
  });

  it("returns null when there are no releases", () => {
    expect(getLatestRelease([])).toBeNull();
  });

  it("detects that the latest release was not seen by the user", () => {
    expect(getPendingReleaseForSeenIds([releases[0].id], releases)).toEqual(
      releases[1],
    );
  });

  it("does not return a pending release after the user has seen the latest", () => {
    expect(getPendingReleaseForSeenIds([releases[1].id], releases)).toBeNull();
  });
});
