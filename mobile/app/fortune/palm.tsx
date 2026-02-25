import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useImagePicker } from '@/hooks/useImagePicker';
import { fortuneService, getApiError } from '@/services/api';
import GradientButton from '@/components/ui/GradientButton';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

export default function PalmScreen() {
  const { image, pickFromGallery, takePhoto, clearImage } = useImagePicker();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = () => {
    Alert.alert('Fotoğraf Seç', 'El fotoğrafını nasıl eklemek istersiniz?', [
      { text: 'Galeri', onPress: pickFromGallery },
      { text: 'Kamera', onPress: takePhoto },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!image) {
      Toast.show({ type: 'error', text1: 'Fotoğraf Gerekli', text2: 'Lütfen el fotoğrafı ekleyin.' });
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const formData = new FormData();
      formData.append('image', { uri: image.uri, name: image.fileName, type: image.mimeType } as any);
      if (note.trim()) formData.append('userNote', note.trim());
      const { data } = await fortuneService.createPalmReading(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/fortune/result', params: { id: data.reading._id } });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#001A0D', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient colors={['#065F46', '#10B981']} style={styles.iconCircle}>
              <Text style={{ fontSize: 36 }}>✋</Text>
            </LinearGradient>
            <Text style={styles.title}>El Falı</Text>
            <Text style={styles.subtitle}>Avuç içinizin fotoğrafını yükleyin, çizgileriniz konuşsun</Text>
          </View>

          {/* Palm Lines Info */}
          <View style={styles.linesCard}>
            <Text style={styles.linesTitle}>🔍 Analiz Edilecek Çizgiler</Text>
            <View style={styles.linesGrid}>
              {[
                { emoji: '❤️', name: 'Kalp Çizgisi', desc: 'Duygusal yaşam' },
                { emoji: '🧠', name: 'Kafa Çizgisi', desc: 'Zihinsel yapı' },
                { emoji: '🌿', name: 'Yaşam Çizgisi', desc: 'Yaşam enerjisi' },
                { emoji: '⭐', name: 'Kader Çizgisi', desc: 'Kariyer ve başarı' },
              ].map((line) => (
                <View key={line.name} style={styles.lineItem}>
                  <Text style={styles.lineEmoji}>{line.emoji}</Text>
                  <Text style={styles.lineName}>{line.name}</Text>
                  <Text style={styles.lineDesc}>{line.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.imageArea, image && styles.imageAreaFilled]}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImage} onPress={clearImage}>
                  <Ionicons name="close-circle" size={28} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <LinearGradient colors={['#065F4622', '#10B98122']} style={styles.uploadIcon}>
                  <Ionicons name="hand-left-outline" size={36} color="#10B981" />
                </LinearGradient>
                <Text style={styles.uploadTitle}>El Fotoğrafı Ekle</Text>
                <Text style={styles.uploadHint}>Avuç içini net ve düz tutarak çekin</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>📝 Notunuz (opsiyonel)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Özellikle merak ettiğiniz bir konu var mı?"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={300}
            />
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>✋ Elin yorumlanıyor...</Text>
              <Text style={styles.loadingSubtext}>Çizgiler okunuyor, lütfen bekleyin</Text>
            </View>
          ) : (
            <GradientButton
              title="✋ Falımı Baktır"
              onPress={handleSubmit}
              gradient={['#065F46', '#10B981']}
              disabled={!image}
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
  linesCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  linesTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  linesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  lineItem: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center',
  },
  lineEmoji: { fontSize: 20, marginBottom: 2 },
  lineName: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  lineDesc: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  imageArea: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, borderWidth: 2,
    borderColor: COLORS.cardBorder, borderStyle: 'dashed',
    overflow: 'hidden', marginBottom: SPACING.lg, minHeight: 200,
    justifyContent: 'center', alignItems: 'center',
  },
  imageAreaFilled: { borderStyle: 'solid', borderColor: '#10B981' },
  imageContainer: { width: '100%' },
  previewImage: { width: '100%', height: 240 },
  removeImage: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  uploadPlaceholder: { padding: SPACING.xl, alignItems: 'center' },
  uploadIcon: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  uploadTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  uploadHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  noteCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  noteLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  noteInput: { color: COLORS.text, fontSize: FONTS.sizes.sm, minHeight: 70, textAlignVertical: 'top' },
  loadingCard: {
    alignItems: 'center', padding: SPACING.xl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#10B981',
    marginBottom: SPACING.lg,
  },
  loadingText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  loadingSubtext: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
