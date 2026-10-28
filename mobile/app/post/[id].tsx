import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import CompatibilityBadge from '../../components/CompatibilityBadge';
import PhotoGallery from '../../components/PhotoGallery';
import { useAuth } from '../../context/AuthContext';
import { genderLabel } from '../../data';
import { api, errorMessage } from '../../services/api';
import { canShowOnMap, showOnMap } from '../../services/maps';
import { colors } from '../../theme';
import type { Post } from '../../types';

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);

  useFocusEffect(useCallback(() => {
    setPost(null);
    api.get(`/posts/${id}`)
      .then(({ data }) => setPost(data))
      .catch((e) => Alert.alert('Помилка', errorMessage(e)));
  }, [id]));

  if (!post) return <View style={s.loading}><ActivityIndicator color="#536C47" /></View>;

  const mine = post.user_id === user?.id;
  const has = post.type === 'has_housing';
  const genderText = genderLabel(post.type, post.gender);

  const openContact = () =>
    Linking.openURL(post.contact.startsWith('@')
      ? `https://t.me/${post.contact.slice(1)}`
      : `tel:${post.contact.replace(/\s/g, '')}`);

  const close = async () => {
    try {
      await api.patch(`/posts/${post.id}/close`);
      router.back();
    } catch (e) { Alert.alert('Помилка', errorMessage(e)); }
  };

  const remove = () =>
    Alert.alert('Видалити пост?', 'Цю дію не можна скасувати', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити', style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/posts/${post.id}`); router.back(); }
          catch (e) { Alert.alert('Помилка', errorMessage(e)); }
        },
      },
    ]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page}>
      <Pressable style={s.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={16} color="#536C47" />
        <Text style={s.backText}>До оголошень</Text>
      </Pressable>

      <View style={s.hero}>
        <View style={s.heroTop}>
          <View style={[s.typeBadge, { backgroundColor: has ? '#EAF0FA' : '#F8EEE4' }]}>
            <View style={[s.typeDot, { backgroundColor: has ? colors.has : colors.seek }]} />
            <Text style={s.typeText}>{has ? 'Маю житло' : 'Шукаю підселення'}</Text>
          </View>
          {post.status === 'closed' && <Text style={s.closed}>Місце знайдено</Text>}
        </View>
        <Text style={s.title}>{post.title}</Text>
        <Text style={s.price}>{post.price} грн<Text style={s.priceUnit}>/міс{has ? ' з особи' : ' (бюджет)'}</Text></Text>
        <View style={s.location}>
          <Ionicons name="location-outline" size={16} color="#71816B" />
          <Text style={s.locationText}>{post.district}{post.address ? ` · ${post.address}` : ''}</Text>
        </View>
        {!!genderText && <Text style={s.locationText}>{genderText}</Text>}
        <CompatibilityBadge value={post.compatibility} />
      </View>

      <PhotoGallery photos={post.photos ?? []} />

      {!!post.description && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Про оголошення</Text>
          <Text style={s.description}>{post.description}</Text>
        </View>
      )}

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View style={s.sectionIcon}><Ionicons name="person-outline" size={18} color="#536C47" /></View>
          <Text style={s.sectionTitle}>Автор оголошення</Text>
        </View>
        <Text style={s.author}>{post.author.full_name}{post.author.is_verified ? '  ✓ Верифікований студент' : ''}</Text>
        {!mine && (
          <Button title="Переглянути профіль і сумісність" variant="secondary"
            onPress={() => router.push({ pathname: '/user/[id]', params: { id: post.author.id } })} />
        )}
      </View>

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View style={s.sectionIcon}><Ionicons name="chatbubble-outline" size={17} color="#536C47" /></View>
          <Text style={s.sectionTitle}>Зв’язатися</Text>
        </View>
        <Text style={s.contact}>{post.contact}</Text>
        <Button title="Написати автору" onPress={openContact} />
      </View>

      {canShowOnMap(post) && <Button title="Показати на карті" variant="secondary" onPress={() => showOnMap(post)} />}
      {mine && post.status === 'open' && <Button title="Місце знайдено (закрити пост)" onPress={close} />}
      {mine && (
        <Button title="Редагувати оголошення" variant="secondary"
          onPress={() => router.push({ pathname: '../edit/[id]', params: { id: post.id } })} />
      )}
      {mine && <Button title="Видалити пост" variant="danger" onPress={remove} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F1' },
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 860, alignSelf: 'center', padding: 24, gap: 14 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingRight: 12 },
  backText: { color: '#536C47', fontSize: 12, fontWeight: '700' },
  hero: { gap: 14, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 20, backgroundColor: '#fff', padding: 23 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  typeDot: { width: 7, height: 7, borderRadius: 4 },
  typeText: { color: '#455343', fontSize: 11, fontWeight: '700' },
  closed: { color: '#92998E', fontSize: 11, fontWeight: '700' },
  title: { color: '#29382C', fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  price: { color: '#536C47', fontSize: 24, fontWeight: '800' },
  priceUnit: { color: '#798473', fontSize: 13, fontWeight: '600' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: '#7C8378', fontSize: 13 },
  section: { gap: 12, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#fff', padding: 19 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#344435', fontSize: 14, fontWeight: '800' },
  description: { color: '#687267', fontSize: 14, lineHeight: 22 },
  author: { color: '#455343', fontSize: 13, fontWeight: '600' },
  contact: { color: '#455343', fontSize: 15, fontWeight: '700' },
});