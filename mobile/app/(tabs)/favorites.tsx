import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import PostCard from '../../components/PostCard';
import { api } from '../../services/api';
import type { Post } from '../../types';

export default function FavoritesScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    api.get('/favorites')
      .then(({ data }) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  return (
    <View style={s.screen}>
      <FlatList
        data={posts}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.heading}>
            <Text style={s.eyebrow}>ТЕ, ЩО СПОДОБАЛОСЬ</Text>
            <Text style={s.title}>Обране</Text>
            <Text style={s.subtitle}>Збережені варіанти завжди під рукою.</Text>
          </View>
        }
        ListEmptyComponent={loading
          ? <ActivityIndicator style={{ marginTop: 40 }} />
          : <View style={s.emptyCard}>
              <View style={s.emptyIcon}><Ionicons name="heart-outline" size={22} color="#536C47" /></View>
              <Text style={s.emptyTitle}>Тут поки порожньо</Text>
              <Text style={s.emptyText}>Зберігай оголошення, які сподобались, і повертайся до них пізніше.</Text>
            </View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  list: { width: '100%', maxWidth: 1040, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 26, paddingBottom: 36, gap: 14 },
  heading: { gap: 5, marginBottom: 8 },
  eyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#29382C', fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: '#7C8378', fontSize: 13 },
  emptyCard: { alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#FBFBF7', padding: 30 },
  emptyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#344435', fontSize: 14, fontWeight: '800' },
  emptyText: { maxWidth: 340, color: '#7C8378', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});