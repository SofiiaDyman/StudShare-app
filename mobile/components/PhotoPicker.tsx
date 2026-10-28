import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocalPhoto } from '../services/uploadPhotos';

type Props = { photos: LocalPhoto[]; onChange: (photos: LocalPhoto[]) => void; max?: number };

export default function PhotoPicker({ photos, onChange, max = 6 }: Props) {
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const add = (items: LocalPhoto[]) => {
    const available = Math.max(0, max - photos.length);
    const accepted = items.slice(0, available);
    items.slice(available).forEach((photo) => {
      if (photo.uri.startsWith('blob:')) URL.revokeObjectURL(photo.uri);
    });
    if (accepted.length < items.length) Alert.alert(`Максимум ${max} фото`);
    if (accepted.length) onChange([...photos, ...accepted]);
  };

  const pick = async () => {
    if (photos.length >= max) {
      Alert.alert(`Максимум ${max} фото`);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: max - photos.length,
        quality: 0.7,
      });
      if (result.canceled) return;
      add(result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      })));
    } catch (error) {
      console.error('Photo selection error:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати фото');
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'));
      if (!files.length) return;
      add(files.map((file, index) => ({
        uri: URL.createObjectURL(file),
        name: file.name || `pasted-${Date.now()}-${index}.png`,
        type: file.type,
      })));
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  useEffect(() => () => {
    photosRef.current.forEach((photo) => {
      if (photo.uri.startsWith('blob:')) URL.revokeObjectURL(photo.uri);
    });
  }, []);

  return (
    <View style={s.wrap}>
      <View style={s.grid}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={s.thumb}>
            <Image source={{ uri: photo.uri }} style={s.img} contentFit="cover" />
            <Pressable
              style={s.remove}
              hitSlop={8}
              onPress={() => {
                if (photo.uri.startsWith('blob:')) URL.revokeObjectURL(photo.uri);
                onChange(photos.filter((_, photoIndex) => photoIndex !== index));
              }}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {photos.length < max && (
          <Pressable style={[s.thumb, s.add]} onPress={pick}>
            <Ionicons name="image-outline" size={22} color="#536C47" />
            <Text style={s.addText}>Додати</Text>
          </Pressable>
        )}
      </View>
      <Text style={s.hint}>
        До {max} фото{Platform.OS === 'web' ? ' · можна вставити з буфера (Ctrl+V)' : ''}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumb: { width: 92, height: 92, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  add: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9C7AE', backgroundColor: '#FBFBF7', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addText: { color: '#536C47', fontSize: 11, fontWeight: '700' },
  hint: { color: '#92998E', fontSize: 11 },
});
