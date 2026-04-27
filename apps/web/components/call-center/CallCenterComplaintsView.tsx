'use client';

import { useMemo, useState } from 'react';
import { getAdminComplaintTableRows, getComplaintCommunicationLog, mockReservations, mockRestaurants } from '@eventaat/shared';
import { COMPLAINT_STATUS_LABELS_AR, ComplaintStatus } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { MutedPill } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { Timeline } from '@/components/ui/Timeline';
import { formatIqTime } from '@/lib/timeFormat';
import { COMPLAINT_PRIORITY_LABELS_AR } from '@eventaat/shared';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const ALL = '__all';

const openish = (c: { status: (typeof ComplaintStatus)[keyof typeof ComplaintStatus] }) =>
  c.status !== ComplaintStatus.closed && c.status !== ComplaintStatus.resolved;

export function CallCenterComplaintsView() {
  const all = getAdminComplaintTableRows().filter(openish);
  const [st, setSt] = useState(ALL);
  const [pr, setPr] = useState(ALL);
  const [rest, setRest] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useMemo(() => {
    return all.filter((c) => {
      if (st !== ALL && c.status !== st) return false;
      if (pr !== ALL) {
        if (!c.priority || c.priority !== pr) return false;
      }
      if (rest !== ALL) {
        const resv = c.reservationId
          ? mockReservations.find((r) => r.id === c.reservationId)
          : null;
        const rid = c.restaurantId ?? resv?.restaurantId;
        if (rid !== rest) return false;
      }
      return true;
    });
  }, [all, st, pr, rest]);

  const row = open ? all.find((c) => c.id === open) : null;
  const log = open ? getComplaintCommunicationLog(open) : [];
  const resv = row?.reservationId
    ? mockReservations.find((r) => r.id === row.reservationId)
    : null;

  const stOpts = [ALL, ...Object.values(ComplaintStatus).filter((s) => s !== 'closed' && s !== 'resolved')];
  const rOpts = [
    { value: ALL, label: 'الكل' },
    ...mockRestaurants.map((r) => ({ value: r.id, label: r.name })),
  ];
  const prOpts = [ALL, 'low', 'normal', 'high', 'urgent'] as const;

  return (
    <div>
      <PageHeader title="متابعة الشكاوى" subtitle="واجهة وهمية — مُسنَدة للوكيل في العينة." />
      <PageToolbar>
        <SelectFilter
          id="cc-s"
          label="الحالة"
          value={st}
          onChange={setSt}
          options={stOpts.map((o) => ({
            value: o,
            label: o === ALL ? 'الكل' : COMPLAINT_STATUS_LABELS_AR[o as keyof typeof COMPLAINT_STATUS_LABELS_AR],
          }))}
        />
        <SelectFilter
          id="cc-p"
          label="الأولوية"
          value={pr}
          onChange={setPr}
          options={prOpts.map((o) => ({
            value: o,
            label: o === ALL ? 'الكل' : COMPLAINT_PRIORITY_LABELS_AR[o as 'low' | 'normal' | 'high' | 'urgent'],
          }))}
        />
        <SelectFilter
          id="cc-r"
          label="المطعم"
          value={rest}
          onChange={setRest}
          options={rOpts}
        />
      </PageToolbar>
      {list.length === 0 ? (
        <EmptyState title="لا بيانات مطابقة" />
      ) : (
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>رقم</th>
                <th>الوصف</th>
                <th>الحالة</th>
                <th>مطعم</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontSize: 11, fontWeight: 800 }}>{c.id}</td>
                  <td style={{ maxWidth: 220, lineHeight: 1.3, fontSize: 12, fontWeight: 800 }}>{c.subject}</td>
                  <td>
                    <MutedPill>{COMPLAINT_STATUS_LABELS_AR[c.status]}</MutedPill>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 800 }}>{c.restaurantName}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <ActionButton type="button" sm variant="primary" onClick={() => setOpen(c.id)}>
                        عرض
                      </ActionButton>
                      <RowActionMenu
                        label="متابعة"
                        items={[
                          { id: '1', label: 'الاتصال بالزبون', onSelect: () => setMsg('مكالمة زبون (نموذج).') },
                          { id: '2', label: 'الاتصال بالمطعم', onSelect: () => setMsg('مكالمة مطعم (نموذج).') },
                          { id: '3', label: 'طلب معلومات', onSelect: () => setMsg('معلومات (نموذج).') },
                          { id: '4', label: 'إضافة ملاحظة', onSelect: () => setMsg('ملاحظة (نموذج).') },
                          { id: '5', label: 'تصعيد', onSelect: () => setMsg('تصعيد (نموذج).') },
                          { id: '6', label: 'إغلاق متابعة', onSelect: () => setMsg('تعليق (نموذج).') },
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
            <div>
              <DlItem k="الحالة" v={COMPLAINT_STATUS_LABELS_AR[row.status]} />
              <DlItem k="الزبون" v={row.customerName} />
              <DlItem k="مطعم" v={row.restaurantName} />
              {row.priority && (
                <DlItem
                  k="الأولوية"
                  v={COMPLAINT_PRIORITY_LABELS_AR[row.priority]}
                />
              )}
              {resv && (
                <>
                  <DlItem k="رقم مرتبط" v={resv.refCode} />
                  <DlItem k="موعد الحجز" v={formatIqTime(resv.scheduledAt)} />
                </>
              )}
            </div>
            <h3 style={{ fontSize: '0.9rem', margin: '0.6rem 0' }}>سجل (نموذجي)</h3>
            <Timeline
              items={log.map((e) => ({ at: e.at, text: e.textAr, key: e.at }))}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.8rem', margin: '0.4rem 0' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              توثيق الاتصال وتحديث أولوية الملف حسب الرد (نموذج).
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
