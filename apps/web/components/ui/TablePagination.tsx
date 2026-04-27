'use client';

import { PAGINATION_PAGE_SIZES } from '@/hooks/usePaginatedRows';
import styles from './tablePagination.module.css';

type Props = {
  idPrefix: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  /** e.g. "عرض 0 من 0" */
  from: number;
  to: number;
};

export function TablePagination({
  idPrefix,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  from,
  to,
}: Props) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const rangeLabel =
    total === 0
      ? 'لا عناصر للعرض'
      : `عرض ${from}–${to} من ${total}`;

  return (
    <div className={styles.row} dir="rtl" role="navigation" aria-label="ترقيم الصفحات">
      <p className={styles.range} id={`${idPrefix}-range`}>
        {rangeLabel}
      </p>
      <div className={styles.controls}>
        <label className={styles.selLabel} htmlFor={`${idPrefix}-size`}>
          لكل صفحة
        </label>
        <select
          id={`${idPrefix}-size`}
          className={styles.sel}
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-describedby={`${idPrefix}-range`}
        >
          {PAGINATION_PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className={styles.btns}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="السابق"
          >
            السابق
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="التالي"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
