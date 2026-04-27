import { mockCallCenterTasks } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function CallCenterHomePage() {
  return (
    <div>
      <PlaceholderCard title="مكتب الاتصال">
        <p className={listStyles.muted}>
          عينة مهام: قيد الانتظار = {mockCallCenterTasks.filter((t) => t.status === 'pending').length}
        </p>
      </PlaceholderCard>
    </div>
  );
}
