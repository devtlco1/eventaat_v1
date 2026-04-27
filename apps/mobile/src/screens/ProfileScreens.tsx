import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { APP_NAME, getDiscoverableRestaurants } from '@eventaat/shared';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/AppShell';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { theme } from '../ui/theme';
import { SecondaryButton } from '../components/SecondaryButton';

export function ProfileScreen() {
  const { session, push, logout } = useApp();
  const favs = getDiscoverableRestaurants().slice(0, 3);
  if (session.kind === 'none') {
    return null;
  }
  if (session.kind === 'guest') {
    return (
      <AppShell>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '800', textAlign: 'right' }}>الحساب</Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8, lineHeight: 22 }}>وضع تجريبي: يمكنك التصفح. لعرض بيانات العينة سجّل بسرعة من الشاشة الأولى.</Text>
        <View style={{ marginTop: 24 }} />
        <PrimaryButton
          label="تسجيل دخول سريع (واجهة)"
          onPress={() => {
            // jump to simple welcome login path
            push({ name: 'login' });
          }}
        />
      </AppShell>
    );
  }
  const u = session.user;
  return (
    <AppShell>
      <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '800', textAlign: 'right' }}>الحساب</Text>
      <View style={{ marginTop: 16, padding: 14, backgroundColor: theme.color.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.color.line }}>
        <Text style={{ color: theme.color.text, textAlign: 'right', fontWeight: '700' }}>{u.displayName}</Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>{u.phone}</Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right' }}>{u.city}</Text>
      </View>
      <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 16, fontSize: 12 }}>مقترحات قريباً</Text>
      {favs.map((r) => (
        <Text key={r.id} style={{ color: theme.color.text, textAlign: 'right' }}>
          · {r.name}
        </Text>
      ))}
      <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 20, fontSize: 12 }}>الإشعارات</Text>
      <Text style={{ color: theme.color.dim, textAlign: 'right' }}>قريباً — اختيار تذكيرات الحجز</Text>
      <Pressable onPress={() => push({ name: 'support' })} style={{ marginTop: 20 }}>
        <Text style={{ color: theme.color.accent2, textAlign: 'right' }}>المساعدة والدعم →</Text>
      </Pressable>
      <Pressable style={{ marginTop: 8 }}>
        <Text style={{ color: theme.color.dim, textAlign: 'right' }}>الشروط وسياسة الخصوصية — تُضاف لاحقاً</Text>
      </Pressable>
      <View style={{ marginTop: 40 }} />
      <SecondaryButton
        label="تسجيل خروج"
        onPress={() => {
          void logout();
        }}
      />
    </AppShell>
  );
}

export function SupportScreen() {
  const { pop } = useApp();
  return (
    <AppShell>
      <ScreenHeader title="دعم eventaat" onBack={pop} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {[
          { t: 'فتح شكوى', s: 'يرتبط لاحقاً بلوحة المتابعة والشكاوى في المنتج' },
          { t: 'التواصل مع دعم ' + APP_NAME, s: 'واتساب/هاتف — بيانات الاتصال تُضاف في التشغيل' },
          { t: 'أسئلة شائعة', s: 'سياسات الإلغاء، الظهور، الاشتراك…' },
        ].map((r) => (
          <Pressable
            key={r.t}
            onPress={() => Alert.alert('نموذج', r.s)}
            style={{
              padding: 16,
              marginBottom: 10,
              backgroundColor: theme.color.surface,
              borderWidth: 1,
              borderColor: theme.color.line,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: theme.color.text, fontWeight: '700', textAlign: 'right' }}>{r.t}</Text>
            <Text style={{ color: theme.color.dim, textAlign: 'right', marginTop: 6, lineHeight: 20 }}>{r.s}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </AppShell>
  );
}
