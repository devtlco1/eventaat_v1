import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function RestaurantSettingsPage() {
  return (
    <div>
      <PlaceholderCard title="الإعدادات (placeholder)">
        <p className={listStyles.muted}>
          ساعات العمل، سياسات الإلغاء، الربط — حسب الـ Blueprint في مراحل لاحقة. لا بيانات بعد.
        </p>
      </PlaceholderCard>
    </div>
  );
}
