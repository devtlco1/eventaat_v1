'use client';

import { useMemo, useState } from 'react';
import { callCenterTaskQueue, mockUsers, getReservationById, getRestaurantById } from '@eventaat/shared';
import { CALL_CENTER_TASK_PRIORITY_LABELS_AR, CALL_CENTER_TASK_TYPE_LABELS_AR } from '@eventaat/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { DataTableFrame, dataTableCl } from '@/components/dashboard/DataTable';
import { ActionButton } from '@/components/ui/ActionButton';
import { MutedPill, StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailDrawer, DlItem } from '@/components/dashboard/DetailDrawer';
import { Timeline } from '@/components/ui/Timeline';
import { getTaskCommunicationLog } from '@eventaat/shared';
import { formatIqTime } from '@/lib/timeFormat';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RowActionMenu } from '@/components/ui/RowActionMenu';

const ALL = '__all';

const statusAr: Record<string, string> = {
  pending: 'مفتوح',
  in_progress: 'قيد التنفيذ',
  done: 'مغلق',
};

export function CallCenterTasksView() {
  const all = callCenterTaskQueue();
  const [st, setSt] = useState(ALL);
  const [pr, setPr] = useState(ALL);
  const [ty, setTy] = useState(ALL);
  const [ag, setAg] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useMemo(() => {
    return all.filter((t) => {
      if (st !== ALL && t.status !== st) return false;
      if (pr !== ALL && t.priority && t.priority !== pr) return false;
      if (pr !== ALL && !t.priority) return false;
      if (ty !== ALL && t.taskType && t.taskType !== ty) return false;
      if (ty !== ALL && !t.taskType) return false;
      if (ag !== ALL && t.assigneeUserId !== ag) return false;
      return true;
    });
  }, [all, st, pr, ty, ag]);

  const row = open ? all.find((t) => t.id === open) : null;
  const log = open ? getTaskCommunicationLog(open) : [];
  const linkRes = row?.reservationId ? getReservationById(row.reservationId) : null;
  const linkRest = linkRes ? getRestaurantById(linkRes.restaurantId) : null;

  const assignees = [ALL, ...new Set(all.map((t) => t.assigneeUserId).filter(Boolean) as string[])];

  return (
    <div>
      <PageHeader title="طابور المهام" subtitle="تصفية محلية (نموذج)." />
      <PageToolbar>
        <SelectFilter
          id="t-st"
          label="الحالة"
          value={st}
          onChange={setSt}
          options={[
            { value: ALL, label: 'الكل' },
            { value: 'pending', label: 'مفتوح' },
            { value: 'in_progress', label: 'قيد التنفيذ' },
            { value: 'done', label: 'مغلق' },
          ]}
        />
        <SelectFilter
          id="t-p"
          label="الأولوية"
          value={pr}
          onChange={setPr}
          options={[
            { value: ALL, label: 'الكل' },
            ...Object.keys(CALL_CENTER_TASK_PRIORITY_LABELS_AR).map((k) => ({
              value: k,
              label: CALL_CENTER_TASK_PRIORITY_LABELS_AR[k as 'low' | 'normal' | 'high' | 'urgent'],
            })),
          ]}
        />
        <SelectFilter
          id="t-ty"
          label="نوع المهمة"
          value={ty}
          onChange={setTy}
          options={[
            { value: ALL, label: 'الكل' },
            ...Object.keys(CALL_CENTER_TASK_TYPE_LABELS_AR).map((k) => ({
              value: k,
              label: CALL_CENTER_TASK_TYPE_LABELS_AR[k as 'reservation' | 'complaint' | 'subscription' | 'outreach' | 'other'],
            })),
          ]}
        />
        <SelectFilter
          id="t-a"
          label="المندوب"
          value={ag}
          onChange={setAg}
          options={assignees.map((id) => ({
            value: id,
            label: id === ALL ? 'الكل' : mockUsers.find((u) => u.id === id)?.displayName ?? id,
          }))}
        />
      </PageToolbar>
      {list.length === 0 ? (
        <EmptyState title="لا نتائج" />
      ) : (
        <DataTableFrame>
          <table className={dataTableCl()}>
            <thead>
              <tr>
                <th>المهمة</th>
                <th>النوع</th>
                <th>الأولوية</th>
                <th>الموعد</th>
                <th>المندوب</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const u = t.assigneeUserId
                  ? mockUsers.find((x) => x.id === t.assigneeUserId)
                  : null;
                return (
                  <tr key={t.id}>
                    <td style={{ maxWidth: 200, lineHeight: 1.3, fontWeight: 800 }}>{t.title}</td>
                    <td>
                      {t.taskType
                        ? CALL_CENTER_TASK_TYPE_LABELS_AR[t.taskType]
                        : '—'}
                    </td>
                    <td>
                      {t.priority ? (
                        <StatusBadge kind="warning">
                          {CALL_CENTER_TASK_PRIORITY_LABELS_AR[t.priority]}
                        </StatusBadge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {t.dueAt ? formatIqTime(t.dueAt) : formatIqTime(t.createdAt)}
                    </td>
                    <td style={{ fontSize: 12 }}>{u?.displayName ?? '—'}</td>
                    <td>
                      <MutedPill>{statusAr[t.status]}</MutedPill>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <ActionButton type="button" sm variant="primary" onClick={() => setOpen(t.id)}>
                          عرض
                        </ActionButton>
                        <RowActionMenu
                          label="إجراءات"
                          items={[
                            { id: '1', label: 'بدء المتابعة', onSelect: () => setMsg('بدء (نموذج).') },
                            { id: '2', label: 'إضافة ملاحظة', onSelect: () => setMsg('ملاحظة (نموذج).') },
                            { id: '3', label: 'تم التواصل', onSelect: () => setMsg('تم (نموذج).') },
                            { id: '4', label: 'لم يتم الرد', onSelect: () => setMsg('لا رد (نموذج).') },
                            { id: '5', label: 'تصعيد', onSelect: () => setMsg('تصعيد (نموذج).') },
                            { id: '6', label: 'إغلاق المهمة', onSelect: () => setMsg('إغلاق (نموذج).') },
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
      )}
      <DetailDrawer
        open={!!row}
        title={row?.title ?? ''}
        onClose={() => setOpen(null)}
        footer={(
          <ActionButton type="button" onClick={() => setOpen(null)} variant="secondary">
            إغلاق
          </ActionButton>
        )}
      >
        {row && (
          <>
            <div>
              <DlItem k="الحالة" v={statusAr[row.status]} />
              <DlItem
                k="النوع"
                v={row.taskType ? CALL_CENTER_TASK_TYPE_LABELS_AR[row.taskType] : '—'}
              />
              {row.priority && (
                <DlItem k="الأولوية" v={CALL_CENTER_TASK_PRIORITY_LABELS_AR[row.priority]} />
              )}
              {row.dueAt && <DlItem k="الموعد المستهدف" v={formatIqTime(row.dueAt)} />}
              {linkRes && linkRest && (
                <>
                  <DlItem k="رقم حجز مرتبط" v={linkRes.refCode} />
                  <DlItem k="مطعم" v={linkRest.name} />
                </>
              )}
            </div>
            <h3 style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>سجل التواصل (نموذجي)</h3>
            <Timeline
              items={log.map((e) => ({ at: e.at, text: e.textAr, key: e.at }))}
              formatTime={(s) => formatIqTime(s)}
            />
            <h3 style={{ fontSize: '0.8rem', margin: '0.5rem 0 0.2rem' }}>الخطوة المقترحة</h3>
            <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: '#475569', margin: 0 }}>
              {row.status === 'pending' ? 'بدء الاتصال وتوثيق النتيجة (نموذج).' : 'متابعة حسب السجل (نموذج).'}
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
