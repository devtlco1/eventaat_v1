import { useEffect, useMemo, useRef, useState } from 'react';

export const PAGINATION_PAGE_SIZES = [10, 20, 50] as const;

type Options = {
  /** Resets to page 1 when this value changes (e.g. serialized filter state). */
  resetKey: string;
  defaultPageSize?: (typeof PAGINATION_PAGE_SIZES)[number];
};

/**
 * Client-side only: slices `items` for the current page. Resets to page 1 when `resetKey` changes
 * or when `pageSize` is changed (via setPageSize).
 */
export function usePaginatedRows<T>(items: T[], options: Options) {
  const { resetKey, defaultPageSize = 10 } = options;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = useMemo(
    () => (total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize))),
    [total, pageSize],
  );

  const resetKeyRef = useRef<string>(resetKey);
  useEffect(() => {
    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      setPage(1);
      return;
    }
    setPage((p) => Math.min(p, totalPages));
  }, [resetKey, totalPages]);

  const setPageSize = (n: number) => {
    if (!PAGINATION_PAGE_SIZES.includes(n as 10 | 20 | 50)) return;
    setPageSizeState(n as 10 | 20 | 50);
    setPage(1);
  };

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = useMemo(
    () => items.slice(start, start + pageSize),
    [items, start, pageSize],
  );

  const from = total === 0 ? 0 : start + 1;
  const to = total === 0 ? 0 : Math.min(start + pageSize, total);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    pageItems,
    from,
    to,
  };
}
