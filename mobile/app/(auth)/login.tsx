import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/authStore';
import GradientButton from '@/components/ui/GradientButton';
import InputField from '@/components/ui/InputField';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuthStore();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'E-posta zorunludur.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta giriniz.';
    if (!password) newErrors.password = 'Şifre zorunludur.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/(tabs)');
    } catch {
      Toast.show({ type: 'error', text1: 'Giriş Başarısız', text2: 'E-posta veya şifre hatalı.' });
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#16162A', '#1A0A2E']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🔮</Text>
            <Text style={styles.appName}>Fallingo</Text>
            <Text style={styles.tagline}>Geleceğin sırları burada açılıyor</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Hoş Geldin</Text>
            <Text style={styles.subtitle}>Hesabına giriş yap</Text>

            <InputField
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <InputField
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <GradientButton
              title="Giriş Yap"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.button}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                Hesabın yok mu?{' '}
                <Text style={styles.registerLink}>Kayıt Ol</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stars decoration */}
          <Text style={styles.stars}>✨ ⭐ ✨</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: { fontSize: 60, marginBottom: SPACING.sm },
  appName: {
    fontSize: FONTS.sizes.display,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: SPACING.lg, marginTop: -SPACING.sm },
  forgotText: { color: COLORS.primaryLight, fontSize: FONTS.sizes.sm },
  button: { marginTop: SPACING.xs },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.sm,
  },
  registerButton: { alignItems: 'center' },
  registerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  registerLink: { color: COLORS.primaryLight, fontWeight: '700' },
  stars: { textAlign: 'center', marginTop: SPACING.xl, fontSize: 20 },
});
