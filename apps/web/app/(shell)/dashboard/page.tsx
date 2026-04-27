import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { actionButtonClass } from '@/components/ui/ActionButton';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import {
  platformActivityFeed,
  platformAttentionReservations,
  platformDashboardKpis,
  platformLateSubscriptions,
  platformPendingRestaurants,
  platformUrgentComplaints,
  getRestaurantById,
  getUserById,
  RESERVATION_STATUS_LABELS_AR,
  RESTAURANT_STATUS_LABELS_AR,
  SUBSCRIPTION_STATUS_LABELS_AR,
} from '@eventaat/shared';
import dash from '@/components/dashboard/dash.module.css';
import { StatusBadge, MutedPill } from '@/components/dashboard/StatusBadge';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { formatIqTime } from '@/lib/timeFormat';

export default function DashboardPage() {
  const k = platformDashboardKpis();
  const act = platformActivityFeed();
  const needRes = platformAttentionReservations();
  const pendR = platformPendingRestaurants();
  const urg = platformUrgentComplaints();
  const lateSub = platformLateSubscriptions();

  return (
    <div>
      <PageHeader
        title="لوحة المنصة"
        subtitle="نظرة تشغيلية وهمية (لا يُحفَظ تغيير على خادم)."
        actions={
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" className={actionButtonClass('primary', false)} disabled>
              مزامنة
            </button>
            <Link className={actionButtonClass('secondary', false)} href="/admin" prefetch={false}>
              فتح إدارة
            </Link>
          </div>
        }
      />
      <MetricGrid>
        <MetricCard label="المطاعم" value={k.restaurantCount} />
        <MetricCard label="حجوزات اليوم" value={k.todayReservations} />
        <MetricCard label="شكاوى مفتوحة" value={k.openComplaints} />
        <MetricCard label="اشتراكات تحتاج متابعة" value={k.subscriptionsNeedingFollowUp} />
        <MetricCard label="مهام الكول سنتر" value={k.callCenterTaskCount} />
      </MetricGrid>
      <div className={dash.split}>
        <div>
          <SectionCard
            title="نشاط اليوم"
            action={
              <Link className={actionButtonClass('ghost', true)} href="/admin/reservations" prefetch={false}>
                تفاصيل
              </Link>
            }
          >
            <div className={dash.stack} style={{ gap: 8 }}>
              {act.map((a) => (
                <div
                  key={a.at + a.textAr}
                  className="mutedLine"
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.5rem', background: '#f8fafc' }}
                >
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, margin: '0 0 0.1rem' }}>
                    {formatIqTime(a.at)}
                  </div>
                  <div style={{ fontSize: 12, color: '#0f1419', fontWeight: 800, margin: 0, lineHeight: 1.35 }}>{a.textAr}</div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="إجراءات سريعة" action={<span className={dash.muted2}>نموذج</span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(7.5rem,1fr))', gap: 8 }}>
              <QuickActionCard href="/admin/restaurants" title="مطاعم" sub="مراجعة" />
              <QuickActionCard href="/admin/complaints" title="شكاوى" sub="متابعة" />
              <QuickActionCard href="/admin/reservations" title="الحجوزات" sub="رصد" />
              <QuickActionCard href="/call-center/tasks" title="المهام" sub="تشغيل" />
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="حجوزات تحتاج متابعة">
            {needRes.length === 0 ? (
              <p className="muted" style={{ margin: 0, color: '#64748b' }}>
                لا بيانات مطابقة في عينة التاريخ.
              </p>
            ) : (
              <DataTableFrame>
                <table className={dataTableCl()}>
                  <thead>
                    <tr>
                      <th>رقم</th>
                      <th>الحالة</th>
                      <th>ملاحظة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needRes.map((r) => {
                      const cust = getUserById(r.customerId);
                      return (
                        <tr key={r.id}>
                          <td>
                            {r.refCode} — {cust?.displayName ?? '—'}
                          </td>
                          <td>
                            <MutedPill>{RESERVATION_STATUS_LABELS_AR[r.status]}</MutedPill>
                          </td>
                          <td style={{ color: '#475569', fontSize: 12, fontWeight: 800 }}>{r.callCenterNoteAr ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </DataTableFrame>
            )}
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Link className={actionButtonClass('secondary', true)} href="/admin/reservations" prefetch={false}>
                فتح الحجوزات
              </Link>
            </div>
          </SectionCard>
          <SectionCard title="مطاعم بانتظار المراجعة">
            {pendR.length === 0 ? <p className="muted" style={{ margin: 0 }}>لا طلبات.</p> : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {pendR.map((r) => (
                  <li key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>{r.area}</div>
                    </div>
                    <StatusBadge kind="warning">{RESTAURANT_STATUS_LABELS_AR[r.status]}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 8 }}>
              <Link className={actionButtonClass('primary', true)} href="/admin/restaurants" prefetch={false}>
                مراجعة المطاعم
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
      <div className={dash.split} style={{ marginTop: 8 }}>
        <SectionCard title="شكاوى عاجلة">
          {urg.length === 0 ? <p className="muted" style={{ margin: 0 }}>لا بيانات.</p> : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {urg.map((c) => {
                const rest = c.restaurantId ? getRestaurantById(c.restaurantId) : null;
                return (
                  <li key={c.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 2 }}>{c.subject}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>{rest?.name ?? 'مطعم'}</div>
                  </li>
                );
              })}
            </ul>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Link className={actionButtonClass('primary', true)} href="/admin/complaints" prefetch={false}>
              متابعة الشكاوى
            </Link>
            <Link className={actionButtonClass('secondary', true)} href="/call-center/complaints" prefetch={false}>
              الكول سنتر
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="اشتراكات متأخرة">
          {lateSub.length === 0 ? <p className="muted" style={{ margin: 0 }}>لا بيانات.</p> : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {lateSub.map((s) => {
                const r = getRestaurantById(s.restaurantId);
                return (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>{r?.name ?? s.restaurantId}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginTop: 2 }}>{s.nextActionAr}</div>
                    </div>
                    <StatusBadge kind="bad">{SUBSCRIPTION_STATUS_LABELS_AR[s.status]}</StatusBadge>
                  </li>
                );
              })}
            </ul>
          )}
          <div style={{ marginTop: 8 }}>
            <Link className={actionButtonClass('secondary', true)} href="/admin/subscriptions" prefetch={false}>
              متابعة الاشتراكات
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
