import { describe, expect, it } from "vitest";
import { getPaginationState } from "@/lib/pagination";

describe("pagination state", () => {
  it("keeps the first page when it is valid", () => {
    expect(
      getPaginationState({
        requestedPage: 1,
        total: 25,
        perPage: 12,
      }),
    ).toEqual({
      page: 1,
      totalPages: 3,
    });
  });

  it("normalizes zero and negative pages to the first page", () => {
    expect(
      getPaginationState({
        requestedPage: 0,
        total: 25,
        perPage: 12,
      }),
    ).toEqual({
      page: 1,
      totalPages: 3,
    });
  });

  it("normalizes pages above the total to the last available page", () => {
    expect(
      getPaginationState({
        requestedPage: 99,
        total: 25,
        perPage: 12,
      }),
    ).toEqual({
      page: 3,
      totalPages: 3,
    });
  });

  it("keeps empty result sets on page one", () => {
    expect(
      getPaginationState({
        requestedPage: 9,
        total: 0,
        perPage: 12,
      }),
    ).toEqual({
      page: 1,
      totalPages: 1,
    });
  });
});
