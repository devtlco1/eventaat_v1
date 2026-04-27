import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  getDiscoverableRestaurants,
  getRestaurantById,
  isRestaurantBookable,
  ReservationStatus,
  UserRole,
} from '@eventaat/shared';
import { filterRestaurants, type SearchFilters } from '../utils/searchFilter';
import { useApp } from '../state/AppContext';
import { theme } from '../ui/theme';
import { AppShell } from '../components/AppShell';
import { RestaurantCard } from '../components/RestaurantCard';
import { FilterChip } from '../components/FilterChip';
import { SectionTitle } from '../components/SectionTitle';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';

const BAGHDAD = 'بغداد';
const AREAS = ['المنصور', 'الكرادة', 'الجادرية', 'الكاظمية', 'زيونة'];
const CATS: { id: string; f?: Partial<SearchFilters> }[] = [
  { id: 'عوائل', f: { family: true } },
  { id: 'كافيهات' },
  { id: 'مطاعم فاخرة' },
  { id: 'جلسات خارجية', f: { outdoor: true } },
  { id: 'عروض' },
];

function pickNextUpcoming(
  list: { status: string; scheduledAt: string; id: string; restaurantId: string }[],
) {
  const s = new Set<string>([
    ReservationStatus.approved,
    ReservationStatus.pending,
    ReservationStatus.customer_on_the_way,
  ]);
  const u = list.filter((r) => s.has(r.status as ReservationStatus));
  u.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  return u[0];
}

export function HomeScreen() {
  const { session, push, mergedForCurrentCustomer } = useApp();
  const [q, setQ] = useState('');
  const [chip, setChip] = useState<{ id: string; f?: Partial<SearchFilters> } | null>(null);

  const all = useMemo(
    () => (session.kind === 'none' ? [] : mergedForCurrentCustomer()),
    [session, mergedForCurrentCustomer],
  );
  const name = session.kind === 'user' ? session.user.displayName : 'ضيف eventaat';
  const upcoming = all.length ? pickNextUpcoming(all) : undefined;

  const base = getDiscoverableRestaurants().filter((r) => isRestaurantBookable(r));
  const pool = useMemo(() => {
    if (!chip) return base;
    return filterRestaurants(base, q, { ...chip.f, query: chip.id } as SearchFilters);
  }, [base, q, chip]);

  const featured = useMemo(() => filterRestaurants(pool, q, {} as SearchFilters).slice(0, 6), [pool, q]);
  const availableToday = useMemo(
    () => filterRestaurants(base, q, { availableToday: true } as SearchFilters).slice(0, 4),
    [base, q],
  );

  if (session.kind === 'none') {
    return null;
  }

  const showOperatorNote =
    session.kind === 'user' &&
    session.auth === 'api' &&
    session.user.primaryRole !== UserRole.customer;

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.color.text, fontSize: 22, fontWeight: '800', textAlign: 'right' }}>
          أهلاً {name} 👋
        </Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 4, fontSize: 14 }}>{BAGHDAD}</Text>
        {showOperatorNote ? (
          <View
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.35)',
            }}
          >
            <Text style={{ color: theme.color.muted, textAlign: 'right', fontSize: 13, lineHeight: 20 }}>
              هذا الحساب مخصص للوحة التحكم. يرجى استخدام لوحة الويب. تطبيق الزبون مخصص للتصفح ونماذج الحجز فقط.
            </Text>
          </View>
        ) : null}
        <View style={{ marginTop: theme.space.lg }} />
        <TextField
          value={q}
          onChangeText={setQ}
          label="بحث عن مطعم"
          placeholder="اسم أو منطقة…"
        />
        <View style={{ marginTop: 12 }} />
        <PrimaryButton label="بحث" onPress={() => push({ name: 'search', initialQuery: q })} />
        {upcoming ? (
          <Pressable
            onPress={() => push({ name: 'reservation_detail', id: upcoming.id })}
            style={{
              marginTop: 20,
              backgroundColor: theme.color.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: 'rgba(16,185,129,0.35)',
              padding: 16,
            }}
          >
            <Text style={{ color: theme.color.accent2, fontSize: 12, textAlign: 'right' }}>حجزك القادم</Text>
            <Text style={{ color: theme.color.text, fontSize: 16, fontWeight: '700', textAlign: 'right' }}>
              {getRestaurantById(upcoming.restaurantId)?.name ?? 'مطعم'}
            </Text>
            <Text style={{ color: theme.color.muted, textAlign: 'right', fontSize: 12, marginTop: 4 }}>
              {new Date(upcoming.scheduledAt).toLocaleString('ar-IQ')}
            </Text>
          </Pressable>
        ) : (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: theme.color.muted, textAlign: 'right' }}>لا توجد لديك حجوزات قادمة بعد.</Text>
          </View>
        )}
        <SectionTitle>مطاعم مميّزة</SectionTitle>
        {featured.map((r) => (
          <RestaurantCard key={r.id} r={r} onPress={() => push({ name: 'restaurant', id: r.id })} />
        ))}
        <SectionTitle>متاح اليوم</SectionTitle>
        {availableToday.map((r) => (
          <RestaurantCard key={r.id} r={r} onPress={() => push({ name: 'restaurant', id: r.id })} />
        ))}
        <SectionTitle>تصفّح حسب المنطقة</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {AREAS.map((a) => (
            <FilterChip
              key={a}
              label={a}
              active={false}
              onPress={() => push({ name: 'search', initialQuery: a })}
            />
          ))}
        </View>
        <SectionTitle>تصنيف سريع</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {CATS.map((c) => (
            <FilterChip
              key={c.id}
              label={c.id}
              active={chip?.id === c.id}
              onPress={() => setChip((p) => (p?.id === c.id ? null : c))}
            />
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}
