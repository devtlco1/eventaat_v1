'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  adminReservationKpis,
  getAdminReservationTableRows,
  getRestaurantById,
  getReservationCommunicationLog,
} from '@eventaat/shared';
import { mockBranches, ReservationStatus, getUserById } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR, MOCK_DEMO_TODAY } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { MutedPill, StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { Timeline } from '@/components/ui/Timeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatIqTime } from '@/lib/timeFormat';
import { followupLabelAr } from '@/lib/followupAr';
import { RowActionMenu } from '@/components/ui/RowActionMenu';

const ALL = '__all';

const restaurantsOptions = () => {
  const ids = Array.from(new Set(getAdminReservationTableRows().map((r) => r.restaurantId)));
  return ids
    .map((id) => {
      const r = getRestaurantById(id);
      return { value: id, label: r?.name ?? id };
    })
    .filter((x, i, a) => a.findIndex((y) => y.value === x.value) === i);
};

const branchOpts = (rest: string) => {
  if (rest === ALL) {
    return mockBranches.map((b) => ({ value: b.id, label: b.name }));
  }
  return mockBranches
    .filter((b) => b.restaurantId === rest)
    .map((b) => ({ value: b.id, label: b.name }));
};

export function AdminReservationsView() {
  const k = adminReservationKpis();
  const all = getAdminReservationTableRows();
  const [q, setQ] = useState('');
  const [st, setSt] = useState(ALL);
  const [d, setD] = useState(ALL);
  const [resId, setResId] = useState(ALL);
  const [br, setBr] = useState(ALL);
  const [fu, setFu] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setBr(ALL);
  }, [resId]);

  const list = useMemo(() => {
    return all.filter((r) => {
      if (st !== ALL && r.status !== st) return false;
      if (d !== ALL && r.scheduledAt.slice(0, 10) !== d) return false;
      if (resId !== ALL && r.restaurantId !== resId) return false;
      if (br !== ALL && r.branchId !== br) return false;
      if (fu === 'yes' && !r.needsAdminFollowup) return false;
      if (fu === 'no' && r.needsAdminFollowup) return false;
      if (q.trim()) {
        const hay = `${r.refCode} ${r.customerName} ${r.restaurantName}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [all, st, d, resId, br, fu, q]);

  const row = open ? all.find((x) => x.id === open) : null;
  const rowUser = row ? getUserById(row.customerId) : null;
  const resLog = row ? getReservationCommunicationLog(row.id) : [];
  const brRow = row ? mockBranches.find((b) => b.id === row.branchId) : undefined;

  const stOpts = [ALL, ...Object.values(ReservationStatus)] as string[];

  return (
    <div>
      <PageHeader title="رصد الحجوزات" subtitle="نموذج: تصفية محلية — لا بيانات حيّة." />
      <MetricGrid>
        <MetricCard label="بانتظار المطعم" value={k.pendingRestaurant} />
        <MetricCard label="مؤكدة" value={k.confirmed} />
        <MetricCard label="متأخرة" value={k.late} />
        <MetricCard label="احتمال عدم حضور" value={k.noShowCandidate} />
        <MetricCard label="ملغية" value={k.cancelled} />
        <MetricCard label="منتهية" value={k.completed} />
      </MetricGrid>
      <PageToolbar>
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="رقم/زبون/مطعم…"
          ariaLabel="بحث"
        />
        <SelectFilter
          id="d-d"
          label="التاريخ"
          value={d}
          onChange={setD}
          options={[
            { value: ALL, label: 'الكل' },
            { value: MOCK_DEMO_TODAY, label: 'يوم العينة' },
            { value: '2026-04-28', label: '٢٨-٠٤' },
            { value: '2026-04-30', label: '٣٠-٠٤' },
          ]}
        />
        <SelectFilter
          id="d-s"
          label="الحالة"
          value={st}
          onChange={setSt}
          options={stOpts.map((o) => ({
            value: o,
            label: o === ALL ? 'الكل' : RESERVATION_STATUS_LABELS_AR[o as keyof typeof RESERVATION_STATUS_LABELS_AR],
          }))}
        />
        <SelectFilter
          id="d-r"
          label="المطعم"
          value={resId}
          onChange={setResId}
          options={[{ value: ALL, label: 'الكل' }, ...restaurantsOptions()]}
        />
        <SelectFilter
          id="d-b"
          label="الفرع"
          value={br}
          onChange={setBr}
          options={[
            { value: ALL, label: 'الكل' },
            ...branchOpts(resId).map((x) => ({ value: x.value, label: x.label })),
          ]}
        />
        <SelectFilter
          id="d-fu"
          label="يحتاج متابعة"
          value={fu}
          onChange={setFu}
          options={[
            { value: ALL, label: 'الكل' },
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا' },
          ]}
        />
      </PageToolbar>
      {list.length === 0 ? (
        <EmptyState title="لا نتائج" />
      ) : (
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>الزبون</th>
                <th>المطعم</th>
                <th>الفرع</th>
                <th>الموعد</th>
                <th>الحالة</th>
                <th>مؤشر المتابعة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 800 }}>{r.refCode}</td>
                  <td>{r.customerName}</td>
                  <td>{r.restaurantName}</td>
                  <td>{r.branchName}</td>
                  <td>{formatIqTime(r.scheduledAt)}</td>
                  <td>
                    <MutedPill>{RESERVATION_STATUS_LABELS_AR[r.status]}</MutedPill>
                  </td>
                  <td>
                    {r.needsAdminFollowup ? (
                      <StatusBadge kind="warning">{followupLabelAr(r.followup)}</StatusBadge>
                    ) : (
                      <StatusBadge kind="ok">{followupLabelAr(r.followup)}</StatusBadge>
                    )}
                  </td>
                  <td>
                    <div
                      className="rowAct"
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
                        items={[
                          { id: 'cc', label: 'تحويل للكول سنتر', onSelect: () => setMsg('إحالة للكول سنتر (نموذج).') },
                          { id: 'cp', label: 'فتح شكوى', onSelect: () => setMsg('تسجيل شكوى (نموذج).') },
                          { id: 'nt', label: 'إضافة ملاحظة', onSelect: () => setMsg('تسجيل ملاحظة (نموذج).') },
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
        title={row ? `تفاصيل — ${row.refCode}` : ''}
        onClose={() => setOpen(null)}
        footer={(
          <ActionButton type="button" onClick={() => setOpen(null)} variant="secondary">
            إغلاق
          </ActionButton>
        )}
      >
        {row && (
          <>
            <h3 style={{ fontSize: '0.8rem', margin: '0 0 0.4rem', color: '#64748b' }}>ملخص</h3>
            <p style={{ margin: '0 0 0.5rem', fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>{row.refCode}</p>
            <div>
              <DlItem k="الحالة" v={RESERVATION_STATUS_LABELS_AR[row.status]} />
              <DlItem k="الزبون" v={row.customerName} />
              <DlItem k="هاتف (عيّنة)" v={rowUser?.phone ?? '—'} />
              <DlItem k="المطعم" v={row.restaurantName} />
              <DlItem k="الفرع" v={row.branchName} />
              {brRow?.defaultHoursAr && <DlItem k="أوقات الفرع (نموذج)" v={brRow.defaultHoursAr} />}
              <DlItem k="الموعد" v={formatIqTime(row.scheduledAt)} />
              <DlItem k="العدد" v={String(row.partySize)} />
              {row.note && <DlItem k="ملاحظة" v={row.note} />}
              {row.callCenterNoteAr && <DlItem k="متابعة" v={row.callCenterNoteAr} />}
              <DlItem k="مؤشر المتابعة" v={followupLabelAr(row.followup)} />
            </div>
            <h3 style={{ fontSize: '0.85rem', margin: '0.6rem 0 0.35rem' }}>سجل التواصل (نموذجي)</h3>
            <Timeline
              items={resLog.map((e) => ({ at: e.at, text: e.textAr, key: e.at }))}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>مسار إضافي</h3>
            <Timeline
              items={[
                { at: row.createdAt, text: 'تسجيل الطلب', key: 'a' },
                { at: row.scheduledAt, text: 'الموعد المدخل', key: 'b' },
              ]}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.8rem', margin: '0.5rem 0 0.2rem', color: '#0f172a' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              {row.needsAdminFollowup
                ? 'مراجعة سريعة مع المطعم ثم تثبيت الحالة في المتابعة.'
                : 'متابعة روتينية حسب الجدول التشغيلي (نموذج).'}
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
