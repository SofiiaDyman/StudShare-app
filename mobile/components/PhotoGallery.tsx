import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';
import { photoUrl } from '../services/config';

export default function PhotoGallery({ photos }: { photos: string[] }) {
  if (!photos.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {photos.map((photo) => (
        <Image key={photo} source={{ uri: photoUrl(photo) }} style={s.img} contentFit="cover" />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 10 },
  img: { width: 320, height: 220, borderRadius: 16, backgroundColor: '#EEF1E8' },
});
