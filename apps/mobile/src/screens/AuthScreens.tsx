import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { APP_NAME } from '@eventaat/shared';
import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { TextField } from '../components/TextField';
import { useApp } from '../state/AppContext';
import { theme } from '../ui/theme';

export function WelcomeScreen() {
  const { push, enterAsGuest } = useApp();
  return (
    <AppShell>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'rgba(16,185,129,0.2)',
            alignSelf: 'center',
            marginBottom: theme.space.xl,
          }}
        />
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: theme.color.text,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {APP_NAME}
        </Text>
        <Text
          style={{
            color: theme.color.muted,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: theme.space.xxl,
            fontSize: 15,
            paddingHorizontal: 8,
          }}
        >
          احجز طاولتك بسهولة، واعرف حالة حجزك بوضوح — من البحث حتى نهاية الزيارة. (نموذج واجهة)
        </Text>
        <PrimaryButton label="تسجيل الدخول" onPress={() => push({ name: 'login' })} />
        <View style={{ height: 12 }} />
        <PrimaryButton
          label="إنشاء حساب"
          onPress={() => push({ name: 'register_login' })}
        />
        <View style={{ height: 12 }} />
        <SecondaryButton
          label="المتابعة كتجربة وهمية"
          onPress={() => {
            enterAsGuest();
          }}
        />
      </View>
    </AppShell>
  );
}

export function LoginScreen() {
  const { push, pop } = useApp();
  const [phone, setPhone] = useState('');

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          تسجيل الدخول
        </Text>
        <Text
          style={{
            color: theme.color.muted,
            textAlign: 'right',
            marginTop: 8,
            lineHeight: 20,
            fontSize: 14,
          }}
        >
          هذه شاشة واجهة فقط — لا يُرسل رمز واتساب ولا تُسجّل بيانات على خادم.
        </Text>
        <View style={{ marginTop: 24 }} />
        <TextField
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          placeholder="07XX XXX XXXX"
          keyboardType="phone-pad"
        />
        <View style={{ marginTop: 20 }} />
        <PrimaryButton
          label="إرسال رمز واتساب"
          onPress={() => push({ name: 'otp', phone: phone || '+9647XXXXXXXX0', next: 'login' })}
        />
        <View style={{ height: 12 }} />
        <SecondaryButton label="رجوع" onPress={() => pop()} />
      </ScrollView>
    </AppShell>
  );
}

export function RegisterLoginScreen() {
  const { push, pop } = useApp();
  const [phone, setPhone] = useState('');

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          إنشاء حساب
        </Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8 }}>
          أدخل رقمك للمتابعة (واجهة وهمية).
        </Text>
        <View style={{ marginTop: 24 }} />
        <TextField
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          placeholder="07XX XXX XXXX"
          keyboardType="phone-pad"
        />
        <View style={{ marginTop: 20 }} />
        <PrimaryButton
          label="متابعة"
          onPress={() => push({ name: 'otp', phone: phone || '+9647XXXXXXXX0', next: 'register' })}
        />
        <View style={{ height: 12 }} />
        <SecondaryButton label="رجوع" onPress={() => pop()} />
      </ScrollView>
    </AppShell>
  );
}

export function OtpScreen({ next, phone }: { next: 'login' | 'register'; phone: string }) {
  const { push, setSessionFromLogin, pop } = useApp();
  const [code, setCode] = useState('');

  return (
    <AppShell>
      <ScrollView>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          رمز التحقق
        </Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8 }}>{phone}</Text>
        <Text
          style={{
            color: theme.color.dim,
            textAlign: 'right',
            marginTop: 12,
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          للتجربة: أي أرقام. لا تحقق حقيقي. يمكنك إعادة إرسال الرمز لاحقاً في النسخة الكاملة.
        </Text>
        <View style={{ marginTop: 20 }} />
        <TextField
          label="الرمز"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
        />
        <Text style={{ color: theme.color.dim, textAlign: 'right', fontSize: 12, marginTop: 8 }}>
          لم يصلك؟ سنعيد إرسال الرمز لاحقاً
        </Text>
        <View style={{ marginTop: 20 }} />
        <PrimaryButton
          label="متابعة"
          onPress={() => {
            if (next === 'login') {
              setSessionFromLogin({ displayName: 'ليلى نزار', phone, city: 'بغداد' });
            } else {
              push({ name: 'register_profile', phone });
            }
          }}
        />
        <View style={{ height: 12 }} />
        <SecondaryButton label="رجوع" onPress={() => pop()} />
      </ScrollView>
    </AppShell>
  );
}

export function RegisterProfileScreen({ phone }: { phone: string }) {
  const { setSessionFromLogin } = useApp();
  const [name, setName] = useState('');
  const [city, setCity] = useState('بغداد');

  return (
    <AppShell>
      <ScrollView>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          بيانات الحساب
        </Text>
        <View style={{ marginTop: 20 }} />
        <TextField value={name} onChangeText={setName} label="الاسم الكامل" placeholder="اسمك" />
        <View style={{ marginTop: 12 }} />
        <TextField value={city} onChangeText={setCity} label="المدينة" placeholder="بغداد" />
        <View style={{ marginTop: 12 }} />
        <Text
          style={{
            color: theme.color.muted,
            textAlign: 'right',
            fontSize: 12,
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          الهاتف: {phone} (للعرض فقط)
        </Text>
        <PrimaryButton
          label="متابعة"
          onPress={() => {
            setSessionFromLogin({
              displayName: name || 'زبون جديد',
              phone,
              city: city || 'بغداد',
            });
          }}
        />
      </ScrollView>
    </AppShell>
  );
}
