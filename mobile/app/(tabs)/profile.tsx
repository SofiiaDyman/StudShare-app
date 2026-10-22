import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import PostCard from '../../components/PostCard';
import TraitSlider from '../../components/TraitSlider';
import { TRAITS } from '../../data';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USER, disableDemoPreview, isDemoPreviewEnabled } from '../../services/demoPreview';
import { api, errorMessage } from '../../services/api';
import type { Post, Profile } from '../../types';

const EMPTY: Profile = {
  sleep: null, cleanliness: null, noise: null, smoking: null,
  budget_min: null, budget_max: null, bio: '',
};

const toNumber = (t: string) => (t ? Number(t.replace(/\D/g, '')) : null);

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const demo = isDemoPreviewEnabled();
  const displayUser = user ?? (demo ? DEMO_USER : null);
  const [form, setForm] = useState<Profile>(EMPTY);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => setForm({ ...EMPTY, ...(data.profile ?? {}) }))
      .catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    api.get('/posts/mine').then(({ data }) => setMyPosts(data)).catch(() => {});
  }, []));

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      Alert.alert('Готово', 'Анкету збережено');
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    if (demo) {
      disableDemoPreview();
      router.replace('/');
      return;
    }
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.identityCard}>
        <View style={s.avatar}><Ionicons name="person" size={25} color="#E7EDD9" /></View>
        <View style={s.identityCopy}>
          <Text style={s.eyebrow}>ТВОЯ СТОРІНКА</Text>
          <Text style={s.name}>{displayUser?.full_name}</Text>
          <Text style={s.email}>{displayUser?.email}</Text>
          <View style={s.verified}>
            <Ionicons name="shield-checkmark" size={14} color="#DDE9CF" />
            <Text style={s.verifiedText}>{displayUser?.is_verified ? 'Верифікований студент' : 'Не верифіковано'}</Text>
          </View>
        </View>
        <View style={s.identityDecoration} />
      </View>

      {demo && (
        <View style={s.demoNote}>
          <Ionicons name="eye-outline" size={17} color="#536C47" />
          <Text style={s.demoNoteText}>Демо-профіль · зміни не зберігаються</Text>
        </View>
      )}

      <View style={s.sectionHeading}>
        <Text style={s.sectionEyebrow}>ЗНАЙОМСТВО ПОЧИНАЄТЬСЯ ТУТ</Text>
        <Text style={s.sectionTitle}>Моя анкета</Text>
        <Text style={s.sectionText}>Розкажи про свої звички — так легше знайти сумісних сусідів.</Text>
      </View>

      <View style={s.formCard}>
        <Text style={s.fieldLabel}>Твій стиль життя</Text>
        <View style={s.traits}>
          {TRAITS.map((t) => (
            <TraitSlider key={t.key} trait={t} value={form[t.key]} onChange={(v) => set(t.key, v)} />
          ))}
        </View>

        <View style={s.divider} />
        <Text style={s.fieldLabel}>Бюджет на місяць, грн</Text>
        <View style={s.budgetRow}>
          <View style={s.budgetField}>
            <Text style={s.inputCaption}>ВІД</Text>
            <TextInput style={s.input} placeholder="3 000" keyboardType="number-pad"
              value={form.budget_min?.toString() ?? ''} onChangeText={(t) => set('budget_min', toNumber(t))} />
          </View>
          <View style={s.budgetField}>
            <Text style={s.inputCaption}>ДО</Text>
            <TextInput style={s.input} placeholder="6 000" keyboardType="number-pad"
              value={form.budget_max?.toString() ?? ''} onChangeText={(t) => set('budget_max', toNumber(t))} />
          </View>
        </View>

        <View style={s.divider} />
        <Text style={s.fieldLabel}>Трохи про себе</Text>
        <TextInput style={[s.input, s.bioInput]} multiline
          placeholder="Хто ти, чим займаєшся та яких співмешканців шукаєш?"
          value={form.bio ?? ''} onChangeText={(t) => set('bio', t)} />

        {!demo && <Button title="Зберегти анкету" onPress={save} loading={saving} />}
      </View>

      <View style={s.postsSection}>
        <View style={s.sectionHeading}>
          <Text style={s.sectionEyebrow}>ТВОЇ ОГОЛОШЕННЯ</Text>
          <Text style={s.sectionTitle}>Мої пости</Text>
        </View>
        {myPosts.length === 0
          ? <View style={s.emptyCard}>
              <View style={s.emptyIcon}><Ionicons name="home-outline" size={21} color="#536C47" /></View>
              <Text style={s.emptyTitle}>Тут з’являться твої оголошення</Text>
              <Text style={s.emptyText}>Коли будеш готовий(-а), створи пост і знайди своїх.</Text>
            </View>
          : myPosts.map((p) => <PostCard key={p.id} post={p} />)}
      </View>

      <Pressable style={s.logoutButton} onPress={onLogout}>
        <Ionicons name={demo ? 'arrow-back-outline' : 'log-out-outline'} size={17} color="#536C47" />
        <Text style={s.logoutText}>{demo ? 'Вийти з демо-режиму' : 'Вийти з акаунта'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 24, gap: 18 },
  identityCard: { overflow: 'hidden', position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 18, borderRadius: 22, backgroundColor: '#304632', padding: 26 },
  avatar: { width: 58, height: 58, borderRadius: 19, backgroundColor: '#49634D', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { gap: 5 },
  eyebrow: { color: '#CBD9C3', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  name: { color: '#F8F7F0', fontSize: 25, fontWeight: '800', letterSpacing: -0.6 },
  email: { color: '#D0D9CC', fontSize: 13 },
  verified: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#49634D', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, marginTop: 3 },
  verifiedText: { color: '#E5ECD9', fontSize: 10, fontWeight: '700' },
  identityDecoration: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: '#82917B', opacity: 0.2, right: -62, bottom: -94 },
  demoNote: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF1E8', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9 },
  demoNoteText: { color: '#536C47', fontSize: 12, fontWeight: '600' },
  sectionHeading: { gap: 5 },
  sectionEyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { color: '#29382C', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  sectionText: { color: '#7C8378', fontSize: 13, lineHeight: 20 },
  formCard: { gap: 13, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 20, backgroundColor: '#fff', padding: 20 },
  fieldLabel: { color: '#344435', fontSize: 14, fontWeight: '800' },
  traits: { gap: 10 },
  divider: { height: 1, backgroundColor: '#EEF0E9', marginVertical: 3 },
  budgetRow: { flexDirection: 'row', gap: 12 },
  budgetField: { flex: 1, gap: 6 },
  inputCaption: { color: '#92998E', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: '#E4E8DF', borderRadius: 12, backgroundColor: '#FBFBF7', paddingHorizontal: 13, paddingVertical: 12, color: '#344435', fontSize: 14 },
  bioInput: { minHeight: 100, textAlignVertical: 'top' },
  postsSection: { gap: 14, marginTop: 8 },
  emptyCard: { alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 18, backgroundColor: '#FBFBF7', padding: 24 },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#344435', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: '#7C8378', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  logoutButton: { minHeight: 46, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#DCE3D4', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 15, marginTop: 2, marginBottom: 10 },
  logoutText: { color: '#536C47', fontSize: 12, fontWeight: '700' },
});