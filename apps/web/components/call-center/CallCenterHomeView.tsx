import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricGrid, MetricCard } from '@/components/dashboard/MetricCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { callCenterDashboardKpis, callCenterReservationsBySection, callCenterOpenComplaints, callCenterActivityLog, callCenterTaskQueue } from '@eventaat/shared';
import { getUserById, mockReservations, RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { formatIqTime } from '@/lib/timeFormat';
import { MutedPill, StatusBadge } from '@/components/dashboard/StatusBadge';
import { actionButtonClass } from '@/components/ui/ActionButton';
import { UserRole, USER_ROLE_LABELS_AR } from '@eventaat/shared';

const agentId = 'u_cc1' as const;

export function CallCenterHomeView() {
  const k = callCenterDashboardKpis();
  const tq = callCenterTaskQueue().filter((t) => t.assigneeUserId === agentId && t.status !== 'done');
  const sec = callCenterReservationsBySection();
  const comp = callCenterOpenComplaints();
  const act = callCenterActivityLog();
  const agent = getUserById(agentId);

  return (
    <div>
      <PageHeader
        title="مكتب الاتصال"
        subtitle="نظام التوجيه الودي (وهمي)."
        actions={(
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span className="pill" style={{ display: 'inline-flex', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 800, padding: '0.2rem 0.5rem' }}>
              {agent?.displayName} — {USER_ROLE_LABELS_AR[UserRole.call_center_agent]}
            </span>
            <Link className={actionButtonClass('secondary', true)} href="/call-center/tasks" prefetch={false}>
              الطابور
            </Link>
          </div>
        )}
      />
      <MetricGrid>
        <MetricCard label="مهام اليوم" value={k.tasksToday} />
        <MetricCard label="بانتظار المتابعة" value={k.waitingFollowup} />
        <MetricCard label="تأخرت الرد (بانتظار مطعم)" value={k.lateRestaurantReply} />
        <MetricCard label="شكاوى مفتوحة" value={k.openComplaints} />
        <MetricCard label="مطاعم لا ترد" value={k.noReplyRestaurants} />
        <MetricCard label="مهام عاجلة" value={k.escalatedTasks} />
      </MetricGrid>
      <SectionCard title="قائمة مهامي">
        {tq.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {tq.map((t) => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '0.3rem 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatIqTime(t.dueAt ?? t.createdAt)}</div>
                </div>
                <MutedPill>{t.status === 'in_progress' ? 'جارٍ' : 'مفتوح'}</MutedPill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>فارغ</p>
        )}
        <div style={{ marginTop: 8 }}>
          <Link className={actionButtonClass('primary', true)} href="/call-center/tasks" prefetch={false}>
            الانتقال للطابور
          </Link>
        </div>
      </SectionCard>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: 8, margin: '0.4rem 0' }}>
        <SectionCard
          title="بانتظار المطعم"
          action={<Link className={actionButtonClass('ghost', true)} href="/call-center/reservations" prefetch={false}>المزيد</Link>}
        >
          {sec.pendingRestaurant.slice(0, 3).map((r) => {
            const u = getUserById(r.customerId);
            return (
              <div key={r.id} style={{ fontSize: 12, fontWeight: 800, borderBottom: '1px solid #f1f5f9', padding: '0.2rem 0' }}>
                {r.refCode} — {u?.displayName} — {RESERVATION_STATUS_LABELS_AR[r.status]}
              </div>
            );
          })}
        </SectionCard>
        <SectionCard
          title="قريبة"
          action={<span style={{ fontSize: 10, color: '#94a3b8' }}>نموذج</span>}
        >
          {sec.near.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, borderBottom: '1px solid #f1f5f9', padding: '0.2rem 0' }}>
              {r.refCode} {formatIqTime(r.scheduledAt)}
            </div>
          ))}
        </SectionCard>
        <SectionCard title="متأخرة / بلا رد">
          {sec.late.slice(0, 2).map((r) => (
            <div key={r.id} style={{ fontSize: 12, color: '#b91c1c', fontWeight: 800, padding: '0.2rem 0' }}>{r.refCode}</div>
          ))}
        </SectionCard>
        <SectionCard title="تحتاج تأكيد">
          {sec.confirm.map((r) => (
            <div key={r.id} style={{ fontSize: 12, fontWeight: 800, padding: '0.2rem 0' }}>{r.refCode} — {r.note}</div>
          ))}
        </SectionCard>
      </div>
      <SectionCard title="شكاوى عاجلة">
        {comp.length ? comp.map((c) => (
          <div key={c.id} style={{ marginBottom: 6, lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{c.subject}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.id}</div>
          </div>
        )) : <p className="muted" style={{ margin: 0 }}>—</p>}
        <Link className={actionButtonClass('secondary', true)} href="/call-center/complaints" prefetch={false} style={{ marginTop: 8, display: 'inline-block' }}>
          متابعة
        </Link>
      </SectionCard>
      <SectionCard title="سجل آخر المتابعات">
        {act.map((a) => (
          <div key={a.at + a.textAr} style={{ fontSize: 12, fontWeight: 800, color: '#475569', borderBottom: '1px solid #f1f5f9', padding: '0.2rem 0' }}>
            {formatIqTime(a.at)} — {a.textAr}
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
