'use client';

import { useState } from 'react';
import {
  adminSubscriptionKpis,
  getRestaurantById,
  mockSubscriptions,
  SUBSCRIPTION_STATUS_LABELS_AR,
} from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { TablePagination } from '@/components/ui/TablePagination';
import { usePaginatedRows } from '@/hooks/usePaginatedRows';
import { MutedPill } from '@/components/dashboard/StatusBadge';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { formatIqDate } from '@/lib/timeFormat';
import dash from '@/components/dashboard/dash.module.css';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function AdminSubscriptionsView() {
  const k = adminSubscriptionKpis();
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const subPag = usePaginatedRows([...mockSubscriptions], { resetKey: 'admin-sub' });
  const row = openId ? mockSubscriptions.find((s) => s.id === openId) : null;
  const r = row ? getRestaurantById(row.restaurantId) : null;

  return (
    <div>
      <PageHeader
        title="الاشتراكات"
        subtitle="النموذج التجاري كما في المخطط (عرضي فقط)."
      />
      <div className={dash.commercial}>
        <h2 className={dash.commercialH}>باقة الانضمام (عينة تسويقية)</h2>
        <p className={dash.commercialP}>باقة الانضمام: 250,000 د.ع (دفعة واحدة)</p>
        <p className={dash.commercialP}>أول 3 أشهر مجاناً</p>
        <p className={dash.commercialP}>بعدها 100,000 د.ع شهرياً</p>
        <p className={dash.muted2}>بدون عمولة على الحجوزات (حسب نموذج المنتج في الملف التنفيذي)</p>
      </div>
      <MetricGrid>
        <MetricCard label="تجريبي فعال" value={k.trial} />
        <MetricCard label="فعال" value={k.active} />
        <MetricCard label="مستحق الدفع" value={k.paymentDue} />
        <MetricCard label="متأخر" value={k.overdue} />
        <MetricCard label="معلق" value={k.suspended} />
        <MetricCard label="ملغي" value={k.cancelled} />
      </MetricGrid>
      <DataTableFrame>
        <table className={dataTableCl()}>
          <thead>
            <tr>
              <th>المطعم</th>
              <th>حالة الاشتراك</th>
              <th>نهاية الفترة المجانية</th>
              <th>الشهري</th>
              <th>آخر متابعة</th>
              <th>الإجراء القادم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subPag.pageItems.map((s) => {
              const rest = getRestaurantById(s.restaurantId);
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{rest?.name ?? s.restaurantId}</td>
                  <td>
                    <MutedPill>{SUBSCRIPTION_STATUS_LABELS_AR[s.status]}</MutedPill>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 800 }}>{s.trialEndsOn ? formatIqDate(s.trialEndsOn) : '—'}</td>
                  <td style={{ fontSize: 12, fontWeight: 800 }}>{s.monthlyAmountIqd.toLocaleString('ar-IQ')} د.ع</td>
                  <td style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>{s.lastFollowUpAt ? formatIqDate(s.lastFollowUpAt) : '—'}</td>
                  <td style={{ maxWidth: 200, lineHeight: 1.3 }}>{s.nextActionAr ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <ActionButton type="button" sm variant="primary" onClick={() => setOpenId(s.id)}>
                        عرض
                      </ActionButton>
                      <RowActionMenu
                        label="المزيد"
                        items={[
                          { id: 'r', label: 'تذكير', onSelect: () => setMsg('تذكير (نموذج) — بدون إرسال.') },
                          { id: 'f', label: 'متابعة', onSelect: () => setMsg('متابعة (نموذج).') },
                          { id: 's', label: 'تعليق', onSelect: () => setMsg('تعليق (نموذج).') },
                          { id: 'a', label: 'تفعيل', onSelect: () => setMsg('تفعيل (نموذج).') },
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
      {subPag.total > 0 && (
        <TablePagination
          idPrefix="admin-sub"
          total={subPag.total}
          from={subPag.from}
          to={subPag.to}
          page={subPag.page}
          pageSize={subPag.pageSize}
          totalPages={subPag.totalPages}
          onPageChange={subPag.setPage}
          onPageSizeChange={subPag.setPageSize}
        />
      )}
      <p className="muted" style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, fontWeight: 800 }}>
        جدول الاشتراكات للعرض فقط (لا API).
      </p>

      <DetailDrawer
        open={!!row}
        title={row && r ? `اشتراك — ${r.name}` : ''}
        onClose={() => setOpenId(null)}
        footer={(
          <ActionButton type="button" onClick={() => setOpenId(null)} variant="secondary">
            إغلاق
          </ActionButton>
        )}
      >
        {row && r && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', color: '#64748b' }}>الملخص</h3>
            <div>
              <DlItem k="المطعم" v={r.name} />
              <DlItem k="المنطقة" v={r.area} />
              <DlItem k="حالة الاشتراك" v={SUBSCRIPTION_STATUS_LABELS_AR[row.status]} />
              <DlItem k="الشهري" v={`${row.monthlyAmountIqd.toLocaleString('ar-IQ')} د.ع`} />
              <DlItem
                k="نهاية الفترة المجانية"
                v={row.trialEndsOn ? formatIqDate(row.trialEndsOn) : '—'}
              />
              <DlItem
                k="نهاية الفوترة"
                v={formatIqDate(row.periodEnd)}
              />
              <DlItem
                k="آخر متابعة"
                v={row.lastFollowUpAt ? formatIqDate(row.lastFollowUpAt) : '—'}
              />
              {row.nextActionAr && <DlItem k="الإجراء القادم" v={row.nextActionAr} />}
            </div>
            <h3 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem', color: '#64748b' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              {row.nextActionAr ?? 'مراجعة الحالة اليدوية حسب سياسة المنصة (نموذج).'}
            </p>
            <h3 style={{ fontSize: '0.85rem', margin: '0.75rem 0 0.35rem', color: '#64748b' }}>نطاق الإجراء</h3>
            <p style={{ fontSize: 12, margin: 0 }}>تذكير، متابعة، تعليق، تفعيل — واجهة فقط.</p>
          </>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={!!msg}
        title="نموذج"
        message={msg ?? ''}
        onClose={() => setMsg(null)}
        onConfirm={() => setMsg(null)}
      />
    </div>
  );
}
