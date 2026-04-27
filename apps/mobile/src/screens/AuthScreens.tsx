import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { APP_NAME, createAuthApi } from '@eventaat/shared';
import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { TextField } from '../components/TextField';
import { useApp } from '../state/AppContext';
import { getExpoApiBaseUrl, useRealAuth } from '../config/authEnv';
import { mapAuthErrorToAr } from '../auth/mapAuthErrorAr';
import { theme } from '../ui/theme';

const SUCCESS_WHATSAPP = 'تم إرسال رمز التحقق عبر واتساب.';

function DevOtpBox({ code }: { code: string }) {
  return (
    <View
      style={{
        marginTop: 12,
        padding: 10,
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.4)',
      }}
    >
      <Text style={{ color: theme.color.dim, fontSize: 11, textAlign: 'right' }}>
        للتطوير المحلي فقط — ليس للإنتاج
      </Text>
      <Text style={{ color: theme.color.muted, fontSize: 13, textAlign: 'right', marginTop: 4 }}>
        رمز التطوير: {code}
      </Text>
    </View>
  );
}

export function WelcomeScreen() {
  const { push, enterAsGuest } = useApp();
  const useApi = useRealAuth();
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
          احجز طاولتك بسهولة، واعرف حالة حجزك بوضوح — من البحث حتى نهاية الزيارة. (نموذج بيانات للتجربة)
        </Text>
        {useApi ? (
          <Text
            style={{
              color: theme.color.dim,
              textAlign: 'center',
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            تسجيل الدخول مرتبط بخادم {APP_NAME} عند ضبط عنوان الـ API.
          </Text>
        ) : null}
        <PrimaryButton label="تسجيل الدخول" onPress={() => push({ name: 'login' })} />
        <View style={{ height: 12 }} />
        <PrimaryButton label="إنشاء حساب" onPress={() => push({ name: 'register_login' })} />
        <View style={{ height: 12 }} />
        <SecondaryButton
          label="المتابعة كتجربة وهمية"
          onPress={() => {
            enterAsGuest();
          }}
        />
        {!useApi ? (
          <Text style={{ color: theme.color.dim, textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            بلا خادم: وضع واجهة وهمي للتصفح. عيّن EXPO_PUBLIC_API_BASE_URL لاستخدام الحساب الحقيقي.
          </Text>
        ) : null}
      </View>
    </AppShell>
  );
}

export function LoginScreen() {
  const { push, pop } = useApp();
  const useApi = useRealAuth();
  const base = getExpoApiBaseUrl();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const goMockOtp = () => {
    push({ name: 'otp', phone: phone || '+9647XXXXXXXX0', next: 'login', challengeId: 'mock' });
  };

  const onSubmit = () => {
    if (!useApi) {
      goMockOtp();
      return;
    }
    if (!base) {
      setErr('عنوان الخادم غير مضبوط');
      return;
    }
    setErr('');
    setLoading(true);
    const api = createAuthApi(base);
    void (async () => {
      try {
        const r = await api.requestOtp({
          phone: phone.trim(),
          purpose: 'login',
          channel: 'whatsapp',
        });
        push({
          name: 'otp',
          phone: phone.trim(),
          next: 'login',
          challengeId: r.challengeId,
          devOtp: r.devOtp,
        });
      } catch (e) {
        setErr(mapAuthErrorToAr(e, 'request_otp'));
      } finally {
        setLoading(false);
      }
    })();
  };

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
          {useApi
            ? 'أدخل رقم الهاتف لإرسال رمز عبر واتساب (حسب إعدادات الخادم).'
            : 'وضع واجهة: لا يتصل بخادم. عيّن EXPO_PUBLIC_API_BASE_URL للوصول الحقيقي.'}
        </Text>
        <View style={{ marginTop: 24 }} />
        <TextField
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          placeholder="07XX XXX XXXX"
          keyboardType="phone-pad"
        />
        {err ? (
          <Text style={{ color: theme.color.danger, textAlign: 'right', marginTop: 8 }}>{err}</Text>
        ) : null}
        <View style={{ marginTop: 20 }} />
        <PrimaryButton label={loading ? 'جارٍ الإرسال…' : 'إرسال رمز واتساب'} onPress={onSubmit} />
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator color={theme.color.accent2} />
          </View>
        ) : null}
        <View style={{ height: 12 }} />
        <SecondaryButton label="رجوع" onPress={() => pop()} />
      </ScrollView>
    </AppShell>
  );
}

export function RegisterLoginScreen() {
  const { push, pop } = useApp();
  const useApi = useRealAuth();
  const base = getExpoApiBaseUrl();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('بغداد');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = () => {
    if (!useApi) {
      push({ name: 'otp', phone: phone || '+9647XXXXXXXX0', next: 'register', challengeId: 'mock' });
      return;
    }
    if (!base) {
      setErr('عنوان الخادم غير مضبوط');
      return;
    }
    setErr('');
    setLoading(true);
    const api = createAuthApi(base);
    void (async () => {
      try {
        const r = await api.requestOtp({
          phone: phone.trim(),
          purpose: 'register',
          channel: 'whatsapp',
          fullName: fullName.trim() || undefined,
          city: city.trim() || undefined,
        });
        push({
          name: 'otp',
          phone: phone.trim(),
          next: 'register',
          challengeId: r.challengeId,
          devOtp: r.devOtp,
        });
      } catch (e) {
        setErr(mapAuthErrorToAr(e, 'request_otp'));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          إنشاء حساب
        </Text>
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8, lineHeight: 22 }}>
          {useApi
            ? 'أدخل بياناتك لإتمام إنشاء الحساب — يُرسل رمز واتساب عبر واتساب (حسب الخادم).'
            : 'وضع واجهة بلا خادم: تُتاح خطوة إدخال الاسم لاحقاً.'}
        </Text>
        <View style={{ marginTop: 24 }} />
        {useApi ? (
          <>
            <TextField
              label="الاسم الكامل"
              value={fullName}
              onChangeText={setFullName}
              placeholder="الاسم"
            />
            <View style={{ marginTop: 12 }} />
            <TextField
              label="المدينة"
              value={city}
              onChangeText={setCity}
              placeholder="بغداد"
            />
            <View style={{ marginTop: 12 }} />
          </>
        ) : null}
        <TextField
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          placeholder="07XX XXX XXXX"
          keyboardType="phone-pad"
        />
        {err ? (
          <Text style={{ color: theme.color.danger, textAlign: 'right', marginTop: 8 }}>{err}</Text>
        ) : null}
        <View style={{ marginTop: 20 }} />
        <PrimaryButton label={loading ? 'جارٍ الإرسال…' : 'متابعة'} onPress={onSubmit} />
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator color={theme.color.accent2} />
          </View>
        ) : null}
        <View style={{ height: 12 }} />
        <SecondaryButton label="رجوع" onPress={() => pop()} />
      </ScrollView>
    </AppShell>
  );
}

type OtpProps = {
  next: 'login' | 'register';
  phone: string;
  challengeId: string;
  devOtp?: string;
};

export function OtpScreen({ next, phone, challengeId, devOtp }: OtpProps) {
  const { push, setSessionFromLogin, setSessionFromVerify, pop } = useApp();
  const useApi = useRealAuth();
  const base = getExpoApiBaseUrl();
  const isMock = challengeId === 'mock' || !useApi;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onContinueMock = () => {
    if (next === 'login') {
      setSessionFromLogin({ displayName: 'ليلى نزار', phone, city: 'بغداد' });
    } else {
      push({ name: 'register_profile', phone });
    }
  };

  const onContinueApi = () => {
    if (!base) {
      setErr('عنوان الخادم غير مضبوط');
      return;
    }
    setErr('');
    setLoading(true);
    const api = createAuthApi(base);
    void (async () => {
      try {
        const r = await api.verifyOtp({ challengeId, code: code.trim(), phone: phone.trim() });
        await setSessionFromVerify(r.user, {
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          sessionId: r.sessionId,
        });
      } catch (e) {
        setErr(mapAuthErrorToAr(e, 'verify_otp'));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <AppShell>
      <ScrollView>
        <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>
          رمز التحقق
        </Text>
        {useApi && !isMock ? (
          <Text
            style={{
              color: theme.color.accent2,
              textAlign: 'right',
              marginTop: 10,
              fontSize: 14,
            }}
          >
            {SUCCESS_WHATSAPP}
          </Text>
        ) : null}
        <Text style={{ color: theme.color.muted, textAlign: 'right', marginTop: 8 }}>{phone}</Text>
        {isMock ? (
          <Text
            style={{
              color: theme.color.dim,
              textAlign: 'right',
              marginTop: 12,
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            وضع واجهة: لا خادم. اكتب أي أرقام للمتابعة. يبقى سير الحجز والمطاعم نموذجياً.
          </Text>
        ) : null}
        {devOtp ? <DevOtpBox code={devOtp} /> : null}
        <View style={{ marginTop: 20 }} />
        <TextField
          label="الرمز"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
        />
        {err ? (
          <Text style={{ color: theme.color.danger, textAlign: 'right', marginTop: 8 }}>{err}</Text>
        ) : null}
        <Text style={{ color: theme.color.dim, textAlign: 'right', fontSize: 12, marginTop: 8 }}>
          لم يصلك؟ أعد إرسال الطلب من الخطوة السابقة
        </Text>
        <View style={{ marginTop: 20 }} />
        <PrimaryButton
          label={loading ? 'جارٍ التحقق…' : 'متابعة'}
          onPress={() => {
            if (isMock) onContinueMock();
            else onContinueApi();
          }}
        />
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator color={theme.color.accent2} />
          </View>
        ) : null}
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
          الهاتف: {phone}
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
