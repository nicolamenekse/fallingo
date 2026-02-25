import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export interface PickedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

export function useImagePicker() {
  const [image, setImage] = useState<PickedImage | null>(null);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Galeri erişim izni verilmedi.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const picked: PickedImage = {
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        fileSize: asset.fileSize,
      };
      setImage(picked);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return picked;
    }
    return null;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Kamera erişim izni verilmedi.');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const picked: PickedImage = {
        uri: asset.uri,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        fileSize: asset.fileSize,
      };
      setImage(picked);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return picked;
    }
    return null;
  };

  const clearImage = () => setImage(null);

  return { image, pickFromGallery, takePhoto, clearImage };
}
