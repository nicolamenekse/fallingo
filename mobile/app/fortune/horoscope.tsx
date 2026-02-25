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
import { useAuthStore } from '@/store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, ZODIAC_SIGNS } from '@/constants/theme';

const PERIODS = [
  { id: 'Bugün', label: 'Bugün', emoji: '☀️' },
  { id: 'Bu hafta', label: 'Bu Hafta', emoji: '📅' },
  { id: 'Bu ay', label: 'Bu Ay', emoji: '🌙' },
  { id: 'Bu yıl', label: 'Bu Yıl', emoji: '⭐' },
];

export default function HoroscopeScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedSign, setSelectedSign] = useState(user?.zodiacSign || '');
  const [selectedPeriod, setSelectedPeriod] = useState('Bu hafta');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSign) {
      Toast.show({ type: 'error', text1: 'Burç Seçin', text2: 'Lütfen bir burç seçiniz.' });
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { data } = await fortuneService.createHoroscopeReading({
        zodiacSign: selectedSign,
        period: selectedPeriod,
        userNote: note.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/fortune/result', params: { id: data.reading._id } });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#000D1A', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient colors={['#1E3A5F', '#2563EB']} style={styles.iconCircle}>
              <Text style={{ fontSize: 36 }}>⭐</Text>
            </LinearGradient>
            <Text style={styles.title}>Yıldız Falı</Text>
            <Text style={styles.subtitle}>Burç bilgeliği ve gezegen enerjileriyle geleceğini keşfet</Text>
          </View>

          {/* Period Selection */}
          <Text style={styles.sectionTitle}>Dönem</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[styles.periodBtn, selectedPeriod === period.id && styles.periodBtnSelected]}
                onPress={() => { setSelectedPeriod(period.id); Haptics.selectionAsync(); }}
              >
                <Text style={styles.periodEmoji}>{period.emoji}</Text>
                <Text style={[styles.periodLabel, selectedPeriod === period.id && styles.periodLabelSelected]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Zodiac Sign Selection */}
          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Burcunuz</Text>
          <View style={styles.zodiacGrid}>
            {ZODIAC_SIGNS.map((sign) => (
              <TouchableOpacity
                key={sign.id}
                style={[styles.zodiacItem, selectedSign === sign.id && styles.zodiacSelected]}
                onPress={() => { setSelectedSign(sign.id); Haptics.selectionAsync(); }}
              >
                <Text style={styles.zodiacEmoji}>{sign.emoji}</Text>
                <Text style={[styles.zodiacText, selectedSign === sign.id && styles.zodiacTextSelected]}>
                  {sign.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>🌟 Sorunuz (opsiyonel)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Yıldızlara sormak istediğiniz bir şey var mı?"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={300}
            />
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#60A5FA" />
              <Text style={styles.loadingText}>⭐ Yıldızlar okunuyor...</Text>
              <Text style={styles.loadingSubtext}>Gezegenler konumlanıyor</Text>
            </View>
          ) : (
            <GradientButton
              title="⭐ Yıldız Falıma Bak"
              onPress={handleSubmit}
              gradient={['#1E3A5F', '#2563EB']}
              disabled={!selectedSign}
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
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  periodScroll: { marginBottom: SPACING.lg },
  periodBtn: {
    alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    marginRight: SPACING.sm, backgroundColor: COLORS.card, minWidth: 80,
  },
  periodBtnSelected: { borderColor: '#2563EB', backgroundColor: '#2563EB22' },
  periodEmoji: { fontSize: 20, marginBottom: 2 },
  periodLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
  periodLabelSelected: { color: '#60A5FA' },
  zodiacGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  zodiacItem: {
    width: '22%', alignItems: 'center', paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  zodiacSelected: { borderColor: '#2563EB', backgroundColor: '#2563EB22' },
  zodiacEmoji: { fontSize: 22, marginBottom: 2 },
  zodiacText: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },
  zodiacTextSelected: { color: '#60A5FA', fontWeight: '700' },
  noteCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  noteLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  noteInput: { color: COLORS.text, fontSize: FONTS.sizes.sm, minHeight: 70, textAlignVertical: 'top' },
  loadingCard: {
    alignItems: 'center', padding: SPACING.xl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: '#2563EB', marginBottom: SPACING.lg,
  },
  loadingText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  loadingSubtext: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
