'use client';

import { useMemo, useState } from 'react';
import {
  callCenterReservationsBySection,
  getUserById,
  getRestaurantById,
  mockBranches,
  getReservationCommunicationLog,
} from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { MutedPill } from '@/components/dashboard/StatusBadge';
import { formatIqTime } from '@/lib/timeFormat';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { TablePagination } from '@/components/ui/TablePagination';
import { usePaginatedRows } from '@/hooks/usePaginatedRows';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { Timeline } from '@/components/ui/Timeline';

export function CallCenterReservationsView() {
  const { pendingRestaurant, near, late, confirm } = callCenterReservationsBySection();
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const all = useMemo(
    () => [...pendingRestaurant, ...near, ...late, ...confirm],
    [pendingRestaurant, near, late, confirm],
  );
  const unique = useMemo(() => {
    const byId = new Map(all.map((r) => [r.id, r]));
    return Array.from(byId.values());
  }, [all]);
  const pag = usePaginatedRows(unique, { resetKey: 'cc-res-table' });
  const row = open ? unique.find((x) => x.id === open) : null;
  const uRow = row ? getUserById(row.customerId) : null;
  const restRow = row ? getRestaurantById(row.restaurantId) : null;
  const brRow = row ? mockBranches.find((b) => b.id === row.branchId) : null;
  const comm = row ? getReservationCommunicationLog(row.id) : [];

  return (
    <div>
      <PageHeader title="متابعة الحجوزات" subtitle="أقسام أولية (نموذج عينة)." />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <SectionCard title="طلبات بانتظار المطعم">
          {pendingRestaurant.map((r) => {
            const u = getUserById(r.customerId);
            return (
              <div
                key={r.id}
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  borderBottom: '1px solid #f1f5f9',
                  padding: '0.2rem 0',
                }}
              >
                {r.refCode} — {u?.displayName}
              </div>
            );
          })}
        </SectionCard>
        <SectionCard title="قريبة">
          {near.map((r) => (
            <div
              key={r.id}
              style={{
                fontSize: 12,
                fontWeight: 800,
                borderBottom: '1px solid #f1f5f9',
                padding: '0.2rem 0',
              }}
            >
              {r.refCode}
            </div>
          ))}
        </SectionCard>
        <SectionCard title="متأخرة">
          {late.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, color: '#9f1239' }}>
              {r.refCode}
            </div>
          ))}
        </SectionCard>
        <SectionCard title="تأكيد/بديل">
          {confirm.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, padding: '0.2rem 0' }}>
              {r.refCode}
            </div>
          ))}
        </SectionCard>
      </div>
      <SectionCard title="سجل سريع">
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>رقم</th>
                <th>الزبون</th>
                <th>المطعم</th>
                <th>الوقت</th>
                <th>الحالة</th>
                <th>سبب المتابعة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {pag.pageItems.map((r) => {
                const u = getUserById(r.customerId);
                const rest = getRestaurantById(r.restaurantId);
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800 }}>{r.refCode}</td>
                    <td style={{ fontSize: 12 }}>{u?.displayName}</td>
                    <td style={{ fontSize: 12, fontWeight: 800 }}>{rest?.name}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatIqTime(r.scheduledAt)}</td>
                    <td>
                      <MutedPill>{RESERVATION_STATUS_LABELS_AR[r.status]}</MutedPill>
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        maxWidth: 180,
                        lineHeight: 1.3,
                        fontWeight: 800,
                        color: '#64748b',
                      }}
                    >
                      {r.callCenterNoteAr ?? r.note ?? 'متابعة عامة'}
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <ActionButton type="button" sm variant="primary" onClick={() => setOpen(r.id)}>
                          عرض
                        </ActionButton>
                        <RowActionMenu
                          label="اتصال"
                          items={[
                            {
                              id: '1',
                              label: 'تواصل مع المطعم',
                              onSelect: () => setMsg('اتصال مطعم (نموذج).'),
                            },
                            {
                              id: '2',
                              label: 'تواصل مع الزبون',
                              onSelect: () => setMsg('اتصال زبون (نموذج).'),
                            },
                            { id: '3', label: 'إرسال تذكير', onSelect: () => setMsg('تذكير (نموذج).') },
                            { id: '4', label: 'تسجيل ملاحظة', onSelect: () => setMsg('ملاحظة (نموذج).') },
                            { id: '5', label: 'تصعيد', onSelect: () => setMsg('تصعيد (نموذج).') },
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
        {unique.length > 0 && (
          <TablePagination
            idPrefix="cc-resv"
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
      </SectionCard>
      <DetailDrawer
        open={!!row}
        title={row ? row.refCode : ''}
        onClose={() => setOpen(null)}
        footer={(
          <ActionButton type="button" onClick={() => setOpen(null)} variant="secondary">
            إغلاق
          </ActionButton>
        )}
      >
        {row && (
          <>
            <h3 style={{ fontSize: '0.8rem', margin: '0 0 0.3rem', color: '#64748b' }}>ملخص</h3>
            <div>
              <DlItem k="الحالة" v={RESERVATION_STATUS_LABELS_AR[row.status]} />
              <DlItem k="الزبون" v={uRow?.displayName ?? '—'} />
              {uRow?.phone && <DlItem k="هاتف" v={uRow.phone} />}
              <DlItem k="المطعم" v={restRow?.name ?? '—'} />
              <DlItem k="الفرع" v={brRow?.name ?? row.branchId} />
              {brRow?.defaultHoursAr && <DlItem k="ساعات الفرع" v={brRow.defaultHoursAr} />}
              <DlItem k="الموعد" v={formatIqTime(row.scheduledAt)} />
              {row.note && <DlItem k="ملاحظة" v={row.note} />}
              {row.callCenterNoteAr && <DlItem k="متابعة" v={row.callCenterNoteAr} />}
            </div>
            <h3 style={{ fontSize: '0.85rem', margin: '0.55rem 0' }}>سجل التواصل (نموذجي)</h3>
            <Timeline
              items={comm.map((e) => ({ at: e.at, text: e.textAr, key: e.at }))}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.8rem', margin: '0.4rem 0' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              {row.status === 'pending' ? 'تأكيد أولوية الرد وتوثيق آخر مكالمة (نموذج).' : 'متابعة حسب السبب (نموذج).'}
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
        confirmText="حسناً"
      />
    </div>
  );
}
