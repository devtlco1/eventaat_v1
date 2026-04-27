import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { actionButtonClass } from '@/components/ui/ActionButton';
import { adminSubscriptionKpis, mockSubscriptions } from '@eventaat/shared';
import { getRestaurantById, SUBSCRIPTION_STATUS_LABELS_AR } from '@eventaat/shared';
import dash from '@/components/dashboard/dash.module.css';
import { MutedPill } from '@/components/dashboard/StatusBadge';
import { formatIqDate } from '@/lib/timeFormat';

export default function AdminSubscriptionsPage() {
  const k = adminSubscriptionKpis();
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
            {mockSubscriptions.map((s) => {
              const r = getRestaurantById(s.restaurantId);
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{r?.name ?? s.restaurantId}</td>
                  <td>
                    <MutedPill>{SUBSCRIPTION_STATUS_LABELS_AR[s.status]}</MutedPill>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 800 }}>{s.trialEndsOn ? formatIqDate(s.trialEndsOn) : '—'}</td>
                  <td style={{ fontSize: 12, fontWeight: 800 }}>{s.monthlyAmountIqd.toLocaleString('ar-IQ')} د.ع</td>
                  <td style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>{s.lastFollowUpAt ? formatIqDate(s.lastFollowUpAt) : '—'}</td>
                  <td style={{ maxWidth: 200, lineHeight: 1.3 }}>{s.nextActionAr ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                      <button type="button" className={actionButtonClass('secondary', true)} disabled>
                        تذكير
                      </button>
                      <button type="button" className={actionButtonClass('secondary', true)} disabled>
                        متابعة
                      </button>
                      <button type="button" className={actionButtonClass('secondary', true)} disabled>
                        تعليق
                      </button>
                      <button type="button" className={actionButtonClass('primary', true)} disabled>
                        تفعيل
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableFrame>
      <p className="muted" style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, fontWeight: 800 }}>
        أزرار الجدول للعرض فقط (لا API).
      </p>
    </div>
  );
}
