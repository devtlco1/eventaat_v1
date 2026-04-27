import { mockCallCenterTasks, mockUsers } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function CallCenterTasksPage() {
  return (
    <div>
      <PlaceholderCard title="مهام المتابعة">
        <ul className={listStyles.listPlain}>
          {mockCallCenterTasks.map((t) => {
            const a = t.assigneeUserId ? mockUsers.find((u) => u.id === t.assigneeUserId) : null;
            return (
              <li key={t.id}>
                {t.title} — {t.status} {a ? `— ${a.displayName}` : ''}
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
