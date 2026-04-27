'use client';

import { useMemo, useState } from 'react';
import { adminComplaintKpis, getAdminComplaintTableRows } from '@eventaat/shared';
import { COMPLAINT_STATUS_LABELS_AR, ComplaintStatus } from '@eventaat/shared';
import {
  COMPLAINT_PRIORITY_LABELS_AR,
  COMPLAINT_CATEGORY_LABELS_AR,
  COMPLAINT_PARTY_LABELS_AR,
} from '@eventaat/shared';
import { getComplaintCommunicationLog } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { TablePagination } from '@/components/ui/TablePagination';
import { usePaginatedRows } from '@/hooks/usePaginatedRows';
import { MutedPill, StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { Timeline } from '@/components/ui/Timeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatIqTime } from '@/lib/timeFormat';
import { mockReservations } from '@eventaat/shared';

const ALL = '__all';

export function AdminComplaintsView() {
  const k = adminComplaintKpis();
  const all = getAdminComplaintTableRows();
  const [q, setQ] = useState('');
  const [st, setSt] = useState(ALL);
  const [cat, setCat] = useState(ALL);
  const [pr, setPr] = useState(ALL);
  const [party, setParty] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useMemo(() => {
    return all.filter((c) => {
      if (st !== ALL && c.status !== st) return false;
      if (cat !== ALL) {
        if (!c.category || c.category !== cat) return false;
      }
      if (pr !== ALL) {
        if (!c.priority || c.priority !== pr) return false;
      }
      if (party !== ALL) {
        if (!c.party || c.party !== party) return false;
      }
      if (q.trim()) {
        const hay = `${c.subject} ${c.customerName} ${c.restaurantName} ${c.id}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [all, st, cat, pr, party, q]);

  const filterKey = `${q}|${st}|${cat}|${pr}|${party}`;
  const pag = usePaginatedRows(list, { resetKey: filterKey });

  const row = open ? all.find((c) => c.id === open) : null;
  const logs = open ? getComplaintCommunicationLog(open) : [];
  const resRef = row?.reservationId
    ? mockReservations.find((r) => r.id === row.reservationId)
    : null;

  const stOpts = [ALL, ...Object.values(ComplaintStatus)];
  const catOpts = [ALL, 'reservation', 'service', 'billing', 'other'] as const;
  const prOpts = [ALL, 'low', 'normal', 'high', 'urgent'] as const;
  const partyOpts = [ALL, 'customer', 'restaurant', 'platform'] as const;

  return (
    <div>
      <PageHeader title="الشكاوى" subtitle="إدارة عمليات وهمية — لا إرسال فعلي." />
      <MetricGrid>
        <MetricCard label="شكاوى جديدة" value={k.newComplaints} />
        <MetricCard label="قيد المراجعة" value={k.inReview} />
        <MetricCard label="بانتظار الزبون" value={k.waitingCustomer} />
        <MetricCard label="بانتظار المطعم" value={k.waitingRestaurant} />
        <MetricCard label="مصعّدة" value={k.escalated} />
        <MetricCard label="مغلقة/محلولة" value={k.closed} />
      </MetricGrid>
      <PageToolbar>
        <SearchInput value={q} onChange={setQ} placeholder="بحث…" ariaLabel="بحث" />
        <SelectFilter
          id="c-st"
          label="الحالة"
          value={st}
          onChange={setSt}
          options={stOpts.map((o) => ({
            value: o,
            label: o === ALL ? 'الكل' : COMPLAINT_STATUS_LABELS_AR[o as keyof typeof COMPLAINT_STATUS_LABELS_AR],
          }))}
        />
        <SelectFilter
          id="c-cat"
          label="النوع"
          value={cat}
          onChange={setCat}
          options={catOpts.map((o) => ({
            value: o,
            label:
              o === ALL
                ? 'الكل'
                : COMPLAINT_CATEGORY_LABELS_AR[
                    o as 'reservation' | 'service' | 'billing' | 'other'
                  ],
          }))}
        />
        <SelectFilter
          id="c-p"
          label="الأولوية"
          value={pr}
          onChange={setPr}
          options={prOpts.map((o) => ({
            value: o,
            label:
              o === ALL
                ? 'الكل'
                : COMPLAINT_PRIORITY_LABELS_AR[
                    o as 'low' | 'normal' | 'high' | 'urgent'
                  ],
          }))}
        />
        <SelectFilter
          id="c-party"
          label="الطرف"
          value={party}
          onChange={setParty}
          options={partyOpts.map((o) => ({
            value: o,
            label:
              o === ALL
                ? 'الكل'
                : COMPLAINT_PARTY_LABELS_AR[
                    o as 'customer' | 'restaurant' | 'platform'
                  ],
          }))}
        />
      </PageToolbar>
      {list.length === 0 ? (
        <EmptyState title="لا نتائج" />
      ) : (
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>رقم</th>
                <th>النوع</th>
                <th>المطعم</th>
                <th>الزبون</th>
                <th>الحالة</th>
                <th>الأولوية</th>
                <th>آخر تحديث</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pag.pageItems.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 800, fontSize: 12 }}>{c.id}</td>
                  <td>
                    {c.category
                      ? COMPLAINT_CATEGORY_LABELS_AR[c.category]
                      : '—'}
                  </td>
                  <td>{c.restaurantName}</td>
                  <td>{c.customerName}</td>
                  <td>
                    <MutedPill>{COMPLAINT_STATUS_LABELS_AR[c.status]}</MutedPill>
                  </td>
                  <td>
                    {c.priority ? (
                      <StatusBadge kind="warning">
                        {COMPLAINT_PRIORITY_LABELS_AR[c.priority]}
                      </StatusBadge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>
                    {formatIqTime(c.lastUpdated)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <ActionButton type="button" sm variant="primary" onClick={() => setOpen(c.id)}>
                        عرض
                      </ActionButton>
                      <RowActionMenu
                        items={[
                          { id: 'r1', label: 'طلب رد المطعم', onSelect: () => setMsg('بانتظار المطعم (نموذج).') },
                          { id: 'r2', label: 'طلب معلومات من الزبون', onSelect: () => setMsg('معلومات (نموذج).') },
                          { id: 'r3', label: 'تصعيد', onSelect: () => setMsg('تصعيد (نموذج).') },
                          { id: 'r4', label: 'حل الشكوى', onSelect: () => setMsg('حل (نموذج).') },
                          { id: 'r5', label: 'إغلاق', onSelect: () => setMsg('إغلاق (نموذج).') },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableFrame>
      )}
      {list.length > 0 && (
        <TablePagination
          idPrefix="admin-cmp"
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
        open={!!row}
        title={row ? `سجل — ${row.id}` : ''}
        onClose={() => setOpen(null)}
        footer={(
          <ActionButton type="button" onClick={() => setOpen(null)} variant="secondary">
            إغلاق
          </ActionButton>
        )}
      >
        {row && (
          <>
            <p style={{ fontWeight: 800, lineHeight: 1.4, margin: '0 0 0.4rem' }}>{row.subject}</p>
            <div style={{ marginTop: 6 }}>
              <DlItem k="الحالة" v={COMPLAINT_STATUS_LABELS_AR[row.status]} />
              <DlItem k="النوع" v={row.category ? COMPLAINT_CATEGORY_LABELS_AR[row.category] : '—'} />
              <DlItem
                k="الأولوية"
                v={row.priority ? COMPLAINT_PRIORITY_LABELS_AR[row.priority] : '—'}
              />
              {row.party && (
                <DlItem
                  k="الطرف الحالي"
                  v={COMPLAINT_PARTY_LABELS_AR[row.party]}
                />
              )}
              <DlItem k="آخر تحديث" v={formatIqTime(row.lastUpdated)} />
              <DlItem k="الزبون" v={row.customerName} />
              <DlItem k="المطعم" v={row.restaurantName} />
              {resRef && (
                <>
                  <DlItem k="رقم مرتبط (حجز)" v={resRef.refCode} />
                  <DlItem k="موعد الحجز" v={formatIqTime(resRef.scheduledAt)} />
                </>
              )}
            </div>
            <h3 style={{ fontSize: '0.9rem', margin: '0.6rem 0' }}>زمني التواصل (نموذجي)</h3>
            <Timeline
              items={logs.map((e) => ({
                at: e.at,
                key: e.at,
                text: e.textAr,
              }))}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.8rem', margin: '0.5rem 0 0.2rem' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              {row.status === 'escalated' || row.priority === 'urgent'
                ? 'متابعة فورية مع المطعم ثم إثبات الرد في السجل (نموذج).'
                : 'متابعة حسب أولوية البلاغ وربطه بالحجز إن وُجد (نموذج).'}
            </p>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog
        open={!!msg}
        title="نموذج"
        message={msg ?? ''}
        onClose={() => setMsg(null)}
        onConfirm={() => {
          return;
        }}
        confirmText="متابعة"
      />
    </div>
  );
}
