import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/authStore';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

const PLANS = [
  {
    id: 'premium_monthly',
    plan: 'premium',
    billing: 'Aylık',
    price: '49,99 ₺',
    pricePerMonth: '49,99 ₺',
    label: '⭐ Premium',
    color: COLORS.accent,
    gradient: COLORS.gradientGold,
    popular: false,
  },
  {
    id: 'premium_yearly',
    plan: 'premium',
    billing: 'Yıllık',
    price: '499,90 ₺',
    pricePerMonth: '41,65 ₺',
    label: '⭐ Premium',
    color: COLORS.accent,
    gradient: COLORS.gradientGold,
    popular: true,
    savings: '%2 Tasarruf',
  },
  {
    id: 'vip_monthly',
    plan: 'vip',
    billing: 'Aylık',
    price: '99,99 ₺',
    pricePerMonth: '99,99 ₺',
    label: '👑 VIP',
    color: '#F59E0B',
    gradient: ['#B45309', '#D97706'] as [string, string],
    popular: false,
  },
];

const FEATURES = [
  { icon: '☕', label: 'Kahve Falı', free: true, premium: true },
  { icon: '✋', label: 'El Falı', free: false, premium: true },
  { icon: '🃏', label: 'Tarot Falı', free: false, premium: true },
  { icon: '⭐', label: 'Yıldız Falı', free: false, premium: true },
  { icon: '🔥', label: 'Günlük Fal Hakkı', free: '3', premium: '20' },
  { icon: '📖', label: 'Fal Geçmişi', free: '7 gün', premium: '90 gün' },
  { icon: '🔗', label: 'Fal Paylaşımı', free: false, premium: true },
  { icon: '⚡', label: 'Öncelikli İşlem', free: false, premium: true },
];

export default function PremiumScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedPlan, setSelectedPlan] = useState('premium_yearly');
  const currentPlan = user?.subscription.plan || 'free';

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: 'info',
      text1: '🚧 Yakında Aktif',
      text2: 'Ödeme sistemi entegrasyonu tamamlanıyor.',
    });
  };

  if (currentPlan !== 'free') {
    return (
      <LinearGradient colors={['#0D0D1A', '#1A120A', '#0D0D1A']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.alreadyPremium}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 80, textAlign: 'center' }}>
              {currentPlan === 'vip' ? '👑' : '⭐'}
            </Text>
            <Text style={styles.alreadyTitle}>
              {currentPlan === 'vip' ? 'VIP Üyesiniz!' : 'Premium Üyesiniz!'}
            </Text>
            <Text style={styles.alreadySubtitle}>
              Tüm premium özelliklere erişiminiz aktif. Keyifli fallar! 🔮
            </Text>
            <TouchableOpacity style={styles.alreadyBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.alreadyBtnText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0D0D1A', '#1A120A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={{ fontSize: 60 }}>✨</Text>
            <Text style={styles.title}>Fallingo Premium</Text>
            <Text style={styles.subtitle}>
              Tüm fal türlerini keşfet, sınırları aş
            </Text>
          </View>

          {/* Plan Cards */}
          <Text style={styles.sectionTitle}>Plan Seç</Text>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
              onPress={() => { setSelectedPlan(plan.id); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.popularBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.popularText}>⭐ En Popüler</Text>
                </LinearGradient>
              )}
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={styles.planBilling}>{plan.billing}</Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.planPriceBlock}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={styles.planPerMonth}>{plan.pricePerMonth}/ay</Text>
                </View>
                <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]}>
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Feature Comparison */}
          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Özellik Karşılaştırması</Text>
          <View style={styles.featuresCard}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureHeaderLabel}>Özellik</Text>
              <Text style={[styles.featureHeaderPlan, { color: COLORS.textMuted }]}>Ücretsiz</Text>
              <Text style={[styles.featureHeaderPlan, { color: COLORS.accent }]}>Premium</Text>
            </View>
            {FEATURES.map((feature, i) => (
              <View key={i} style={[styles.featureRow, i % 2 === 0 && styles.featureRowAlt]}>
                <View style={styles.featureLeft}>
                  <Text style={styles.featureEmoji}>{feature.icon}</Text>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
                <View style={styles.featureValue}>
                  {feature.free === false ? (
                    <Ionicons name="close-circle" size={18} color={COLORS.error} />
                  ) : feature.free === true ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  ) : (
                    <Text style={styles.featureText}>{feature.free as string}</Text>
                  )}
                </View>
                <View style={styles.featureValue}>
                  {feature.premium === false ? (
                    <Ionicons name="close-circle" size={18} color={COLORS.error} />
                  ) : feature.premium === true ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  ) : (
                    <Text style={[styles.featureText, { color: COLORS.accent }]}>{feature.premium as string}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.85}>
            <LinearGradient
              colors={COLORS.gradientGold}
              style={styles.subscribeBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.subscribeBtnText}>✨ Premium'a Geç</Text>
              <Text style={styles.subscribeBtnSub}>İstediğin zaman iptal edebilirsin</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Ödeme Apple/Google hesabınızdan alınır. Abonelikler otomatik yenilenir.
          </Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  backBtn: {
    width: 40, height: 40, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.md },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  planCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1.5,
    borderColor: COLORS.cardBorder, marginBottom: SPACING.sm, overflow: 'hidden',
  },
  planCardSelected: { borderColor: COLORS.accent },
  popularBadge: { paddingVertical: SPACING.xs, alignItems: 'center' },
  popularText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },
  planRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  planInfo: { flex: 1 },
  planLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  planBilling: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  savingsBadge: {
    backgroundColor: COLORS.success + '22', alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full, marginTop: SPACING.xs,
  },
  savingsText: { fontSize: 10, color: COLORS.success, fontWeight: '700' },
  planPriceBlock: { alignItems: 'flex-end' },
  planPrice: { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  planPerMonth: { fontSize: 10, color: COLORS.textMuted },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.cardBorder, justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  featuresCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  featureHeader: {
    flexDirection: 'row', padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  featureHeaderLabel: { flex: 1, fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textMuted },
  featureHeaderPlan: { width: 70, fontSize: FONTS.sizes.xs, fontWeight: '700', textAlign: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  featureRowAlt: { backgroundColor: COLORS.surfaceLight + '50' },
  featureLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureEmoji: { fontSize: 16 },
  featureLabel: { fontSize: FONTS.sizes.xs, color: COLORS.text, fontWeight: '500' },
  featureValue: { width: 70, alignItems: 'center' },
  featureText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  subscribeBtn: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.md },
  subscribeBtnGradient: {
    paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center',
  },
  subscribeBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.white },
  subscribeBtnSub: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  disclaimer: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 18,
  },
  alreadyPremium: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
  alreadyTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  alreadySubtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  alreadyBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
  },
  alreadyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});
