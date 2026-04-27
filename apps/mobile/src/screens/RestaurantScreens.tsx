import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  getRestaurantById,
  isRestaurantBookable,
  mockBranches,
  ReservationOccasion,
  ReservationStatus,
  RESERVATION_OCCASION_LABELS_AR,
  RESTAURANT_STATUS_LABELS_AR,
  SeatingType,
  SEATING_TYPE_LABELS_AR,
  type Reservation,
} from '@eventaat/shared';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/AppShell';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { theme } from '../ui/theme';
import { SectionTitle } from '../components/SectionTitle';
import { TextField } from '../components/TextField';
import { GUEST_CUSTOMER_ID, makeLocalReservationId, makeRefCode } from '../utils/reservations';

export function RestaurantDetailsScreen({ id }: { id: string }) {
  const { pop, push } = useApp();
  const r = getRestaurantById(id);
  const branches = mockBranches.filter((b) => b.restaurantId === id);
  if (!r) {
    return (
      <AppShell>
        <ScreenHeader title="مطعم" onBack={pop} />
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>تعذر عرض المطعم</Text>
      </AppShell>
    );
  }
  const canBook = isRestaurantBookable(r);
  return (
    <AppShell>
      <ScreenHeader title="تفاصيل المطعم" onBack={pop} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View
          style={{
            height: 180,
            backgroundColor: 'rgba(16,185,129,0.1)',
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.color.line,
            marginBottom: 16,
          }}
        />
        <Text style={{ color: theme.color.text, fontSize: 24, fontWeight: '800', textAlign: 'right' }}>
          {r.name}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, gap: 8 }}>
          <View
            style={{
              backgroundColor: 'rgba(16,185,129,0.2)',
              paddingHorizontal: 10,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: theme.color.accent2, fontSize: 12 }}>{r.area} · {r.city}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: theme.color.accent2, fontSize: 15 }}>★ {r.ratingMock.toFixed(1)}</Text>
          <Text style={{ color: theme.color.muted, fontSize: 12, textAlign: 'right' }}>
            {r.cuisineTypeAr}
          </Text>
        </View>
        <Text style={{ color: theme.color.muted, textAlign: 'right', lineHeight: 22, marginTop: 10 }}>
          {r.description}
        </Text>
        <Text
          style={{
            color: theme.color.dim,
            textAlign: 'right',
            fontSize: 11,
            marginTop: 10,
            backgroundColor: theme.color.surface,
            padding: 10,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.color.line,
          }}
        >
          {RESTAURANT_STATUS_LABELS_AR[r.status]}
        </Text>
        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {r.quickTagsAr.map((t) => (
            <View
              key={t}
              style={{
                marginStart: 6,
                marginBottom: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: theme.color.surface,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.color.line,
              }}
            >
              <Text style={{ color: theme.color.muted, fontSize: 11 }}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'flex-end' }}>
            {r.familyFriendly && (
              <Text style={{ color: theme.color.muted, fontSize: 12 }}>مناسب للعوائل</Text>
            )}
            {r.outdoorSeating && (
              <Text style={{ color: theme.color.muted, fontSize: 12 }}>جلسات خارجية</Text>
            )}
            {r.vipArea && <Text style={{ color: theme.color.muted, fontSize: 12 }}>تاج VIP</Text>}
          </View>
        </View>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8 }}>
          ساعات: {r.openingHoursAr}
        </Text>
        <SectionTitle>الفروع</SectionTitle>
        {branches.length === 0 ? (
          <Text style={{ color: theme.color.dim, textAlign: 'right' }}>لا فروع مضافة في العينة</Text>
        ) : (
          branches.map((b) => (
            <Text
              key={b.id}
              style={{
                color: theme.color.text,
                textAlign: 'right',
                marginBottom: 4,
                borderBottomWidth: 1,
                borderBottomColor: theme.color.line,
                paddingBottom: 8,
              }}
            >
              {b.name} — {b.address}
            </Text>
          ))
        )}
        <Text style={{ color: theme.color.muted, lineHeight: 20, textAlign: 'right', fontSize: 12, marginTop: 8 }}>
          إلغاء/تأخير: {r.cancellationPolicySummaryAr}
        </Text>
        <Text
          style={{
            color: theme.color.accent2,
            textAlign: 'right',
            fontSize: 12,
            marginTop: 10,
            lineHeight: 20,
            fontWeight: '600',
          }}
        >
          الطاولة ليست مضمونة حتى يأكد المطعم طلبك — يتبع ذلك إشعار من eventaat.
        </Text>
        <SectionTitle>تقييمات (عيّنة)</SectionTitle>
        {r.reviewSnippets.length === 0 ? (
          <Text style={{ color: theme.color.dim, textAlign: 'right' }}>لا تعليقات بعد</Text>
        ) : (
          r.reviewSnippets.map((rv) => (
            <View
              key={rv.text + rv.author}
              style={{
                backgroundColor: theme.color.surface,
                borderWidth: 1,
                borderColor: theme.color.line,
                borderRadius: theme.radius.md,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.color.muted, fontSize: 12 }}>{rv.rating}★</Text>
                <Text style={{ color: theme.color.text, fontWeight: '600' }}>{rv.author}</Text>
              </View>
              <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 6, lineHeight: 20 }}>{rv.text}</Text>
            </View>
          ))
        )}
        <View style={{ height: 16 }} />
        <PrimaryButton
          label="احجز الآن"
          disabled={!canBook}
          onPress={() => (canBook ? push({ name: 'create_reservation', id: r.id }) : undefined)}
        />
        {!canBook ? (
          <Text style={{ color: theme.color.danger, textAlign: 'right', fontSize: 12, marginTop: 6 }}>
            الحجز غير متاح لهذا المطعم في العينة.
          </Text>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

const ST = [SeatingType.indoor, SeatingType.outdoor, SeatingType.family, SeatingType.vip] as const;
const OC = [
  ReservationOccasion.none,
  ReservationOccasion.birthday,
  ReservationOccasion.business,
  ReservationOccasion.family,
] as const;

export function CreateReservationScreen({ id: restaurantId }: { id: string }) {
  const { pop, push, addLocalReservation, session } = useApp();
  const r = getRestaurantById(restaurantId);
  const branches = mockBranches.filter((b) => b.restaurantId === restaurantId);
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [date, setDate] = useState('2026-05-10');
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState('4');
  const [seating, setSeating] = useState<SeatingType>(SeatingType.indoor);
  const [occasion, setOccasion] = useState<ReservationOccasion>(ReservationOccasion.none);
  const [notes, setNotes] = useState('');

  if (!r || !isRestaurantBookable(r)) {
    return (
      <AppShell>
        <ScreenHeader title="حجز" onBack={pop} />
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>غير متاح</Text>
      </AppShell>
    );
  }

  const customerId = session.kind === 'user' ? session.user.id : GUEST_CUSTOMER_ID;

  const resPreview: Partial<Reservation> = {
    partySize: Math.max(1, parseInt(guests, 10) || 1),
    seatingType: seating,
    occasion,
    customerNotes: notes,
    scheduledAt: (() => {
      try {
        return new Date(`${date}T${time}:00.000Z`).toISOString();
      } catch {
        return new Date().toISOString();
      }
    })(),
  };

  return (
    <AppShell>
      <ScreenHeader title="طلب حجز" onBack={pop} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ color: theme.color.text, fontSize: 16, fontWeight: '700', textAlign: 'right' }}>{r.name}</Text>
        {branches.length ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.color.muted, textAlign: 'right', fontSize: 12 }}>الفرع</Text>
            {branches.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => setBranchId(b.id)}
                style={{
                  padding: 10,
                  marginTop: 6,
                  backgroundColor: branchId === b.id ? 'rgba(16,185,129,0.15)' : theme.color.card,
                  borderWidth: 1,
                  borderColor: branchId === b.id ? theme.color.accent : theme.color.line,
                  borderRadius: 8,
                }}
              >
                <Text style={{ textAlign: 'right', color: theme.color.text }}>{b.name}</Text>
                <Text style={{ textAlign: 'right', color: theme.color.dim, fontSize: 11 }}>{b.address}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {/** fields */}
        <View style={{ height: 12 }} />
        <TextField label="التاريخ (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <View style={{ marginTop: 12 }} />
        <TextField label="الوقت (HH:MM)" value={time} onChangeText={setTime} />
        <View style={{ marginTop: 12 }} />
        <TextField
          label="العدد"
          value={guests}
          onChangeText={setGuests}
          keyboardType="number-pad"
        />
        <SectionTitle>نوع الجلسة</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {ST.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSeating(s)}
              style={{ margin: 4, padding: 8, backgroundColor: seating === s ? 'rgba(16,185,129,0.2)' : theme.color.card, borderRadius: 8, borderWidth: 1, borderColor: theme.color.line }}
            >
              <Text style={{ color: theme.color.text, fontSize: 12 }}>{SEATING_TYPE_LABELS_AR[s]}</Text>
            </Pressable>
          ))}
        </View>
        <SectionTitle>المناسبة</SectionTitle>
        {OC.map((o) => (
          <Pressable
            key={o}
            onPress={() => setOccasion(o)}
            style={{ padding: 10, marginBottom: 6, backgroundColor: occasion === o ? 'rgba(16,185,129,0.15)' : theme.color.card, borderRadius: 8, borderWidth: 1, borderColor: occasion === o ? theme.color.accent : theme.color.line }}
          >
            <Text style={{ textAlign: 'right', color: theme.color.text }}>{RESERVATION_OCCASION_LABELS_AR[o]}</Text>
          </Pressable>
        ))}
        <View style={{ marginTop: 12 }} />
        <TextField
          label="ملاحظات (اختياري)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <View style={{ marginTop: 16, padding: 12, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.color.line }}>
          <Text style={{ color: theme.color.text, fontWeight: '700', textAlign: 'right' }}>مراجعة</Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 6, lineHeight: 20 }}>{r.name}</Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>الجلسة: {SEATING_TYPE_LABELS_AR[seating]}</Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>المناسبة: {RESERVATION_OCCASION_LABELS_AR[occasion]}</Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>الزمن: {resPreview.scheduledAt ? new Date(resPreview.scheduledAt).toLocaleString('ar-IQ') : '—'}</Text>
        </View>
        <View style={{ height: 20 }} />
        <PrimaryButton
          label="إرسال الطلب"
          onPress={() => {
            const finalBranch = branchId || branches[0]?.id;
            if (!finalBranch) {
              Alert.alert('تنبيه', 'لا يوجد فرع مرتبط في العينة');
              return;
            }
            const scheduledAt = (() => {
              try {
                return new Date(`${date}T${time}:00.000Z`).toISOString();
              } catch {
                return new Date().toISOString();
              }
            })();
            const res: Reservation = {
              id: makeLocalReservationId(),
              refCode: makeRefCode(),
              customerId,
              restaurantId,
              branchId: finalBranch,
              tableId: null,
              status: ReservationStatus.pending,
              partySize: Math.max(1, parseInt(guests, 10) || 1),
              scheduledAt,
              createdAt: new Date().toISOString(),
              seatingType: seating,
              occasion,
              customerNotes: notes,
            };
            addLocalReservation(res);
            push({ name: 'reservation_pending', res });
          }}
        />
      </ScrollView>
    </AppShell>
  );
}

export function ReservationPendingScreen({ res }: { res: Reservation }) {
  const { pop, goToMainTab, findReservation } = useApp();
  const r = findReservation(res.id) ?? res;
  const rest = getRestaurantById(r.restaurantId);
  return (
    <AppShell>
      <ScreenHeader title="تم إرسال الطلب" onBack={pop} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: theme.color.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: 'rgba(16,185,129,0.35)',
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: theme.color.accent2, textAlign: 'right', fontWeight: '700' }}>
            طلبك بانتظار موافقة المطعم.
          </Text>
          <Text style={{ color: theme.color.text, textAlign: 'right', marginTop: 12, fontSize: 18, fontWeight: '700' }}>
            {r.refCode}
          </Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8 }}>{rest?.name}</Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 4 }}>
            {new Date(r.scheduledAt).toLocaleString('ar-IQ')}
          </Text>
          <Text style={{ color: theme.color.muted, textAlign: 'right' }}>الضيوف: {r.partySize}</Text>
        </View>
        <PrimaryButton label="عرض حجوزاتي" onPress={() => goToMainTab('reservations')} />
        <View style={{ height: 10 }} />
        <SecondaryButton label="العودة للرئيسية" onPress={() => goToMainTab('home')} />
      </View>
    </AppShell>
  );
}
