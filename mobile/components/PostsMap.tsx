import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme';
import type { Post } from '../types';

type Props = { posts: Post[]; onSelect: (post: Post) => void };

export default function PostsMap({ posts, onSelect }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{ latitude: 49.8397, longitude: 24.0297, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
      >
        {posts.filter((p) => p.lat != null && p.lng != null).map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat as number, longitude: p.lng as number }}
            pinColor={p.type === 'has_housing' ? colors.has : colors.seek}
            title={p.title}
            description={`${p.price} грн/міс · натисни для деталей`}
            onCalloutPress={() => onSelect(p)}
          />
        ))}
      </MapView>
      <View style={s.legend}>
        <Text style={{ color: colors.has }}>● Мають житло</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  legend: { position: 'absolute', top: 12, left: 12, backgroundColor: '#fff', padding: 8, borderRadius: 8 },
});