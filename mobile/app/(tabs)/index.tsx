import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, FORTUNE_TYPES } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

function FortuneCard({ fortune, index }: { fortune: typeof FORTUNE_TYPES[number]; index: number }) {
  const user = useAuthStore((s) => s.user);
  const isPremiumLocked = fortune.isPremium && user?.subscription.plan === 'free';

  const handlePress = () => {
    if (isPremiumLocked) {
      router.push('/fortune/premium');
      return;
    }
    router.push(`/fortune/${fortune.id === 'dream' ? 'dream' : fortune.id}` as any);
  };

  return (
    <TouchableOpacity
      style={[styles.fortuneCard, { width: CARD_WIDTH }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[...fortune.gradient] as [string, string]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isPremiumLocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color={COLORS.white} />
            <Text style={styles.lockText}>Premium</Text>
          </View>
        )}

        <Text style={styles.cardEmoji}>{fortune.emoji}</Text>
        <Text style={styles.cardTitle}>{fortune.title}</Text>
        <Text style={styles.cardSubtitle}>{fortune.subtitle}</Text>

        <View style={styles.cardArrow}>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const plan = user?.subscription.plan || 'free';
  const dailyCount = user?.dailyFortuneCount.count || 0;
  const dailyLimit = plan === 'premium' ? 20 : plan === 'vip' ? 999 : 3;
  const remaining = Math.max(0, dailyLimit - dailyCount);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#12102A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]} ✨</Text>
              <Text style={styles.headerSubtitle}>Bugün hangi sırrı keşfetmek istiyorsun?</Text>
            </View>
            <TouchableOpacity
              style={styles.premiumBadge}
              onPress={() => router.push('/fortune/premium')}
            >
              <LinearGradient
                colors={plan === 'free' ? ['#374151', '#1F2937'] : COLORS.gradientGold}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.badgeText}>
                  {plan === 'free' ? '🆓 Free' : plan === 'premium' ? '⭐ Premium' : '👑 VIP'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Daily Limit Bar */}
          <View style={styles.limitCard}>
            <View style={styles.limitRow}>
              <View style={styles.limitLeft}>
                <Ionicons name="flame" size={16} color={COLORS.accent} />
                <Text style={styles.limitTitle}>Günlük Fal Hakkı</Text>
              </View>
              <Text style={styles.limitCount}>
                <Text style={{ color: remaining > 0 ? COLORS.success : COLORS.error }}>{remaining}</Text>
                <Text style={{ color: COLORS.textMuted }}>/{dailyLimit}</Text>
              </Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={[styles.progressFill, { width: `${Math.min(100, (dailyCount / dailyLimit) * 100)}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            {plan === 'free' && (
              <TouchableOpacity onPress={() => router.push('/fortune/premium')}>
                <Text style={styles.upgradeHint}>
                  Premium'a geç → günde 20 fal hakkı kazan ✨
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Fortune Types */}
          <Text style={styles.sectionTitle}>Fal Türleri</Text>
          <View style={styles.fortuneGrid}>
            {FORTUNE_TYPES.map((fortune, index) => (
              <FortuneCard key={fortune.id} fortune={fortune} index={index} />
            ))}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 İstatistiklerim</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.totalReadings || 0}</Text>
                <Text style={styles.statLabel}>Toplam Fal</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dailyCount}</Text>
                <Text style={styles.statLabel}>Bugün</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.zodiacSign || '—'}</Text>
                <Text style={styles.statLabel}>Burcun</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  premiumBadge: { borderRadius: RADIUS.full, overflow: 'hidden' },
  badgeGradient: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  badgeText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },

  limitCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
  },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  limitLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  limitTitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  limitCount: { fontSize: FONTS.sizes.md, fontWeight: '700' },
  progressBg: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  upgradeHint: { fontSize: FONTS.sizes.xs, color: COLORS.primaryLight, fontWeight: '600' },

  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  fortuneCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    aspectRatio: 0.9,
  },
  cardGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  lockText: { fontSize: 9, color: COLORS.white, fontWeight: '700' },
  cardEmoji: { fontSize: 36, marginVertical: SPACING.xs },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.white, marginBottom: 2 },
  cardSubtitle: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.75)', lineHeight: 16 },
  cardArrow: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.full,
    padding: SPACING.xs,
  },

  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statsTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primaryLight, marginBottom: 2 },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.cardBorder },
});
