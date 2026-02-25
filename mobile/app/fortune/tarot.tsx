import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { fortuneService, getApiError } from '@/services/api';
import GradientButton from '@/components/ui/GradientButton';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

const SPREADS = [
  { count: 1, name: 'Günlük Tarot', desc: 'Bugün için tek kart rehberliği', emoji: '🃏' },
  { count: 3, name: 'Geçmiş · Şimdi · Gelecek', desc: '3 kartlık zaman spreadi', emoji: '🃏🃏🃏' },
  { count: 10, name: 'Celtic Cross', desc: '10 kartlık derinlemesine okuma', emoji: '⚜️' },
];

export default function TarotScreen() {
  const [selectedSpread, setSelectedSpread] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const { data } = await fortuneService.createTarotReading({ cardCount: selectedSpread, userNote: note.trim() || undefined });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/fortune/result', params: { id: data.reading._id } });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#0A0020', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.iconCircle}>
              <Text style={{ fontSize: 36 }}>🃏</Text>
            </LinearGradient>
            <Text style={styles.title}>Tarot Falı</Text>
            <Text style={styles.subtitle}>Evrenin mesajları kartlarda saklı. Hangi spreadi seçiyorsun?</Text>
          </View>

          {/* Spread Selection */}
          <Text style={styles.sectionTitle}>Spread Türü Seç</Text>
          {SPREADS.map((spread) => (
            <TouchableOpacity
              key={spread.count}
              style={[styles.spreadCard, selectedSpread === spread.count && styles.spreadCardSelected]}
              onPress={() => {
                setSelectedSpread(spread.count);
                Haptics.selectionAsync();
              }}
            >
              <View style={styles.spreadLeft}>
                <Text style={styles.spreadEmoji}>{spread.emoji}</Text>
                <View>
                  <Text style={styles.spreadName}>{spread.name}</Text>
                  <Text style={styles.spreadDesc}>{spread.desc}</Text>
                </View>
              </View>
              <View style={[styles.radioOuter, selectedSpread === spread.count && styles.radioOuterSelected]}>
                {selectedSpread === spread.count && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Animated cards decoration */}
          <View style={styles.cardsDecor}>
            {['🃏', '🎴', '🃏'].map((c, i) => (
              <Text key={i} style={[styles.decorCard, { transform: [{ rotate: `${(i - 1) * 15}deg` }] }]}>{c}</Text>
            ))}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>🔮 Sorunuz (opsiyonel)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Tarot'a sormak istediğiniz bir şey var mı?"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={300}
            />
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.primaryLight} />
              <Text style={styles.loadingText}>🃏 Kartlar çekiliyor...</Text>
              <Text style={styles.loadingSubtext}>Evren konuşuyor, lütfen bekleyin</Text>
            </View>
          ) : (
            <GradientButton
              title="🃏 Kartlarımı Çek"
              onPress={handleSubmit}
              gradient={['#4C1D95', '#7C3AED']}
            />
          )}
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
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  spreadCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  spreadCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  spreadLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  spreadEmoji: { fontSize: 24 },
  spreadName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  spreadDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.cardBorder, justifyContent: 'center', alignItems: 'center',
  },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  cardsDecor: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginVertical: SPACING.xl, gap: -20,
  },
  decorCard: { fontSize: 48, marginHorizontal: 10 },
  noteCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  noteLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  noteInput: { color: COLORS.text, fontSize: FONTS.sizes.sm, minHeight: 70, textAlignVertical: 'top' },
  loadingCard: {
    alignItems: 'center', padding: SPACING.xl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.primary, marginBottom: SPACING.lg,
  },
  loadingText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  loadingSubtext: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
