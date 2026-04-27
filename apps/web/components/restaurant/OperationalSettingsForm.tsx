'use client';

import { useState } from 'react';
import { ar } from '@/lib/arStrings';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { USER_ROLE_LABELS_AR, UserRole } from '@eventaat/shared';
import styles from './restaurant.module.css';

type SettingsTab = 'info' | 'hours' | 'policy' | 'tables' | 'notif' | 'perms';

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'info', label: ar.settings.sections.info },
  { id: 'hours', label: ar.settings.sections.hours },
  { id: 'policy', label: ar.settings.sections.policyBooking },
  { id: 'tables', label: ar.settings.sections.tablesSessions },
  { id: 'notif', label: ar.settings.sections.notif },
  { id: 'perms', label: ar.settings.sections.perms },
];

export function OperationalSettingsForm() {
  const { restaurant, role, pushToast } = useRestaurantDashboard();
  const [tab, setTab] = useState<SettingsTab>('info');
  const [v, setV] = useState({
    name: restaurant.name,
    hold: '20',
    grace: '15',
    defaultSession: '90',
  });
  const [acceptBookings, setAcceptBookings] = useState(true);
  const [allowEdits, setAllowEdits] = useState(true);
  const [waReminders, setWaReminders] = useState(false);
  const canPerms = role === UserRole.restaurant_owner;

  return (
    <div>
      <div className={styles.settingsTabRow} role="tablist" aria-label="أقسام الإعدادات">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={tab === t.id ? `${styles.settingsTabBtn} ${styles.settingsTabBtnActive}` : styles.settingsTabBtn}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.info}</div>
          <input className={styles.sInput} value={v.name} onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))} />
          <div className={styles.sToggleRow}>
            <span>{ar.settings.acceptBookings}</span>
            <input
              type="checkbox"
              checked={acceptBookings}
              onChange={(e) => setAcceptBookings(e.target.checked)}
              aria-label={ar.settings.acceptBookings}
            />
          </div>
          <div className={styles.sToggleRow}>
            <span>{ar.settings.allowEdits}</span>
            <input
              type="checkbox"
              checked={allowEdits}
              onChange={(e) => setAllowEdits(e.target.checked)}
              aria-label={ar.settings.allowEdits}
            />
          </div>
          <p className={styles.muted} style={{ marginTop: 8 }}>{ar.shell.modelNote}</p>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 10 }} onClick={() => pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}

      {tab === 'hours' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.hours}</div>
          <p className={styles.muted}>12:00 – 00:00 (نموذج) — تُفصَّل لاحقاً</p>
          <textarea className={styles.sText} readOnly value="مثال: 12:00 – 00:00 طوال الأسبوع" />
          <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}

      {tab === 'policy' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.policyBooking}</div>
          <textarea className={styles.sText} readOnly value={restaurant.cancellationPolicySummaryAr} />
          <div className={styles.sLabel} style={{ marginTop: 10 }}>{ar.settings.sections.holdDuration}</div>
          <input
            className={styles.sInput}
            value={v.hold}
            onChange={(e) => setV((p) => ({ ...p, hold: e.target.value }))}
          />{' '}
          {ar.settings.minutes}
          <div className={styles.sLabel} style={{ marginTop: 10 }}>{ar.settings.sections.grace}</div>
          <input
            className={styles.sInput}
            value={v.grace}
            onChange={(e) => setV((p) => ({ ...p, grace: e.target.value }))}
          />{' '}
          {ar.settings.minutes}
          <p className={styles.muted} style={{ marginTop: 6 }}>
            بعد المدة تُنظر إمكانية اعتبار الزبون «احتمال عدم حضور».
          </p>
          <button type="button" className={styles.btn} style={{ display: 'block', marginTop: 10 }} onClick={() => pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}

      {tab === 'tables' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.tablesSessions}</div>
          <p>داخلي، خارجي، عائلي، مميّز — مفعّل في واجهة الحجز.</p>
          <p className={styles.muted} style={{ marginTop: 6 }}>المناسبات الخاصة: أعياد ميلاد، اجتماعات…</p>
          <div className={styles.sLabel} style={{ marginTop: 10 }}>{ar.settings.defaultSession}</div>
          <select
            className={styles.sSelect}
            value={v.defaultSession}
            onChange={(e) => setV((p) => ({ ...p, defaultSession: e.target.value }))}
            aria-label={ar.settings.defaultSession}
          >
            <option value="60">٦٠ {ar.settings.defaultSessionUnit}</option>
            <option value="90">٩٠ {ar.settings.defaultSessionUnit}</option>
            <option value="120">١٢٠ {ar.settings.defaultSessionUnit}</option>
          </select>
          <button type="button" className={styles.btn} style={{ display: 'block', marginTop: 10 }} onClick={() => pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}

      {tab === 'notif' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.notif}</div>
          <p className={styles.muted}>تنبيهات وهمية: طلب جديد، وصول…</p>
          <div className={styles.sToggleRow}>
            <span>{ar.settings.waRemindersLater}</span>
            <input
              type="checkbox"
              checked={waReminders}
              onChange={(e) => setWaReminders(e.target.checked)}
              aria-label={ar.settings.waRemindersLater}
            />
          </div>
          <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}

      {tab === 'perms' && (
        <section className={styles.sCard}>
          <div className={styles.sLabel}>{ar.settings.sections.perms}</div>
          {!canPerms ? (
            <p>يبدو الدور في العينة كـ {USER_ROLE_LABELS_AR[role]} — تعديل الصلاحيات يتاح لحساب المالك (عيّنة).</p>
          ) : (
            <p>ربط لاحقاً بمستخدمي المطعم والأدوار.</p>
          )}
          <button type="button" className={styles.btn} disabled={!canPerms} onClick={() => canPerms && pushToast(ar.common.confirmProto)}>
            {ar.settings.saveProto}
          </button>
        </section>
      )}
    </div>
  );
}
