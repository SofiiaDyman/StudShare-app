import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostsMap from '../../components/PostsMap';
import PostCard from '../../components/PostCard';
import { api, errorMessage } from '../../services/api';
import type { Post } from '../../types';

const LVIV = { lat: 49.8397, lng: 24.0297 };

export default function MapScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useFocusEffect(useCallback(() => {
    api.get('/posts/nearby', { params: { ...LVIV, radius: 15 } })
      .then(({ data }) => setPosts(data))
      .catch((e) => Alert.alert('Помилка', errorMessage(e)));
  }, []));

  if (Platform.OS === 'web') {
    const locatedPosts = posts.filter((post) => post.lat != null && post.lng != null);
    const lats = locatedPosts.map((post) => post.lat as number);
    const lngs = locatedPosts.map((post) => post.lng as number);
    const minLat = Math.min(...lats, LVIV.lat - 0.01);
    const maxLat = Math.max(...lats, LVIV.lat + 0.01);
    const minLng = Math.min(...lngs, LVIV.lng - 0.01);
    const maxLng = Math.max(...lngs, LVIV.lng + 0.01);

    return (
      <ScrollView style={s.screen} contentContainerStyle={s.page}>
        <View style={s.heading}>
          <Text style={s.eyebrow}>ЗНАЙДИ ЖИТЛО ПОРУЧ</Text>
          <Text style={s.title}>Карта Львова</Text>
          <Text style={s.subtitle}>Оголошення студентів і їхнє розташування.</Text>
        </View>
        <View style={s.mapCard}>
          <View style={s.mapHeading}>
            <View style={s.mapHeadingIcon}><Ionicons name="map-outline" size={18} color="#536C47" /></View>
            <View>
              <Text style={s.mapTitle}>Розташування оголошень</Text>
              <Text style={s.mapSubtitle}>Схема за адресами з оголошень</Text>
            </View>
          </View>
          <View style={s.mapBoard}>
            <View style={[s.road, s.roadOne]} />
            <View style={[s.road, s.roadTwo]} />
            <View style={[s.road, s.roadThree]} />
            <View style={[s.road, s.roadFour]} />
            <View style={s.river}><Text style={s.riverLabel}>ПОЛТВА</Text></View>
            <View style={s.mapLabelOne}><Text style={s.mapLabel}>ЦЕНТР</Text></View>
            <View style={s.mapLabelTwo}><Text style={s.mapLabel}>ФРАНКІВСЬКИЙ</Text></View>
            {locatedPosts.map((post) => {
              const left = 12 + ((post.lng! - minLng) / (maxLng - minLng || 1)) * 74;
              const top = 13 + ((maxLat - post.lat!) / (maxLat - minLat || 1)) * 70;
              return (
                <Pressable
                  key={post.id}
                  style={[s.pin, { left: `${left}%`, top: `${top}%` }]}
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
                >
                  <Ionicons name="location" size={28} color="#536C47" />
                </Pressable>
              );
            })}
            <View style={s.mapAttribution}><Text style={s.attributionText}>ЛЬВІВ · СХЕМА РАЙОНУ</Text></View>
          </View>
        </View>
        <View style={s.listHeading}>
          <Text style={s.sectionTitle}>Оголошення поблизу</Text>
          <View style={s.count}><Text style={s.countText}>{locatedPosts.length}</Text></View>
        </View>
        {locatedPosts.length
          ? locatedPosts.map((post) => <PostCard key={post.id} post={post} />)
          : <View style={s.empty}><Text style={s.emptyText}>Поки немає оголошень із вказаною адресою.</Text></View>}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PostsMap
        posts={posts}
        onSelect={(p) => router.push({ pathname: '/post/[id]', params: { id: p.id } })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 22, paddingBottom: 40, gap: 16 },
  heading: { gap: 5, marginBottom: 3 },
  eyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#29382C', fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: '#7C8378', fontSize: 13 },
  mapCard: { borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#fff', padding: 15, gap: 13 },
  mapHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mapHeadingIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  mapTitle: { color: '#344435', fontSize: 13, fontWeight: '800' },
  mapSubtitle: { color: '#92998E', fontSize: 10, marginTop: 3 },
  mapBoard: { height: 330, overflow: 'hidden', position: 'relative', borderRadius: 14, backgroundColor: '#E9EDDF' },
  road: { position: 'absolute', backgroundColor: '#F8F8F2', borderWidth: 1, borderColor: '#DDE4D4', borderRadius: 20 },
  roadOne: { width: '125%', height: 25, left: '-10%', top: '31%', transform: [{ rotate: '-16deg' }] },
  roadTwo: { width: '120%', height: 19, left: '-8%', top: '64%', transform: [{ rotate: '13deg' }] },
  roadThree: { width: 24, height: '125%', left: '31%', top: '-10%', transform: [{ rotate: '19deg' }] },
  roadFour: { width: 18, height: '120%', left: '72%', top: '-8%', transform: [{ rotate: '-12deg' }] },
  river: { position: 'absolute', width: '120%', height: 13, left: '-10%', top: '48%', backgroundColor: '#D7E7E2', transform: [{ rotate: '-5deg' }] },
  riverLabel: { color: '#85A39A', fontSize: 7, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginTop: 1 },
  mapLabelOne: { position: 'absolute', top: '25%', left: '48%', borderRadius: 8, backgroundColor: '#F7F7F1', paddingHorizontal: 8, paddingVertical: 5 },
  mapLabelTwo: { position: 'absolute', top: '76%', left: '10%', borderRadius: 8, backgroundColor: '#F7F7F1', paddingHorizontal: 8, paddingVertical: 5 },
  mapLabel: { color: '#92998E', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  pin: { position: 'absolute', marginLeft: -14, marginTop: -25, shadowColor: '#304632', shadowOpacity: 0.16, shadowRadius: 4, elevation: 3 },
  mapAttribution: { position: 'absolute', right: 9, bottom: 9, borderRadius: 8, backgroundColor: '#FFFFFFDD', paddingHorizontal: 8, paddingVertical: 5 },
  attributionText: { color: '#7C8378', fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  listHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 },
  sectionTitle: { color: '#344435', fontSize: 17, fontWeight: '800' },
  count: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: '#536C47', fontSize: 10, fontWeight: '800' },
  empty: { borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 16, backgroundColor: '#FBFBF7', padding: 20 },
  emptyText: { color: '#7C8378', fontSize: 12, textAlign: 'center' },
});