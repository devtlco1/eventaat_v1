import { useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import {
  getRestaurantById,
  mockBranches,
  ReservationOccasion,
  ReservationStatus,
  RESERVATION_OCCASION_LABELS_AR,
  SEATING_TYPE_LABELS_AR,
} from '@eventaat/shared';
import { useApp } from '../state/AppContext';
import { groupReservationsForMyList } from '../utils/reservations';
import { AppShell } from '../components/AppShell';
import { SectionTitle } from '../components/SectionTitle';
import { ReservationCard } from '../components/ReservationCard';
import { StatusBadge } from '../components/StatusBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { theme } from '../ui/theme';
import { Timeline } from '../components/Timeline';
import { EmptyState } from '../components/EmptyState';

export function MyReservationsScreen() {
  const { push, mergedForCurrentCustomer, session, goToMainTab } = useApp();
  const all = useMemo(
    () => (session.kind === 'none' ? [] : mergedForCurrentCustomer()),
    [session, mergedForCurrentCustomer],
  );
  const g = useMemo(() => groupReservationsForMyList(all), [all]);

  if (session.kind === 'none') {
    return null;
  }
  if (session.kind === 'guest' && all.length === 0) {
    return (
      <AppShell>
        <Text style={{ color: theme.color.text, fontSize: 18, fontWeight: '700', textAlign: 'right' }}>
          حجوزاتي
        </Text>
        <EmptyState
          title="لا حجوزات"
          message="سجّل دخولاً لعرض سجل الحجوزات من العينة، أو جرّب «تجربة وهمية» ثم أنشئ حجزاً."
        />
        <PrimaryButton label="الذهاب لبحث" onPress={() => goToMainTab('search')} />
      </AppShell>
    );
  }

  const block = (title: string, list: typeof g.waiting) =>
    list.length > 0 ? (
      <View>
        <SectionTitle>{title}</SectionTitle>
        {list.map((r) => (
          <ReservationCard
            key={r.id}
            res={r}
            title={getRestaurantById(r.restaurantId)?.name ?? 'مطعم'}
            onPress={() => push({ name: 'reservation_detail', id: r.id })}
          />
        ))}
      </View>
    ) : null;

  return (
    <AppShell>
      <Text style={{ color: theme.color.text, fontSize: 18, fontWeight: '700', textAlign: 'right' }}>
        حجوزاتي
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }} showsVerticalScrollIndicator={false}>
        {g.waiting.length + g.upcoming.length + g.past.length + g.cancelled.length === 0 ? (
          <EmptyState
            title="سجل التجربة فارغ"
            message="ابدأ بإنشاء حجز لترى تدفق الحجز الظاهر هنا."
          />
        ) : (
          <>
            {block('بانتظار الرد', g.waiting)}
            {block('قادمة', g.upcoming)}
            {block('سابقة', g.past)}
            {block('ملغية / منتهية', g.cancelled)}
          </>
        )}
      </ScrollView>
    </AppShell>
  );
}

export function ReservationDetailsScreen({ id }: { id: string }) {
  const { findReservation, pop, setStatusOverride, push, goToMainTab } = useApp();
  const r = findReservation(id);
  const rest = r ? getRestaurantById(r.restaurantId) : undefined;
  const br = r ? mockBranches.find((b) => b.id === r.branchId) : undefined;
  if (!r) {
    return (
      <AppShell>
        <ScreenHeader title="تفاصيل" onBack={pop} />
        <Text style={{ textAlign: 'right', color: theme.color.muted }}>—</Text>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <ScreenHeader title="تفاصيل الحجز" onBack={pop} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: theme.color.dim, fontSize: 12 }}>{r.refCode}</Text>
          <StatusBadge status={r.status} />
        </View>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '800', textAlign: 'right' }}>
          {rest?.name}
        </Text>
        {br && (
          <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 4 }}>{br.name}</Text>
        )}
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>
          {new Date(r.scheduledAt).toLocaleString('ar-IQ')}
        </Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>الأشخاص: {r.partySize}</Text>
        {r.seatingType && (
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>الجلسة: {SEATING_TYPE_LABELS_AR[r.seatingType]}</Text>
        )}
        {r.occasion != null && r.occasion !== ReservationOccasion.none ? (
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>المناسبة: {RESERVATION_OCCASION_LABELS_AR[r.occasion]}</Text>
        ) : null}
        {r.customerNotes ? (
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>ملاحظات: {r.customerNotes}</Text>
        ) : null}
        {r.note ? <Text style={{ color: theme.color.muted, textAlign: 'right' }}>ملاحظة المطعم: {r.note}</Text> : null}
        <View style={{ marginTop: 16, marginBottom: 8 }} />
        <Text style={{ color: theme.color.text, fontWeight: '700', textAlign: 'right' }}>مسار الحجز (مختصر)</Text>
        <Timeline status={r.status} />
        <View style={{ marginTop: 16, gap: 8 }}>
          {r.status === ReservationStatus.pending && (
            <PrimaryButton
              label="إلغاء الطلب (واجهة)"
              onPress={() => {
                setStatusOverride(r.id, ReservationStatus.cancelled_by_customer);
                Alert.alert('نموذج', 'تُم محاكاة الإلغاء محلياً');
              }}
            />
          )}
          {r.status === ReservationStatus.approved && (
            <>
              <PrimaryButton
                label="أنا في الطريق"
                onPress={() => {
                  setStatusOverride(r.id, ReservationStatus.customer_on_the_way);
                }}
              />
              <PrimaryButton
                label="طلب تعديل"
                onPress={() => Alert.alert('لاحقاً', 'متابعة تعديل الحجز تُضبط مع الخادم.')}
              />
              <PrimaryButton
                label="إلغاء"
                onPress={() => {
                  setStatusOverride(r.id, ReservationStatus.cancelled_by_customer);
                }}
              />
            </>
          )}
          {r.status === ReservationStatus.completed && (
            <PrimaryButton label="تقييم التجربة" onPress={() => Alert.alert('لاحقاً', 'نموذج التقييم في مرحلة لاحقة.')} />
          )}
          {(r.status === ReservationStatus.rejected || r.status === ReservationStatus.expired) && (
            <PrimaryButton
              label="اختر وقتاً آخر"
              onPress={() => (rest ? push({ name: 'create_reservation', id: rest.id }) : undefined)}
            />
          )}
        </View>
        <View style={{ marginTop: 12 }} />
        <SecondaryButton
          label="حجوزاتي"
          onPress={() => {
            goToMainTab('reservations');
          }}
        />
      </ScrollView>
    </AppShell>
  );
}
