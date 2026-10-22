import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import { DISTRICTS } from '../../data';
import { api, errorMessage } from '../../services/api';
import { ui } from '../../theme';

const TYPE_OPTIONS = [
  { label: 'Маю житло', value: 'has_housing' },
  { label: 'Шукаю підселення', value: 'seeking' },
];

export default function NewPostScreen() {
  const router = useRouter();
  const [type, setType] = useState('has_housing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const has = type === 'has_housing';

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/posts', { type, title, description, price, district, address, contact });
      if (has && !data.geocoded) {
        Alert.alert('Пост створено', 'Але адресу не вдалося визначити на карті. Спробуй вказати точніше (вулиця і номер).');
      }
      router.back();
    } catch (e) {
      Alert.alert('Не вдалося створити пост', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.heading}>
          <Text style={s.eyebrow}>НОВЕ ОГОЛОШЕННЯ</Text>
          <Text style={s.title}>Знайди своїх</Text>
          <Text style={s.subtitle}>Розкажи трохи про житло або про себе — потрібні люди знайдуться.</Text>
        </View>
        <View style={s.card}>
          <View style={s.cardHeading}>
            <View style={s.cardIcon}><Ionicons name="home-outline" size={19} color="#536C47" /></View>
            <View>
              <Text style={s.cardTitle}>Що ти шукаєш?</Text>
              <Text style={s.cardSubtitle}>Обери формат оголошення</Text>
            </View>
          </View>
          <Chips options={TYPE_OPTIONS} value={type} onChange={setType} />

          <View style={s.field}>
            <Text style={s.label}>Заголовок</Text>
            <TextInput style={s.input} value={title} onChangeText={setTitle}
              placeholder={has ? 'Квартира на Сихові, шукаю ще одну людину' : 'Шукаю, до кого підселитись'} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>{has ? 'Ціна з особи, грн/міс' : 'Бюджет до, грн/міс'}</Text>
            <TextInput style={s.input} value={price} onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
              keyboardType="number-pad" placeholder="Наприклад, 4 500" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>{has ? 'Район' : 'Бажаний район'}</Text>
            <Chips options={DISTRICTS.map((d) => ({ label: d, value: d }))} value={district} onChange={setDistrict} />
          </View>

          {has && (
            <View style={s.field}>
              <Text style={s.label}>Адреса</Text>
              <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="вул. Стрийська, 201" />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Опис</Text>
            <TextInput style={[s.input, s.multiline]} value={description}
              onChangeText={setDescription} multiline placeholder="Про квартиру / про себе, умови, побажання" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Контакт для зв’язку</Text>
            <TextInput style={s.input} value={contact} onChangeText={setContact} autoCapitalize="none"
              placeholder="@username або +380..." />
          </View>

          <Button title="Опублікувати оголошення" onPress={onSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 24, gap: 20 },
  heading: { gap: 6 },
  eyebrow: { color: '#82916F', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#29382C', fontSize: 29, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: '#7C8378', fontSize: 13, lineHeight: 20 },
  card: { gap: 18, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 20, backgroundColor: '#fff', padding: 22 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  cardIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#EEF1E8', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: '#344435', fontSize: 14, fontWeight: '800' },
  cardSubtitle: { color: '#92998E', fontSize: 11, marginTop: 3 },
  field: { gap: 7 },
  label: { color: '#455343', fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#E4E8DF', borderRadius: 12, backgroundColor: '#FBFBF7', paddingHorizontal: 13, paddingVertical: 12, color: '#344435', fontSize: 14 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
});