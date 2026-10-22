import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { isDemoPreviewEnabled } from '../services/demoPreview';
import { colors, ui } from '../theme';
import type { Post } from '../types';
import CompatibilityBadge from './CompatibilityBadge';

export default function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(post.id);
  const has = post.type === 'has_housing';

  return (
    <Pressable
      style={[s.card, post.status === 'closed' && { opacity: 0.6 }]}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
    >
      <View style={s.row}>
        <View style={[s.badge, { backgroundColor: has ? '#EAF0FA' : '#F8EEE4' }]}>
          <Text style={s.badgeText}>{has ? 'Маю житло' : 'Шукаю підселення'}</Text>
        </View>
        <Pressable hitSlop={10} disabled={isDemoPreviewEnabled()} onPress={() => toggle(post.id)}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? '#e74c3c' : colors.muted} />
        </Pressable>
      </View>

      <Text style={s.title}>{post.title}</Text>
      <Text style={s.price}>{post.price} грн<Text style={s.priceUnit}>/міс{has ? ' з особи' : ' (бюджет)'}</Text></Text>
      <Text style={s.meta}>{post.district}{post.address ? ` · ${post.address}` : ''}</Text>
      {post.status === 'closed' && <Text style={s.meta}>Місце знайдено</Text>}

      <View style={s.row}>
        <Text style={s.meta}>{post.author.full_name}{post.author.is_verified ? ' ✓' : ''}</Text>
        <CompatibilityBadge value={post.compatibility} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 10, borderWidth: 1, borderColor: '#E9EBE3' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#455343', fontSize: 11, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '800', color: '#29382C', letterSpacing: -0.2 },
  price: { fontSize: 19, fontWeight: '800', color: '#536C47' },
  priceUnit: { fontSize: 12, fontWeight: '600', color: '#798473' },
  meta: { fontSize: 12, color: '#7C8378' },
});