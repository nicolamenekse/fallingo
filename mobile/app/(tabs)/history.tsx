import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { historyService } from '@/services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';
import type { FortuneReading } from '@/types';

const TYPE_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  coffee: { emoji: '☕', label: 'Kahve', color: '#D97706' },
  palm: { emoji: '✋', label: 'El', color: '#10B981' },
  tarot: { emoji: '🃏', label: 'Tarot', color: '#8B5CF6' },
  horoscope: { emoji: '⭐', label: 'Yıldız', color: '#60A5FA' },
  dream: { emoji: '🌙', label: 'Rüya', color: '#9333EA' },
};

const FILTER_OPTIONS = [
  { id: '', label: 'Tümü' },
  { id: 'coffee', label: '☕ Kahve' },
  { id: 'palm', label: '✋ El' },
  { id: 'tarot', label: '🃏 Tarot' },
  { id: 'horoscope', label: '⭐ Yıldız' },
  { id: 'dream', label: '🌙 Rüya' },
  { id: 'favorites', label: '❤️ Favori' },
];

function ReadingCard({ item, onPress }: { item: FortuneReading; onPress: () => void }) {
  const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.coffee;
  return (
    <TouchableOpacity style={styles.readingCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.typeIcon, { backgroundColor: typeInfo.color + '22' }]}>
        <Text style={styles.typeEmoji}>{typeInfo.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.isFavorite && <Ionicons name="heart" size={14} color={COLORS.error} />}
        </View>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.reading.sections.general || item.reading.content}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.typeBadge, { color: typeInfo.color }]}>{typeInfo.label}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </Text>
          {item.userRating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={10} color={COLORS.accent} />
              <Text style={styles.ratingText}>{item.userRating}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  const isFavoriteFilter = activeFilter === 'favorites';
  const typeFilter = !isFavoriteFilter ? activeFilter : '';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['history', activeFilter, page],
    queryFn: async () => {
      if (isFavoriteFilter) {
        const res = await historyService.getFavorites({ page, limit: 20 });
        return res.data;
      }
      const res = await historyService.getHistory({ page, limit: 20, type: typeFilter || undefined });
      return res.data;
    },
  });

  const readings: FortuneReading[] = data?.readings || [];

  return (
    <LinearGradient colors={['#0D0D1A', '#12102A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Fal Geçmişi</Text>
          <Text style={styles.subtitle}>{data?.pagination?.total || 0} fal kaydı</Text>
        </View>

        {/* Filters */}
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterBtn, activeFilter === item.id && styles.filterBtnActive]}
              onPress={() => { setActiveFilter(item.id); setPage(1); }}
            >
              <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : readings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔮</Text>
            <Text style={styles.emptyTitle}>Henüz fal kaydı yok</Text>
            <Text style={styles.emptySubtitle}>İlk falınızı bakttırmak için ana sayfaya gidin</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.emptyBtnText}>Fal Baktır ✨</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={readings}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ReadingCard
                item={item}
                onPress={() => router.push({
                  pathname: item.type === 'dream' ? '/fortune/dream-result' : '/fortune/result',
                  params: { id: item._id },
                })}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
  filters: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm },
  filterBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  filterBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  filterText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
  filterTextActive: { color: COLORS.primaryLight },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
  emptyEmoji: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  emptyBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100, gap: SPACING.sm },
  readingCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  typeIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  typeEmoji: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  cardPreview: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 16, marginBottom: SPACING.xs },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  typeBadge: { fontSize: 10, fontWeight: '700' },
  cardDate: { fontSize: 10, color: COLORS.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 10, color: COLORS.accent, fontWeight: '700' },
});
