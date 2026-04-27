import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getDiscoverableRestaurants, isRestaurantBookable, RESTAURANT_STATUS_LABELS_AR } from '@eventaat/shared';
import { filterRestaurants, type SearchFilters } from '../utils/searchFilter';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/AppShell';
import { TextField } from '../components/TextField';
import { FilterChip } from '../components/FilterChip';
import { RestaurantCard } from '../components/RestaurantCard';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../ui/theme';

const FILTERS: { label: string; f: SearchFilters }[] = [
  { label: 'المنطقة', f: { query: 'منطقة' } },
  { label: 'نوع الأكل', f: { query: 'مشويات' } },
  { label: 'التقييم', f: { query: '4' } },
  { label: 'متاح اليوم', f: { availableToday: true } },
  { label: 'عوائل', f: { family: true } },
  { label: 'خارجي', f: { outdoor: true } },
];

export function SearchScreen({ initialQuery = '' }: { initialQuery?: string }) {
  const { push } = useApp();
  const [q, setQ] = useState(initialQuery);
  const [f, setF] = useState<SearchFilters>({});

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const base = useMemo(
    () => getDiscoverableRestaurants().filter((r) => isRestaurantBookable(r)),
    [],
  );

  const list = useMemo(
    () => filterRestaurants(base, q, f as SearchFilters),
    [base, q, f],
  );

  return (
    <AppShell>
      <Text style={{ color: theme.color.text, fontSize: 18, fontWeight: '700', textAlign: 'right' }}>
        بحث
      </Text>
      <View style={{ marginTop: 12 }} />
      <TextField
        value={q}
        onChangeText={setQ}
        label="ابحث"
        placeholder="مطعم، منطقة…"
        autoFocus
      />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          marginTop: 12,
        }}
      >
        {FILTERS.map((x) => {
          const active = JSON.stringify(f) === JSON.stringify(x.f);
          return (
            <FilterChip
              key={x.label}
              label={x.label}
              active={active}
              onPress={() => setF((c) => (active ? {} : x.f))}
            />
          );
        })}
      </View>
      {list.length === 0 ? (
        <EmptyState
          title="لا نتائج"
          message="جرّب تغيير الكلمات أو إزالة بعض الفلاتر. هذا نموذج بيانات وهمي فقط."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80, marginTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {list.map((r) => (
            <View key={r.id}>
              <Text style={{ color: theme.color.dim, fontSize: 11, textAlign: 'right' }}>
                {RESTAURANT_STATUS_LABELS_AR[r.status]}
              </Text>
              <RestaurantCard r={r} onPress={() => push({ name: 'restaurant', id: r.id })} />
            </View>
          ))}
        </ScrollView>
      )}
      <View style={{ marginTop: 12 }} />
    </AppShell>
  );
}
