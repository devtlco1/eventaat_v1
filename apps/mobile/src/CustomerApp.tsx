import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  APP_NAME,
  getReservationById,
  mockRestaurants,
  getReservationsForCustomer,
  mockUsers,
  RESERVATION_STATUS_LABELS_AR,
} from '@eventaat/shared';
import type { CustomerScreen } from './navigation/types';
import { c, g } from './ui/styles';

const DEMO_CUSTOMER = 'u_c1';

type Nav = (s: CustomerScreen) => void;

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={g.btn}>
      <Text style={g.btnText}>{label}</Text>
    </Pressable>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={g.link}>{label}</Text>
    </Pressable>
  );
}

function ScreenWelcome({ nav }: { nav: Nav }) {
  return (
    <View style={g.screen}>
      <Text style={g.title}>مرحباً بك في {APP_NAME}</Text>
      <Text style={g.p}>
        واجهة وهمية للزبون (Phase 1A). لا تسجيل دخول — انتقل بين الشاشات لمعاينة التنقل فقط.
      </Text>
      <Link label="متابعة" onPress={() => nav({ name: 'home' })} />
    </View>
  );
}

function ScreenHome({ nav }: { nav: Nav }) {
  return (
    <ScrollView contentContainerStyle={[g.screen, { paddingBottom: 40 }]}>
      <Text style={g.title}>الرئيسية</Text>
      <Text style={g.p}>مطاعم مقترحة (وهمي)</Text>
      {mockRestaurants
        .filter((r) => r.id === 'r_visible' || r.id === 'r_review' || r.id === 'r_disabled')
        .map((r) => (
          <Pressable
            key={r.id}
            onPress={() => nav({ name: 'restaurant', restaurantId: r.id })}
            style={g.card}
          >
            <Text style={g.cardTitle}>{r.name}</Text>
            <Text style={g.cardSub}>
              {r.area} — {r.description}
            </Text>
          </Pressable>
        ))}
      <View style={g.nav}>
        <TextLink label="بحث" onPress={() => nav({ name: 'search' })} />
        <TextLink label="حجوزاتي" onPress={() => nav({ name: 'my_reservations' })} />
        <TextLink label="الملف" onPress={() => nav({ name: 'profile' })} />
      </View>
    </ScrollView>
  );
}

function ScreenSearch({ nav }: { nav: Nav }) {
  return (
    <View style={g.screen}>
      <Text style={g.title}>البحث</Text>
      <Text style={g.p}>نموذج البحث لاحقاً. مناطق بغداد: المنصور، الكرادة، الجادرية، الكاظمية، زيونة…</Text>
      <Link label="رجوع" onPress={() => nav({ name: 'home' })} />
    </View>
  );
}

function ScreenRestaurant({ nav, id }: { nav: Nav; id: string }) {
  const r = mockRestaurants.find((x) => x.id === id);
  if (!r) {
    return (
      <View style={g.screen}>
        <Text style={g.p}>مطعم غير معروف</Text>
        <Link label="عودة" onPress={() => nav({ name: 'home' })} />
      </View>
    );
  }
  return (
    <View style={g.screen}>
      <Text style={g.title}>{r.name}</Text>
      <Text style={g.p}>
        {r.area} — {r.city}
      </Text>
      <Link
        label="حجز جديد (واجهة فقط)"
        onPress={() => nav({ name: 'create_reservation', restaurantId: r.id })}
      />
      <View style={{ marginTop: 12 }} />
      <TextLink label="رجوع للرئيسية" onPress={() => nav({ name: 'home' })} />
    </View>
  );
}

function ScreenCreateReservation({ nav, restaurantId }: { nav: Nav; restaurantId: string }) {
  const r = mockRestaurants.find((x) => x.id === restaurantId);
  return (
    <View style={g.screen}>
      <Text style={g.title}>إنشاء حجز</Text>
      <Text style={g.p}>
        {r ? `مطعم: ${r.name}` : ''} — نموذج الحقول في Phase 1B/C. لا API.
      </Text>
      <Link label="رجوع" onPress={() => nav({ name: 'restaurant', restaurantId })} />
    </View>
  );
}

function ScreenMyReservations({ nav }: { nav: Nav }) {
  const list = getReservationsForCustomer(DEMO_CUSTOMER).slice(0, 5);
  return (
    <ScrollView contentContainerStyle={[g.screen, { paddingBottom: 40 }]}>
      <Text style={g.title}>حجوزاتي</Text>
      <Text style={g.p}>
        مستخدم وهمي: {mockUsers.find((u) => u.id === DEMO_CUSTOMER)?.displayName ?? DEMO_CUSTOMER}
      </Text>
      {list.map((res) => (
        <Pressable
          key={res.id}
          onPress={() => nav({ name: 'reservation_detail', reservationId: res.id })}
          style={g.card}
        >
          <Text style={g.cardTitle}>
            {res.id} — {RESERVATION_STATUS_LABELS_AR[res.status]}
          </Text>
          <Text style={g.cardSub}>{res.scheduledAt}</Text>
        </Pressable>
      ))}
      <Link label="الرئيسية" onPress={() => nav({ name: 'home' })} />
    </ScrollView>
  );
}

function ScreenReservationDetail({ nav, reservationId }: { nav: Nav; reservationId: string }) {
  const r = getReservationById(reservationId);
  const rest = r ? mockRestaurants.find((x) => x.id === r.restaurantId) : undefined;
  return (
    <View style={g.screen}>
      <Text style={g.title}>تفاصيل الحجز</Text>
      {r ? (
        <>
          <Text style={g.p}>
            {RESERVATION_STATUS_LABELS_AR[r.status]} — {rest?.name} — {r.partySize} أشخاص
          </Text>
          <Text style={g.p}>الوقت: {r.scheduledAt}</Text>
        </>
      ) : (
        <Text style={g.p}>حجز غير موجود</Text>
      )}
      <Link label="رجوع لحجوزاتي" onPress={() => nav({ name: 'my_reservations' })} />
    </View>
  );
}

function ScreenProfile({ nav }: { nav: Nav }) {
  const u = mockUsers.find((x) => x.id === DEMO_CUSTOMER);
  return (
    <View style={g.screen}>
      <Text style={g.title}>الملف الشخصي (واجهة فقط)</Text>
      <Text style={g.p}>{u?.displayName ?? '—'}</Text>
      <Text style={g.p}>{u?.phone ?? '—'}</Text>
      <Text style={g.p}>
        دخول حقيقي/OTP — لاحقاً. كل البيانات من mock: {DEMO_CUSTOMER}
      </Text>
      <Link label="رجوع" onPress={() => nav({ name: 'home' })} />
    </View>
  );
}

function render(
  s: CustomerScreen,
  set: (x: CustomerScreen) => void,
) {
  const nav = set;
  switch (s.name) {
    case 'welcome':
      return <ScreenWelcome nav={nav} />;
    case 'home':
      return <ScreenHome nav={nav} />;
    case 'search':
      return <ScreenSearch nav={nav} />;
    case 'restaurant':
      return <ScreenRestaurant nav={nav} id={s.restaurantId} />;
    case 'create_reservation':
      return <ScreenCreateReservation nav={nav} restaurantId={s.restaurantId} />;
    case 'my_reservations':
      return <ScreenMyReservations nav={nav} />;
    case 'reservation_detail':
      return <ScreenReservationDetail nav={nav} reservationId={s.reservationId} />;
    case 'profile':
      return <ScreenProfile nav={nav} />;
  }
}

export function CustomerApp() {
  const [screen, setScreen] = useState<CustomerScreen>({ name: 'welcome' });
  return (
    <>
      {render(screen, setScreen)}
      <StatusBar style="light" />
    </>
  );
}
