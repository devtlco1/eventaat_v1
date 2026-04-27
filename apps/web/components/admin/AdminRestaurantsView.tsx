'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  getAdminRestaurantRows,
  getRestaurantById,
  getSubscriptionByRestaurantId,
  mockBranches,
  mockReservations,
  getAdminComplaintTableRows,
  mockRestaurantInternalNotes,
} from '@eventaat/shared';
import {
  RESTAURANT_STATUS_LABELS_AR,
  SUBSCRIPTION_STATUS_LABELS_AR,
  RESERVATION_STATUS_LABELS_AR,
  COMPLAINT_STATUS_LABELS_AR,
} from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { StatusBadge, MutedPill } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { TablePagination } from '@/components/ui/TablePagination';
import { usePaginatedRows } from '@/hooks/usePaginatedRows';
import { formatIqTime, formatIqDate } from '@/lib/timeFormat';
import { RestaurantStatus } from '@eventaat/shared';

const ALL = '__all';

export function AdminRestaurantsView() {
  const allRows = getAdminRestaurantRows();
  const areas = useMemo(
    () => [ALL, ...Array.from(new Set(allRows.map((r) => r.area)))],
    [allRows],
  );
  const statusOptions = [ALL, ...Object.values(RestaurantStatus)];
  const [q, setQ] = useState('');
  const [st, setSt] = useState(ALL);
  const [arF, setArF] = useState(ALL);
  const [sub, setSub] = useState(ALL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  const onProto = useCallback((m: string) => setDialog(m), []);

  const rows = useMemo(() => {
    return allRows.filter((row) => {
      const subRow = getSubscriptionByRestaurantId(row.id);
      const subK = subRow?.status ?? 'none';
      if (st !== ALL && row.status !== st) return false;
      if (arF !== ALL && row.area !== arF) return false;
      if (sub !== ALL && subK !== sub) return false;
      if (q.trim()) {
        const n = getRestaurantById(row.id);
        const hay = `${n?.name ?? ''} ${row.area}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [allRows, q, st, arF, sub]);

  const filterKey = `${q}|${st}|${arF}|${sub}`;
  const pag = usePaginatedRows(rows, { resetKey: filterKey });

  const detail = openId ? getRestaurantById(openId) : undefined;
  const br = openId ? mockBranches.filter((b) => b.restaurantId === openId) : [];
  const subs = openId ? getSubscriptionByRestaurantId(openId) : undefined;
  const resR = openId
    ? mockReservations.filter((x) => x.restaurantId === openId).slice(0, 5)
    : [];
  const allCmp = getAdminComplaintTableRows();
  const cmpR = openId
    ? allCmp.filter(
        (c) =>
          c.restaurantId === openId ||
          (c.reservationId &&
            mockReservations.find((r) => r.id === c.reservationId && r.restaurantId === openId)),
      )
    : [];

  return (
    <div>
      <PageHeader title="إدارة المطاعم" subtitle="بحث وتصفية على الجهة فقط (نموذج تجريبي)." />
      <PageToolbar>
        <SearchInput value={q} onChange={setQ} placeholder="بحث بالاسم…" ariaLabel="بحث" />
        <SelectFilter
          id="f-s"
          label="الحالة"
          value={st}
          onChange={setSt}
          options={statusOptions.map((o) => ({
            value: o,
            label: o === ALL ? 'الكل' : RESTAURANT_STATUS_LABELS_AR[o as keyof typeof RESTAURANT_STATUS_LABELS_AR],
          }))}
        />
        <SelectFilter
          id="f-a"
          label="المنطقة"
          value={arF}
          onChange={setArF}
          options={areas.map((o) => ({ value: o, label: o === ALL ? 'الكل' : o }))}
        />
        <SelectFilter
          id="f-sub"
          label="الاشتراك"
          value={sub}
          onChange={setSub}
          options={[
            { value: ALL, label: 'الكل' },
            { value: 'trial_active', label: 'تجريبي' },
            { value: 'active', label: 'فعّال' },
            { value: 'payment_due', label: 'مستحق' },
            { value: 'overdue', label: 'متأخر' },
            { value: 'suspended', label: 'مُعلّق' },
            { value: 'cancelled', label: 'ملغى' },
            { value: 'none', label: '—' },
          ]}
        />
      </PageToolbar>
      {rows.length === 0 ? (
        <EmptyState title="لا نتائج مطابقة" />
      ) : (
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>اسم المطعم</th>
                <th>المنطقة</th>
                <th>الحالة</th>
                <th>عدد الفروع</th>
                <th>حجوزات اليوم</th>
                <th>الاشتراك</th>
                <th>مؤشر الجودة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pag.pageItems.map((row) => {
                const srow = getSubscriptionByRestaurantId(row.id);
                const subLabel = srow
                  ? SUBSCRIPTION_STATUS_LABELS_AR[srow.status]
                  : '—';
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 800 }}>{row.name}</td>
                    <td>{row.area}</td>
                    <td>
                      <MutedPill>{RESTAURANT_STATUS_LABELS_AR[row.status]}</MutedPill>
                    </td>
                    <td>{row.branchCount}</td>
                    <td>{row.reservationsToday}</td>
                    <td>{subLabel}</td>
                    <td>
                      <StatusBadge kind="ok">{row.qualityScore.toFixed(1)}</StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <ActionButton type="button" sm variant="primary" onClick={() => setOpenId(row.id)}>
                          عرض
                        </ActionButton>
                        <RowActionMenu
                          items={[
                            { id: 'a1', label: 'تفعيل', onSelect: () => onProto('تسجيل تفعيل (نموذج).') },
                            { id: 'a2', label: 'طلب تعديلات', onSelect: () => onProto('طلب تعديلات (نموذج).') },
                            { id: 'a3', label: 'تعطيل الحجوزات', onSelect: () => onProto('تعطيل الحجوزات (نموذج).') },
                            { id: 'a4', label: 'تعليق', onSelect: () => onProto('تعليق (نموذج).') },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableFrame>
      )}
      {rows.length > 0 && (
        <TablePagination
          idPrefix="admin-rest"
          total={pag.total}
          from={pag.from}
          to={pag.to}
          page={pag.page}
          pageSize={pag.pageSize}
          totalPages={pag.totalPages}
          onPageChange={pag.setPage}
          onPageSizeChange={pag.setPageSize}
        />
      )}
      <DetailDrawer
        open={!!detail}
        title={detail?.name ?? ''}
        onClose={() => setOpenId(null)}
        footer={(
          <ActionButton type="button" variant="secondary" onClick={() => setOpenId(null)}>
            إغلاق
          </ActionButton>
        )}
      >
        {detail && (
          <>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.4rem' }}>معلومات أساسية</h3>
            <div>
              <DlItem k="المنطقة" v={detail.area} />
              <DlItem k="وصف" v={detail.description} />
              <DlItem k="تقييم" v={String(detail.ratingMock)} />
            </div>
            <h3 style={{ fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }}>الفروع</h3>
            <ul style={{ margin: 0, paddingInlineStart: '1.1rem' }}>
              {br.map((b) => (
                <li key={b.id} style={{ margin: '0.2rem 0' }}>
                  {b.name} — {b.address}
                </li>
              ))}
            </ul>
            <h3 style={{ fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }}>الاشتراك</h3>
            {subs ? (
              <div>
                <DlItem k="الحالة" v={SUBSCRIPTION_STATUS_LABELS_AR[subs.status]} />
                <DlItem
                  k="نهاية الفترة المجانية"
                  v={subs.trialEndsOn ? formatIqDate(subs.trialEndsOn) : '—'}
                />
                <DlItem k="الشهري" v={`${subs.monthlyAmountIqd.toLocaleString('ar-IQ')} د.ع`} />
                <DlItem k="الإجراء القادم" v={subs.nextActionAr ?? '—'} />
              </div>
            ) : (
              <p>—</p>
            )}
            <h3 style={{ fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }}>حجوزات أخيرة</h3>
            <ul style={{ margin: 0, paddingInlineStart: '1.1rem' }}>
              {resR.map((r) => (
                <li key={r.id} style={{ margin: '0.2rem 0' }}>
                  {r.refCode} — {formatIqTime(r.scheduledAt)} — {RESERVATION_STATUS_LABELS_AR[r.status]}
                </li>
              ))}
            </ul>
            <h3 style={{ fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }}>الشكاوى</h3>
            {cmpR.length ? (
              <ul style={{ margin: 0, paddingInlineStart: '1.1rem' }}>
                {cmpR.map((c) => (
                  <li key={c.id} style={{ margin: '0.25rem 0' }}>
                    {c.subject} — {COMPLAINT_STATUS_LABELS_AR[c.status]}
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
            <h3 style={{ fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }}>ملاحظات داخلية</h3>
            <p style={{ color: '#475569', lineHeight: 1.4 }}>{mockRestaurantInternalNotes[openId!] ?? '—'}</p>
            <h3 style={{ fontSize: '0.8rem', margin: '0.6rem 0 0.25rem' }}>الخطوة المقترحة</h3>
            <p style={{ color: '#475569', lineHeight: 1.4, fontSize: 12, fontWeight: 800, margin: 0 }}>
              مراجعة بيانات المطعم واشتراكه ثم تثبيت المسار في إدارة التشغيل (نموذج).
            </p>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog
        open={!!dialog}
        title="نموذج"
        message={dialog ?? ''}
        onClose={() => setDialog(null)}
        onConfirm={() => {}}
        confirmText="حسناً"
      />
    </div>
  );
}
