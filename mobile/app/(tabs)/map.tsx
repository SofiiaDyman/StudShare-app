import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import PostCard from '../../components/PostCard';
import PostsMap from '../../components/PostsMap';
import { api, errorMessage } from '../../services/api';
import type { Post } from '../../types';

const LVIV = { lat: 49.8397, lng: 24.0297 };

export default function MapScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const open = (post: Post) => router.push({ pathname: '/post/[id]', params: { id: post.id } });

  useFocusEffect(useCallback(() => {
    api.get('/posts/nearby', { params: { ...LVIV, radius: 15, type: 'has_housing' } })
      .then(({ data }) => setPosts(data))
      .catch((error) => Alert.alert('Помилка', errorMessage(error)));
  }, []));

  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}><PostsMap posts={posts} onSelect={open} /></View>;
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page}>
      <View style={s.heading}>
        <Text style={s.eyebrow}>ЗНАЙДИ ЖИТЛО ПОРУЧ</Text>
        <Text style={s.title}>Карта Львова</Text>
        <Text style={s.subtitle}>Натисни на пін, щоб побачити деталі оголошення.</Text>
      </View>
      <View style={s.mapCard}>
        <View style={s.mapBox}><PostsMap posts={posts} onSelect={open} /></View>
      </View>
      <View style={s.listHeading}>
        <Ionicons name="home-outline" size={18} color="#536C47" />
        <Text style={s.sectionTitle}>Оголошення на карті</Text>
        <View style={s.count}><Text style={s.countText}>{posts.length}</Text></View>
      </View>
      {posts.length
        ? posts.map((post) => <PostCard key={post.id} post={post} />)
        : <View style={s.empty}><Text style={s.emptyText}>Поки немає оголошень із визначеною адресою.</Text></View>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 22, paddingBottom: 40, gap: 16 },
  heading: { gap: 5, marginBottom: 3 },
  eyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#29382C', fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: '#7C8378', fontSize: 13 },
  mapCard: { borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#fff', padding: 10 },
  mapBox: { height: 460, borderRadius: 14, overflow: 'hidden' },
  listHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 },
  sectionTitle: { color: '#344435', fontSize: 17, fontWeight: '800' },
  count: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: '#536C47', fontSize: 10, fontWeight: '800' },
  empty: { borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 16, backgroundColor: '#FBFBF7', padding: 20 },
  emptyText: { color: '#7C8378', fontSize: 12, textAlign: 'center' },
});
