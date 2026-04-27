'use client';

import { useState } from 'react';
import { callCenterReservationsBySection, getUserById, getRestaurantById } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { MutedPill } from '@/components/dashboard/StatusBadge';
import { formatIqTime } from '@/lib/timeFormat';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function CallCenterReservationsView() {
  const { pendingRestaurant, near, late, confirm } = callCenterReservationsBySection();
  const [msg, setMsg] = useState<string | null>(null);
  const all = [...pendingRestaurant, ...near, ...late, ...confirm];
  const byId = new Map(all.map((r) => [r.id, r]));
  const unique = Array.from(byId.values());

  return (
    <div>
      <PageHeader title="متابعة الحجوزات" subtitle="أقسام أولية (نموذج عينة)." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 8, marginBottom: 10 }}>
        <SectionCard title="طلبات بانتظار المطعم">
          {pendingRestaurant.map((r) => {
            const u = getUserById(r.customerId);
            return (
              <div key={r.id} style={{ fontSize: 12, fontWeight: 800, borderBottom: '1px solid #f1f5f9', padding: '0.2rem 0' }}>
                {r.refCode} — {u?.displayName}
              </div>
            );
          })}
        </SectionCard>
        <SectionCard title="قريبة">
          {near.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, borderBottom: '1px solid #f1f5f9', padding: '0.2rem 0' }}>{r.refCode}</div>
          ))}
        </SectionCard>
        <SectionCard title="متأخرة">
          {late.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, color: '#9f1239' }}>{r.refCode}</div>
          ))}
        </SectionCard>
        <SectionCard title="تأكيد/بديل">
          {confirm.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, padding: '0.2rem 0' }}>{r.refCode}</div>
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
              {unique.map((r) => {
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
                    <td style={{ fontSize: 12, maxWidth: 180, lineHeight: 1.3, fontWeight: 800, color: '#64748b' }}>{r.callCenterNoteAr ?? r.note ?? 'متابعة عامة'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                        <ActionButton type="button" sm variant="primary" onClick={() => setMsg('اتصال مطعم (نموذج).')}>
                          المطعم
                        </ActionButton>
                        <ActionButton
                          type="button"
                          sm
                          variant="secondary"
                          onClick={() => setMsg('اتصال زبون (نموذج).')}
                        >
                          الزبون
                        </ActionButton>
                        <ActionButton
                          type="button"
                          sm
                          variant="secondary"
                          onClick={() => setMsg('تذكير (نموذج).')}
                        >
                          تذكير
                        </ActionButton>
                        <ActionButton
                          type="button"
                          sm
                          variant="secondary"
                          onClick={() => setMsg('ملاحظة (نموذج).')}
                        >
                          ملاحظة
                        </ActionButton>
                        <ActionButton
                          type="button"
                          sm
                          variant="secondary"
                          onClick={() => setMsg('تصعيد (نموذج).')}
                        >
                          تصعيد
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableFrame>
      </SectionCard>
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
