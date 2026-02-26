import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { fortuneService } from '@/services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';
import type { FortuneReading } from '@/types';

const SECTION_LABELS: Record<string, { emoji: string; label: string }> = {
  general: { emoji: '🌙', label: 'Genel Yorum' },
  love:    { emoji: '❤️', label: 'Aşk & İlişkiler' },
  career:  { emoji: '💼', label: 'Kariyer & İş' },
  health:  { emoji: '💚', label: 'Sağlık & Ruh Hali' },
  advice:  { emoji: '✨', label: 'Mesaj & Tavsiye' },
};

export default function DreamResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reading, setReading] = useState<FortuneReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => { loadReading(); }, [id]);

  const loadReading = async () => {
    try {
      const { data } = await fortuneService.getReading(id);
      setReading(data.reading);
      setIsFavorite(data.reading.isFavorite);
      setRating(data.reading.userRating || 0);
    } catch {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Yorum yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    await fortuneService.toggleFavorite(id);
    setIsFavorite((p) => !p);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    Haptics.selectionAsync();
    await fortuneService.rateReading(id, { rating: stars });
    Toast.show({ type: 'success', text1: 'Puanınız kaydedildi ✨' });
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>🌙 Rüya yorumu yükleniyor...</Text>
      </View>
    );
  }

  if (!reading) return null;

  const dream = (reading as any).dreamData;
  const isGood = dream?.isGoodDream !== false;

  return (
    <LinearGradient colors={['#0D0D1A', '#0A0A1F', '#12001A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Top Actions */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleFavorite}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.error : COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => Share.share({ message: reading.reading.content })}>
                <Ionicons name="share-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header Card */}
          <LinearGradient colors={['#4A0080', '#9333EA']} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.headerEmoji}>{isGood ? '🌙✨' : '🌙'}</Text>
            <Text style={styles.headerTitle}>Rüya Tabiri</Text>
            <View style={[styles.goodBadge, { backgroundColor: isGood ? '#10B98133' : '#EF444433' }]}>
              <Text style={[styles.goodBadgeText, { color: isGood ? '#10B981' : '#EF4444' }]}>
                {isGood ? '✓ Hayırlı Rüya' : '⚠ Dikkat Gerektiren Rüya'}
              </Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date(reading.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            {reading.reading.luckyNumbers?.length > 0 && (
              <Text style={styles.luckyText}>🍀 Şanslı Sayılar: {reading.reading.luckyNumbers.join(' · ')}</Text>
            )}
          </LinearGradient>

          {/* Rüya özeti */}
          {dream?.dreamText && (
            <View style={styles.dreamSummaryCard}>
              <Text style={styles.dreamSummaryLabel}>📖 Anlatılan Rüya</Text>
              <Text style={styles.dreamSummaryText} numberOfLines={4}>{dream.dreamText}</Text>
            </View>
          )}

          {/* Semboller */}
          {dream?.symbols?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Tespit Edilen Semboller</Text>
              <View style={styles.symbolsRow}>
                {dream.symbols.map((s: string, i: number) => (
                  <View key={i} style={styles.symbolTag}>
                    <Text style={styles.symbolTagText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sembol anlamları */}
          {dream?.symbolMeanings?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Sembol Anlamları</Text>
              {dream.symbolMeanings.map((sm: { symbol: string; meaning: string }, i: number) => (
                <View key={i} style={styles.symbolMeaningCard}>
                  <Text style={styles.symbolName}>🔮 {sm.symbol}</Text>
                  <Text style={styles.symbolMeaning}>{sm.meaning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bilinçaltı */}
          {dream?.subconscious && (
            <View style={styles.subconsciousCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>🧠</Text>
                <Text style={styles.sectionLabel}>Bilinçaltı Mesajı</Text>
              </View>
              <Text style={styles.sectionText}>{dream.subconscious}</Text>
            </View>
          )}

          {/* Yorum bölümleri */}
          {Object.entries(reading.reading.sections).map(([key, value]) => {
            if (!value || key === 'finance') return null;
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
          {reading.reading.keywords?.length > 0 && (
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

          {/* New Reading */}
          <TouchableOpacity style={styles.newBtn} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient colors={['#4A0080', '#9333EA']} style={styles.newBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.newBtnText}>🌙 Yeni Rüya Yorumla</Text>
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
  loadingScreen: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: SPACING.lg },
  loadingText: { fontSize: FONTS.sizes.lg, color: COLORS.text, fontWeight: '600' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  topActions: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: { width: 40, height: 40, backgroundColor: COLORS.card, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  headerCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  headerEmoji: { fontSize: 52, marginBottom: SPACING.sm },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm },
  goodBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.sm },
  goodBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  headerDate: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.xs },
  luckyText: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  dreamSummaryCard: {
    backgroundColor: '#4A008022', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#9333EA44', marginBottom: SPACING.lg,
  },
  dreamSummaryLabel: { fontSize: FONTS.sizes.xs, color: '#C084FC', fontWeight: '700', marginBottom: SPACING.xs },
  dreamSummaryText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  symbolsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  symbolTag: {
    backgroundColor: '#4A008033', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#9333EA55',
  },
  symbolTagText: { fontSize: FONTS.sizes.xs, color: '#C084FC', fontWeight: '600' },
  symbolMeaningCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  symbolName: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: '#C084FC', marginBottom: 4 },
  symbolMeaning: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  subconsciousCard: {
    backgroundColor: '#4A008022', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#9333EA44', marginBottom: SPACING.sm,
  },
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
    backgroundColor: '#4A008022', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: '#9333EA44',
  },
  keywordText: { fontSize: FONTS.sizes.xs, color: '#C084FC', fontWeight: '600' },
  ratingCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  ratingTitle: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600', marginBottom: SPACING.md },
  starsRow: { flexDirection: 'row', gap: SPACING.sm },
  newBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  newBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  newBtnText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white },
});
