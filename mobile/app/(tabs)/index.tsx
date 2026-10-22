import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Chips from '../../components/Chips';
import PostCard from '../../components/PostCard';
import { DISTRICTS } from '../../data';
import { api, errorMessage } from '../../services/api';
import type { Post } from '../../types';

const TYPE_OPTIONS = [
  { label: 'Мають житло', value: 'has_housing' },
  { label: 'Шукають підселення', value: 'seeking' },
];
const DISTRICT_OPTIONS = [{ label: 'Всі райони', value: '' }, ...DISTRICTS.map((d) => ({ label: d, value: d }))];

export default function FeedScreen() {
  const router = useRouter();
  const wide = useWindowDimensions().width >= 760;
  const [type, setType] = useState('has_housing');
  const [district, setDistrict] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/posts', {
        params: { type, district: district || undefined, maxPrice: maxPrice || undefined },
      });
      setPosts(data);
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, district, maxPrice]);

  // Оновлюємо при поверненні на екран і при зміні фільтрів
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const header = (
    <View style={s.listHeader}>
      <View style={s.headingRow}>
        <View style={s.heading}>
          <Text style={s.eyebrow}>СТУДЕНТСЬКЕ ЖИТЛО У ЛЬВОВІ</Text>
          <Text style={s.title}>Оголошення спільноти</Text>
          <Text style={s.subtitle}>Переглядай варіанти та підбирай за своїми умовами.</Text>
        </View>
        {wide && (
          <Pressable style={s.mapButton} onPress={() => router.push('/(tabs)/map')}>
            <Ionicons name="map-outline" size={16} color="#536C47" />
            <Text style={s.mapButtonText}>Відкрити карту</Text>
          </Pressable>
        )}
      </View>

      <View style={s.filters}>
        <View style={s.filterTop}>
          <View style={s.filterHeading}>
            <View style={s.filterIcon}><Ionicons name="options-outline" size={16} color="#536C47" /></View>
            <View>
              <Text style={s.filterTitle}>Фільтри</Text>
              <Text style={s.filterSubtitle}>Звузь пошук до потрібного</Text>
            </View>
          </View>
          {!!(district || maxPrice) && (
            <Pressable
              style={s.resetButton}
              onPress={() => {
                setDistrict('');
                setPriceInput('');
                setMaxPrice('');
              }}
            >
              <Text style={s.resetText}>Очистити</Text>
            </Pressable>
          )}
        </View>
        <Text style={s.filterLabel}>ТИП ОГОЛОШЕННЯ</Text>
        <Chips options={TYPE_OPTIONS} value={type} onChange={setType} />
        <Text style={s.filterLabel}>РАЙОН</Text>
        <Chips options={DISTRICT_OPTIONS} value={district} onChange={setDistrict} />
        <TextInput
          style={s.priceInput}
          value={priceInput}
          onChangeText={(t) => setPriceInput(t.replace(/\D/g, ''))}
          onBlur={() => setMaxPrice(priceInput)}
          onSubmitEditing={() => setMaxPrice(priceInput)}
          keyboardType="number-pad"
          placeholder="Максимальна ціна, грн"
        />
      </View>

      <View style={s.resultsHeading}>
        <View>
          <Text style={s.resultsTitle}>Актуальні оголошення</Text>
          <Text style={s.resultsSubtitle}>Варіанти від студентів спільноти</Text>
        </View>
        <View style={s.resultsCount}>
          <Text style={s.resultsCountNumber}>{posts.length}</Text>
          <Text style={s.resultsCountText}>знайдено</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.screen}>
      <FlatList
        key={wide ? 'desktop-grid' : 'single-column'}
        data={posts}
        keyExtractor={(p) => String(p.id)}
        numColumns={wide ? 2 : 1}
        columnWrapperStyle={wide ? s.gridRow : undefined}
        renderItem={({ item }) => <View style={wide ? s.gridCell : undefined}><PostCard post={item} /></View>}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={loading
          ? <ActivityIndicator style={{ marginTop: 40 }} />
          : <View style={s.emptyCard}>
              <View style={s.emptyIcon}><Ionicons name="search-outline" size={22} color="#536C47" /></View>
              <Text style={s.emptyTitle}>Поки немає оголошень</Text>
              <Text style={s.emptyText}>Спробуй змінити фільтри або перевір пізніше.</Text>
            </View>}
        keyboardShouldPersistTaps="handled"
      />
      <Pressable style={s.fab} onPress={() => router.push('/post/new')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  list: { width: '100%', maxWidth: 1160, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 100, gap: 17 },
  listHeader: { gap: 22, marginBottom: 2 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  heading: { gap: 6, paddingHorizontal: 2, paddingBottom: 1 },
  eyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#29382C', fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#7C8378', fontSize: 13 },
  mapButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#DCE3D4', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 13 },
  mapButtonText: { color: '#536C47', fontSize: 11, fontWeight: '700' },
  filters: { gap: 11, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#fff', padding: 16 },
  filterTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 },
  filterHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  filterIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  filterTitle: { color: '#344435', fontSize: 13, fontWeight: '800' },
  filterSubtitle: { color: '#92998E', fontSize: 10, marginTop: 2 },
  resetButton: { paddingVertical: 8, paddingHorizontal: 7 },
  resetText: { color: '#718B53', fontSize: 11, fontWeight: '700' },
  filterLabel: { color: '#92998E', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  priceInput: { borderWidth: 1, borderColor: '#E4E8DF', borderRadius: 12, backgroundColor: '#FBFBF7', paddingHorizontal: 13, paddingVertical: 12, color: '#344435', fontSize: 14 },
  resultsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  resultsTitle: { color: '#344435', fontSize: 17, fontWeight: '800' },
  resultsSubtitle: { color: '#92998E', fontSize: 10, marginTop: 3 },
  resultsCount: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, backgroundColor: '#EEF1E8', paddingHorizontal: 10, paddingVertical: 7 },
  resultsCountNumber: { color: '#536C47', fontSize: 12, fontWeight: '800' },
  resultsCountText: { color: '#647750', fontSize: 10, fontWeight: '600' },
  gridRow: { gap: 14, alignItems: 'stretch' },
  gridCell: { flex: 1, maxWidth: '50%' },
  emptyCard: { alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#FBFBF7', padding: 26, marginTop: 3 },
  emptyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#344435', fontSize: 14, fontWeight: '800' },
  emptyText: { color: '#7C8378', fontSize: 12, textAlign: 'center' },
  fab: {
    position: 'absolute', right: 24, bottom: 24, width: 58, height: 58, borderRadius: 20,
    backgroundColor: '#304632', alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
});