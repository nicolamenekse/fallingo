import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
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

const DREAM_EXAMPLES = [
  'Uçtuğumu gördüm, bulutların üzerinde süzülüyordum...',
  'Denizin ortasındaydım, dalgalar yükseliyordu...',
  'Eski bir evdeydim, karanlık koridorlarda yürüyordum...',
  'Birinin peşimden koştuğunu gördüm, kaçmaya çalışıyordum...',
];

const SYMBOL_HINTS = [
  { emoji: '🌊', label: 'Su / Deniz' },
  { emoji: '🦋', label: 'Kelebek' },
  { emoji: '🐍', label: 'Yılan' },
  { emoji: '✈️', label: 'Uçmak' },
  { emoji: '🏠', label: 'Ev' },
  { emoji: '🌙', label: 'Ay' },
  { emoji: '🔑', label: 'Anahtar' },
  { emoji: '💀', label: 'Ölüm' },
];

export default function DreamScreen() {
  const [dreamText, setDreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (text: string) => {
    setDreamText(text);
    setCharCount(text.length);
  };

  const handleExample = (example: string) => {
    setDreamText(example);
    setCharCount(example.length);
    Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    if (dreamText.trim().length < 10) {
      Toast.show({ type: 'error', text1: 'Rüyayı Anlatın', text2: 'Lütfen rüyanızı en az 10 karakter ile açıklayın.' });
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { data } = await fortuneService.createDreamReading({ dreamText: dreamText.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/fortune/dream-result', params: { id: data.reading._id } });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#0A0A1F', '#12001A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#4A0080', '#9333EA']} style={styles.iconCircle}>
                <Text style={{ fontSize: 38 }}>🌙</Text>
              </LinearGradient>
              <Text style={styles.title}>Rüya Tabiri</Text>
              <Text style={styles.subtitle}>
                Rüyanı anlat, bilinçaltının sırları açığa çıksın
              </Text>
            </View>

            {/* Dream Input */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>🌙 Rüyanızı Anlatın</Text>
                <Text style={[styles.charCount, charCount > 1800 && { color: COLORS.error }]}>
                  {charCount}/2000
                </Text>
              </View>
              <TextInput
                style={styles.dreamInput}
                placeholder="Rüyanızı mümkün olduğunca detaylı anlatın. Gördüğünüz kişiler, mekanlar, renkler, duygular... ne kadar çok detay verirseniz yorum o kadar isabetli olur."
                placeholderTextColor={COLORS.textMuted}
                value={dreamText}
                onChangeText={handleChange}
                multiline
                maxLength={2000}
                textAlignVertical="top"
              />

              {/* Quick examples */}
              {dreamText.length === 0 && (
                <View style={styles.examplesSection}>
                  <Text style={styles.examplesLabel}>Örnek başlangıçlar:</Text>
                  {DREAM_EXAMPLES.map((ex, i) => (
                    <TouchableOpacity key={i} style={styles.exampleChip} onPress={() => handleExample(ex)}>
                      <Text style={styles.exampleText} numberOfLines={1}>{ex}</Text>
                      <Ionicons name="add-circle-outline" size={16} color={COLORS.primaryLight} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Symbol hints */}
            <View style={styles.symbolsCard}>
              <Text style={styles.symbolsTitle}>✨ Rüyanızda Bunlar Var Mıydı?</Text>
              <Text style={styles.symbolsSubtitle}>Semboller yorumu derinleştirir, anlatımınıza ekleyin</Text>
              <View style={styles.symbolsGrid}>
                {SYMBOL_HINTS.map((s) => (
                  <TouchableOpacity
                    key={s.label}
                    style={styles.symbolChip}
                    onPress={() => {
                      setDreamText((prev) => prev + (prev ? ', ' : '') + s.label.toLowerCase());
                      setCharCount((prev) => prev + s.label.length + 2);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.symbolEmoji}>{s.emoji}</Text>
                    <Text style={styles.symbolLabel}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Daha İyi Yorum İçin</Text>
              {[
                'Rüyayı uyanır uyanmaz not alın, detaylar çabuk unutulur',
                'Rüyadaki duygularınızı mutlaka belirtin (korku, sevinç...)',
                'Gördüğünüz renkleri ve sayıları ekleyin',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipDot}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Submit */}
            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#9333EA" />
                <Text style={styles.loadingText}>🌙 Rüyanız yorumlanıyor...</Text>
                <Text style={styles.loadingSubtext}>Bilinçaltı sembolleri çözümleniyor</Text>
              </View>
            ) : (
              <GradientButton
                title="🌙 Rüyamı Yorumla"
                onPress={handleSubmit}
                gradient={['#4A0080', '#9333EA']}
                disabled={dreamText.trim().length < 10}
              />
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
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

  inputCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1.5, borderColor: '#4A0080', marginBottom: SPACING.lg,
  },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  inputLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  dreamInput: {
    color: COLORS.text, fontSize: FONTS.sizes.md, minHeight: 160,
    lineHeight: 24, textAlignVertical: 'top',
  },
  examplesSection: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: SPACING.md },
  examplesLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.sm, fontWeight: '600' },
  exampleChip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.xs,
  },
  exampleText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, flex: 1, marginRight: SPACING.sm },

  symbolsCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  symbolsTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  symbolsSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.md },
  symbolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  symbolChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#4A008022', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#9333EA44',
  },
  symbolEmoji: { fontSize: 14 },
  symbolLabel: { fontSize: FONTS.sizes.xs, color: '#C084FC', fontWeight: '600' },

  tipsCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  tipsTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },
  tipDot: { color: '#9333EA', fontSize: FONTS.sizes.md },
  tipText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },

  loadingCard: {
    alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#9333EA', marginBottom: SPACING.lg,
  },
  loadingText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  loadingSubtext: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
