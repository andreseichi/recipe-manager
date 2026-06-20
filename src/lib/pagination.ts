export type PaginationState = {
  page: number;
  totalPages: number;
};

export function getPaginationState({
  requestedPage,
  total,
  perPage,
}: {
  requestedPage: number;
  total: number;
  perPage: number;
}): PaginationState {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const sanitizedPage = Math.max(1, Math.trunc(requestedPage) || 1);

  return {
    page: Math.min(sanitizedPage, totalPages),
    totalPages,
  };
}
