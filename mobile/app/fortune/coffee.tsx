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

export default function CoffeeScreen() {
  const { image, pickFromGallery, takePhoto, clearImage } = useImagePicker();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = () => {
    Alert.alert('Fotoğraf Seç', 'Fincan fotoğrafını nasıl eklemek istersiniz?', [
      { text: 'Galeri', onPress: pickFromGallery },
      { text: 'Kamera', onPress: takePhoto },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!image) {
      Toast.show({ type: 'error', text1: 'Fotoğraf Gerekli', text2: 'Lütfen fincan fotoğrafı ekleyin.' });
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      } as any);
      if (note.trim()) formData.append('userNote', note.trim());

      const { data } = await fortuneService.createCoffeeReading(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/fortune/result', params: { id: data.reading._id } });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: getApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#1A0D00', '#0D0D1A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={['#92400E', '#D97706']} style={styles.iconCircle}>
              <Text style={{ fontSize: 36 }}>☕</Text>
            </LinearGradient>
            <Text style={styles.title}>Kahve Falı</Text>
            <Text style={styles.subtitle}>
              Fincanınızın fotoğrafını yükleyin, yapay zeka sırlarını yorumlasın
            </Text>
          </View>

          {/* Image Upload */}
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
                <LinearGradient colors={['#92400E22', '#D9770622']} style={styles.uploadIcon}>
                  <Ionicons name="camera-outline" size={36} color="#D97706" />
                </LinearGradient>
                <Text style={styles.uploadTitle}>Fincan Fotoğrafı Ekle</Text>
                <Text style={styles.uploadHint}>JPG, PNG veya WebP • Maks. 10MB</Text>
                <View style={styles.uploadButtons}>
                  <View style={styles.uploadBtn}>
                    <Ionicons name="images-outline" size={14} color={COLORS.coffeeLight} />
                    <Text style={styles.uploadBtnText}>Galeri</Text>
                  </View>
                  <View style={styles.uploadBtn}>
                    <Ionicons name="camera-outline" size={14} color={COLORS.coffeeLight} />
                    <Text style={styles.uploadBtnText}>Kamera</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 İpuçları</Text>
            {[
              'Fincanı tamamen soğuttuktan sonra fotoğraflayın',
              'İyi aydınlatılmış bir ortamda çekim yapın',
              'Fincanın içini yukarıdan net görecek şekilde çekin',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>📝 Notunuz (opsiyonel)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Sormak istediğiniz bir şey var mı? (aşk, kariyer, vb.)"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={300}
            />
            <Text style={styles.noteCounter}>{note.length}/300</Text>
          </View>

          {/* Submit */}
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.coffeeLight} />
              <Text style={styles.loadingText}>🔮 Fincanınız yorumlanıyor...</Text>
              <Text style={styles.loadingSubtext}>Bu işlem 15-30 saniye sürebilir</Text>
            </View>
          ) : (
            <GradientButton
              title="☕ Falımı Baktır"
              onPress={handleSubmit}
              gradient={['#92400E', '#D97706']}
              disabled={!image}
              style={styles.submitBtn}
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
    width: 40, height: 40,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  iconCircle: {
    width: 80, height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  imageArea: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAreaFilled: { borderStyle: 'solid', borderColor: '#D97706' },
  imageContainer: { width: '100%', position: 'relative' },
  previewImage: { width: '100%', height: 250 },
  removeImage: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  uploadPlaceholder: { padding: SPACING.xl, alignItems: 'center' },
  uploadIcon: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  uploadTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  uploadHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.md },
  uploadButtons: { flexDirection: 'row', gap: SPACING.md },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#92400E22', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  uploadBtnText: { fontSize: FONTS.sizes.xs, color: COLORS.coffeeLight, fontWeight: '600' },
  tipsCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  tipsTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },
  tipDot: { color: COLORS.coffeeLight, fontSize: FONTS.sizes.md },
  tipText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },
  noteCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg,
  },
  noteLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  noteInput: {
    color: COLORS.text, fontSize: FONTS.sizes.sm, minHeight: 80,
    textAlignVertical: 'top', lineHeight: 20,
  },
  noteCounter: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'right', marginTop: SPACING.xs },
  loadingCard: {
    alignItems: 'center', padding: SPACING.xl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: '#D97706',
  },
  loadingText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  loadingSubtext: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  submitBtn: { marginBottom: SPACING.lg },
});
