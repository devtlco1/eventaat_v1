import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { actionButtonClass } from '@/components/ui/ActionButton';
import {
  adminDashboardKpis,
  getAdminRestaurantRows,
  getAdminComplaintTableRows,
  qualityAlerts,
  getAdminReservationTableRows,
} from '@eventaat/shared';
import { COMPLAINT_STATUS_LABELS_AR } from '@eventaat/shared';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { MutedPill, StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  getRestaurantById,
  getUserById,
  mockSubscriptions,
  SUBSCRIPTION_STATUS_LABELS_AR,
  RESTAURANT_STATUS_LABELS_AR,
  RestaurantStatus,
  ComplaintStatus,
  SubscriptionStatus,
} from '@eventaat/shared';

export default function AdminHomePage() {
  const k = adminDashboardKpis();
  const rows = getAdminRestaurantRows().filter(
    (r) => r.status === RestaurantStatus.under_review || r.status === RestaurantStatus.needs_changes,
  );
  const complaints = getAdminComplaintTableRows().filter(
    (c) =>
      c.status === ComplaintStatus.escalated ||
      c.status === ComplaintStatus.new ||
      c.status === ComplaintStatus.in_review,
  );
  const res = getAdminReservationTableRows()
    .filter((r) => r.needsAdminFollowup)
    .slice(0, 6);
  const subs = mockSubscriptions.filter(
    (s) => s.status === SubscriptionStatus.payment_due || s.status === SubscriptionStatus.overdue,
  );
  const quality = qualityAlerts();

  return (
    <div>
      <PageHeader
        title="الإدارة"
        subtitle="نموذج تشغيل: مراقبة وتمهيد (بدون API)."
      />
      <PageToolbar>
        <Link className={actionButtonClass('primary', true)} href="/admin/restaurants" prefetch={false}>
          مراجعة المطاعم
        </Link>
        <Link className={actionButtonClass('secondary', true)} href="/admin/complaints" prefetch={false}>
          متابعة الشكاوى
        </Link>
        <Link className={actionButtonClass('secondary', true)} href="/admin/reservations" prefetch={false}>
          فتح الحجوزات
        </Link>
        <Link className={actionButtonClass('secondary', true)} href="/admin/subscriptions" prefetch={false}>
          متابعة الاشتراكات
        </Link>
      </PageToolbar>
      <MetricGrid>
        <MetricCard label="المطاعم الكلية" value={k.totalRestaurants} />
        <MetricCard label="بانتظار المراجعة" value={k.pendingReview} />
        <MetricCard label="حجوزات اليوم" value={k.todayReservations} />
        <MetricCard label="شكاوى مفتوحة" value={k.openComplaints} />
        <MetricCard label="اشتراكات متأخرة" value={k.lateSubscriptions} />
        <MetricCard label="مطاعم معطلة الحجوزات" value={k.disabledBookingsRestaurants} />
      </MetricGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(7.2rem, 1fr))', gap: 8, marginBottom: 10 }}>
        <QuickActionCard href="/admin/restaurants" title="مراجعة" sub="المطاعم" />
        <QuickActionCard href="/admin/complaints" title="شكاوى" sub="قرار" />
        <QuickActionCard href="/admin/reservations" title="رصد" sub="الحجوزات" />
        <QuickActionCard href="/admin/subscriptions" title="اشتراك" sub="متابعة" />
      </div>
      <SectionCard title="مطاعم تحتاج مراجعة">
        {rows.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {rows.slice(0, 4).map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.area}</div>
                </div>
                <StatusBadge kind="warning">{RESTAURANT_STATUS_LABELS_AR[r.status]}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0, color: '#64748b' }}>لا عرض.</p>
        )}
        <div style={{ marginTop: 8 }}>
          <Link className={actionButtonClass('secondary', true)} href="/admin/restaurants" prefetch={false}>
            الانتقال لإدارة المطاعم
          </Link>
        </div>
      </SectionCard>
      <SectionCard title="شكاوى تحتاج قرار">
        {complaints.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {complaints.slice(0, 4).map((c) => (
              <li key={c.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 2 }}>{c.subject}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {c.restaurantName} — {COMPLAINT_STATUS_LABELS_AR[c.status]}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>—</p>
        )}
        <div style={{ marginTop: 8 }}>
          <Link className={actionButtonClass('primary', true)} href="/admin/complaints" prefetch={false}>
            فتح شاشة الشكاوى
          </Link>
        </div>
      </SectionCard>
      <SectionCard title="حجوزات تحتاج متابعة">
        {res.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {res.map((r) => {
              const c = getUserById(r.customerId);
              return (
                <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900 }}>{r.refCode}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{c?.displayName} — {r.restaurantName}</div>
                  </div>
                  <MutedPill>{r.branchName}</MutedPill>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>لا عناصر بالمعايير الحالية.</p>
        )}
        <div style={{ marginTop: 8 }}>
          <Link className={actionButtonClass('secondary', true)} href="/admin/reservations" prefetch={false}>
            الانتقال
          </Link>
        </div>
      </SectionCard>
      <SectionCard title="اشتراكات تحتاج إجراء">
        {subs.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {subs.map((s) => {
              const r = getRestaurantById(s.restaurantId);
              return (
                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900 }}>{r?.name ?? s.restaurantId}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{s.nextActionAr}</div>
                  </div>
                  <StatusBadge kind="bad">{SUBSCRIPTION_STATUS_LABELS_AR[s.status]}</StatusBadge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>—</p>
        )}
        <div style={{ marginTop: 8 }}>
          <Link className={actionButtonClass('primary', true)} href="/admin/subscriptions" prefetch={false}>
            إدارة الاشتراكات
          </Link>
        </div>
      </SectionCard>
      <SectionCard title="تنبيهات جودة">
        <div>
          {quality.map((q) => (
            <AlertCard key={q.id} title="تنبيه" level={q.level === 'watch' ? 'watch' : 'warn'}>
              {q.textAr}
            </AlertCard>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
