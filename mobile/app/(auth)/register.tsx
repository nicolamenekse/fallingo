import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/authStore';
import GradientButton from '@/components/ui/GradientButton';
import InputField from '@/components/ui/InputField';
import { COLORS, FONTS, SPACING, RADIUS, ZODIAC_SIGNS } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuthStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'İsim zorunludur.';
    if (!email) newErrors.email = 'E-posta zorunludur.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta giriniz.';
    if (!password) newErrors.password = 'Şifre zorunludur.';
    else if (password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        zodiacSign: selectedSign || undefined,
      });
      router.replace('/(tabs)');
    } catch {
      Toast.show({ type: 'error', text1: 'Kayıt Başarısız', text2: 'Bu e-posta zaten kullanımda olabilir.' });
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#16162A', '#1A0A2E']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <Text style={styles.logo}>🌙</Text>
            <View>
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>Falcılık yolculuğuna başla</Text>
            </View>
          </View>

          <View style={styles.card}>
            <InputField
              label="Ad Soyad"
              placeholder="Adınızı girin"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              error={errors.name}
            />
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
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />
            <InputField
              label="Şifre Tekrar"
              placeholder="Şifreyi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.confirmPassword}
            />

            {/* Zodiac Sign Selection */}
            <Text style={styles.zodiacLabel}>Burcunuz (opsiyonel)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zodiacScroll}>
              {ZODIAC_SIGNS.map((sign) => (
                <TouchableOpacity
                  key={sign.id}
                  style={[styles.zodiacItem, selectedSign === sign.id && styles.zodiacSelected]}
                  onPress={() => setSelectedSign(selectedSign === sign.id ? '' : sign.id)}
                >
                  <Text style={styles.zodiacEmoji}>{sign.emoji}</Text>
                  <Text style={[styles.zodiacText, selectedSign === sign.id && styles.zodiacTextSelected]}>
                    {sign.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <GradientButton
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.button}
            />

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginText}>
                Hesabın var mı? <Text style={styles.loginLinkText}>Giriş Yap</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 50, paddingBottom: SPACING.xl },
  backButton: { marginBottom: SPACING.lg },
  backText: { color: COLORS.primaryLight, fontSize: FONTS.sizes.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  logo: { fontSize: 48 },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  zodiacLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  zodiacScroll: { marginBottom: SPACING.lg },
  zodiacItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginRight: SPACING.sm,
    minWidth: 60,
    backgroundColor: COLORS.surfaceLight,
  },
  zodiacSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  zodiacEmoji: { fontSize: 20, marginBottom: 2 },
  zodiacText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center' },
  zodiacTextSelected: { color: COLORS.primaryLight },
  button: { marginTop: SPACING.md },
  loginLink: { alignItems: 'center', marginTop: SPACING.lg },
  loginText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  loginLinkText: { color: COLORS.primaryLight, fontWeight: '700' },
});
