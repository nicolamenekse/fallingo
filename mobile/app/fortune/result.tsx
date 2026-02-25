import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { fortuneService, getApiError } from '@/services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';
import type { FortuneReading } from '@/types';

const TYPE_CONFIG: Record<string, { emoji: string; color: string; gradient: [string, string] }> = {
  coffee: { emoji: '☕', color: '#D97706', gradient: ['#92400E', '#D97706'] },
  palm: { emoji: '✋', color: '#10B981', gradient: ['#065F46', '#10B981'] },
  tarot: { emoji: '🃏', color: '#8B5CF6', gradient: ['#4C1D95', '#7C3AED'] },
  horoscope: { emoji: '⭐', color: '#60A5FA', gradient: ['#1E3A5F', '#2563EB'] },
};

const SECTION_LABELS: Record<string, { emoji: string; label: string }> = {
  general: { emoji: '🔮', label: 'Genel Yorum' },
  love: { emoji: '❤️', label: 'Aşk & İlişkiler' },
  career: { emoji: '💼', label: 'Kariyer & İş' },
  health: { emoji: '💚', label: 'Sağlık' },
  finance: { emoji: '💰', label: 'Maddi Durum' },
  advice: { emoji: '✨', label: 'Tavsiye' },
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reading, setReading] = useState<FortuneReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadReading();
  }, [id]);

  const loadReading = async () => {
    try {
      const { data } = await fortuneService.getReading(id);
      setReading(data.reading);
      setIsFavorite(data.reading.isFavorite);
      setRating(data.reading.userRating || 0);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Fal yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await fortuneService.toggleFavorite(id);
      setIsFavorite((prev) => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Toast.show({ type: 'success', text1: isFavorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi' });
    } catch {}
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    Haptics.selectionAsync();
    try {
      await fortuneService.rateReading(id, { rating: stars });
      Toast.show({ type: 'success', text1: 'Puanınız kaydedildi ✨' });
    } catch {}
  };

  const handleShare = async () => {
    try {
      const { data } = await fortuneService.shareReading(id);
      await Share.share({ message: `Fallingo'dan fal yorumum: ${data.shareUrl}` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>🔮 Fal yorumunuz yükleniyor...</Text>
      </View>
    );
  }

  if (!reading) return null;

  const config = TYPE_CONFIG[reading.type] || TYPE_CONFIG.coffee;

  return (
    <LinearGradient colors={['#0D0D1A', '#12102A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Top Actions */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleToggleFavorite}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.error : COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header */}
          <LinearGradient colors={config.gradient} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.headerEmoji}>{config.emoji}</Text>
            <Text style={styles.headerTitle}>{reading.title}</Text>
            <Text style={styles.headerDate}>
              {new Date(reading.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
            {/* Lucky Numbers & Colors */}
            {reading.reading.luckyNumbers.length > 0 && (
              <View style={styles.luckyRow}>
                <Text style={styles.luckyLabel}>🍀 Şanslı Sayılar: </Text>
                <Text style={styles.luckyValues}>{reading.reading.luckyNumbers.join(' · ')}</Text>
              </View>
            )}
            {reading.reading.luckyColors.length > 0 && (
              <View style={styles.luckyRow}>
                <Text style={styles.luckyLabel}>🎨 Şanslı Renkler: </Text>
                <Text style={styles.luckyValues}>{reading.reading.luckyColors.join(' · ')}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Tarot Cards */}
          {reading.type === 'tarot' && reading.tarotCards && reading.tarotCards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🃏 Çekilen Kartlar</Text>
              {reading.tarotCards.map((card, i) => (
                <View key={i} style={styles.tarotCard}>
                  <View style={styles.tarotCardHeader}>
                    <Text style={styles.tarotPosition}>{card.position}</Text>
                    {card.isReversed && <View style={styles.reversedBadge}><Text style={styles.reversedText}>Ters</Text></View>}
                  </View>
                  <Text style={styles.tarotName}>{card.name}</Text>
                  <Text style={styles.tarotMeaning}>{card.meaning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Palm Lines */}
          {reading.type === 'palm' && reading.palmData?.lines && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✋ El Çizgisi Analizi</Text>
              {Object.entries(reading.palmData.lines).map(([key, value]) => {
                if (!value) return null;
                const labels: Record<string, string> = { heart: '❤️ Kalp', head: '🧠 Kafa', life: '🌿 Yaşam', fate: '⭐ Kader' };
                return (
                  <View key={key} style={styles.palmLine}>
                    <Text style={styles.palmLineTitle}>{labels[key]} Çizgisi</Text>
                    <Text style={styles.palmLineText}>{value}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Reading Sections */}
          {Object.entries(reading.reading.sections).map(([key, value]) => {
            if (!value) return null;
            const sec = SECTION_LABELS[key];
            if (!sec) return null;
            return (
              <View key={key} style={styles.readingSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEmoji}>{sec.emoji}</Text>
                  <Text style={styles.sectionLabel}>{sec.label}</Text>
                </View>
                <Text style={styles.sectionText}>{value}</Text>
              </View>
            );
          })}

          {/* Keywords */}
          {reading.reading.keywords.length > 0 && (
            <View style={styles.keywordsSection}>
              <Text style={styles.sectionTitle}>🔑 Anahtar Kelimeler</Text>
              <View style={styles.keywordsRow}>
                {reading.reading.keywords.map((kw, i) => (
                  <View key={i} style={styles.keyword}>
                    <Text style={styles.keywordText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Bu yorumu nasıl buldunuz?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? COLORS.accent : COLORS.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* New Reading Button */}
          <TouchableOpacity style={styles.newReadingBtn} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.newReadingGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.newReadingText}>✨ Yeni Fal Baktır</Text>
            </LinearGradient>
          </TouchableOpacity>

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
  loadingScreen: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', gap: SPACING.lg,
  },
  loadingText: { fontSize: FONTS.sizes.lg, color: COLORS.text, fontWeight: '600' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  topActions: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 40, height: 40, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center',
  },
  headerCard: {
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  headerEmoji: { fontSize: 52, marginBottom: SPACING.sm },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  headerDate: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.md },
  luckyRow: { flexDirection: 'row', alignItems: 'center' },
  luckyLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  luckyValues: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  tarotCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  tarotCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tarotPosition: { fontSize: FONTS.sizes.xs, color: COLORS.primaryLight, fontWeight: '600' },
  reversedBadge: {
    backgroundColor: COLORS.error + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  reversedText: { fontSize: 10, color: COLORS.error, fontWeight: '700' },
  tarotName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  tarotMeaning: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  palmLine: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  palmLineTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  palmLineText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  readingSection: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectionEmoji: { fontSize: 20 },
  sectionLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  sectionText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },
  keywordsSection: { marginBottom: SPACING.lg },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  keyword: {
    backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.primary + '44',
  },
  keywordText: { fontSize: FONTS.sizes.xs, color: COLORS.primaryLight, fontWeight: '600' },
  ratingCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  ratingTitle: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600', marginBottom: SPACING.md },
  starsRow: { flexDirection: 'row', gap: SPACING.sm },
  newReadingBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  newReadingGradient: {
    paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 52,
  },
  newReadingText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white },
});
