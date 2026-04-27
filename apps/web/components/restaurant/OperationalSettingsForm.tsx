'use client';

import { useState } from 'react';
import { ar } from '@/lib/arStrings';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { USER_ROLE_LABELS_AR, UserRole } from '@eventaat/shared';
import styles from './restaurant.module.css';

export function OperationalSettingsForm() {
  const { restaurant, role, pushToast } = useRestaurantDashboard();
  const [v, setV] = useState({
    name: restaurant.name,
    hold: '20',
    grace: '15',
  });
  const canPerms = role === UserRole.restaurant_owner;

  return (
    <div className={styles.sGrid}>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.info}</div>
        <input className={styles.sInput} value={v.name} onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))} />
        <p className={styles.muted} style={{ marginTop: 8 }}>{ar.shell.modelNote}</p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 10 }} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.hours}</div>
        <p className={styles.muted}>12:00 – 00:00 (نموذج) — تُفصَّل لاحقاً</p>
        <textarea className={styles.sText} readOnly value="مثال: 12:00 – 00:00 طوال الأسبوع" />
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.policy}</div>
        <textarea className={styles.sText} readOnly value={restaurant.cancellationPolicySummaryAr} />
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.holdDuration}</div>
        <input
          className={styles.sInput}
          value={v.hold}
          onChange={(e) => setV((p) => ({ ...p, hold: e.target.value }))}
        />{' '}
        دقيقة
        <button type="button" className={styles.btn} style={{ display: 'block', marginTop: 8 }} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.grace}</div>
        <input
          className={styles.sInput}
          value={v.grace}
          onChange={(e) => setV((p) => ({ ...p, grace: e.target.value }))}
        />{' '}
        دقيقة
        <p className={styles.muted} style={{ marginTop: 6 }}>
          بعد المدة تُنظر إمكانية اعتبار الزبون «احتمال عدم حضور».
        </p>
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.seating}</div>
        <p>داخلي، خارجي، عائلي، مميّز — مفعّل في واجهة الحجز.</p>
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.occasions}</div>
        <p className={styles.muted}>أعياد ميلاد، اجتماعات، عائلات…</p>
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
      <section className={styles.sCard}>
        <div className={styles.sLabel}>{ar.settings.sections.notif}</div>
        <p className={styles.muted}>تنبيهات وهمية: طلب جديد، وصول…</p>
        <button type="button" className={styles.btn} onClick={() => pushToast(ar.common.confirmProto)}>
          {ar.settings.saveProto}
        </button>
      </section>
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
    </div>
  );
}
