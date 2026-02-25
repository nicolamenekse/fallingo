import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, ZODIAC_SIGNS } from '@/constants/theme';

function MenuItem({
  icon, label, subtitle, onPress, color, badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  badge?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: (color || COLORS.primary) + '22' }]}>
        <Ionicons name={icon} size={20} color={color || COLORS.primaryLight} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const plan = user?.subscription.plan || 'free';
  const zodiac = ZODIAC_SIGNS.find((z) => z.id === user?.zodiacSign);

  const planConfig = {
    free: { label: '🆓 Ücretsiz', color: COLORS.textMuted, gradient: ['#374151', '#1F2937'] as [string, string] },
    premium: { label: '⭐ Premium', color: COLORS.accent, gradient: COLORS.gradientGold },
    vip: { label: '👑 VIP', color: '#F59E0B', gradient: ['#B45309', '#D97706'] as [string, string] },
  };
  const currentPlan = planConfig[plan] || planConfig.free;

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#12102A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {zodiac && (
                <Text style={styles.zodiacText}>{zodiac.emoji} {zodiac.id}</Text>
              )}
            </View>
          </View>

          {/* Plan Badge */}
          <LinearGradient colors={currentPlan.gradient} style={styles.planCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.planLeft}>
              <Text style={styles.planLabel}>{currentPlan.label}</Text>
              <Text style={styles.planSubtitle}>
                {plan === 'free' ? 'Günde 3 fal hakkı' : plan === 'premium' ? 'Günde 20 fal hakkı' : 'Sınırsız fal hakkı'}
              </Text>
            </View>
            {plan === 'free' && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/fortune/premium')}
              >
                <Text style={styles.upgradeBtnText}>Yükselt ✨</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalReadings || 0}</Text>
              <Text style={styles.statLabel}>Toplam Fal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.dailyFortuneCount.count || 0}</Text>
              <Text style={styles.statLabel}>Bugün</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{zodiac?.emoji || '—'}</Text>
              <Text style={styles.statLabel}>{user?.zodiacSign || 'Burç Yok'}</Text>
            </View>
          </View>

          {/* Menu Sections */}
          <Text style={styles.sectionTitle}>Hesabım</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Profil Düzenle"
              subtitle="Ad, burç ve bilgilerini güncelle"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              label="Şifre Değiştir"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="notifications-outline"
              label="Bildirimler"
              subtitle="Günlük fal ve kampanya bildirimleri"
              onPress={() => {}}
            />
          </View>

          <Text style={styles.sectionTitle}>Premium</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="star-outline"
              label="Premium'a Geç"
              subtitle="Tüm fal türlerine eriş"
              color={COLORS.accent}
              badge="YENİ"
              onPress={() => router.push('/fortune/premium')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="card-outline"
              label="Abonelik Geçmişi"
              onPress={() => {}}
            />
          </View>

          <Text style={styles.sectionTitle}>Destek</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Yardım & SSS"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-outline"
              label="Gizlilik Politikası"
              onPress={() => {}}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Fallingo v1.0.0 🔮</Text>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  profileEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  zodiacText: { fontSize: FONTS.sizes.sm, color: COLORS.primaryLight },
  planCard: {
    borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg,
  },
  planLeft: { flex: 1 },
  planLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  planSubtitle: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.75)' },
  upgradeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  upgradeBtnText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primaryLight, marginBottom: 2 },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder },
  sectionTitle: {
    fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600' },
  menuSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginLeft: SPACING.md + 36 + SPACING.md },
  badge: {
    backgroundColor: COLORS.accent + '22', paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.full, marginRight: SPACING.xs,
  },
  badgeText: { fontSize: 9, color: COLORS.accent, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.error + '11', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.error + '33', marginBottom: SPACING.lg,
  },
  logoutText: { fontSize: FONTS.sizes.md, color: COLORS.error, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
