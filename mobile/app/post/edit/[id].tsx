import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../../components/Button';
import Chips from '../../../components/Chips';
import PhotoPicker from '../../../components/PhotoPicker';
import { DISTRICTS } from '../../../data';
import { api, errorMessage } from '../../../services/api';
import { photoUrl } from '../../../services/config';
import { uploadPhotos, type LocalPhoto } from '../../../services/uploadPhotos';
import { ui } from '../../../theme';
import type { Post } from '../../../types';

const MAX_PHOTOS = 6;
const GENDER_HAS = [{ label: 'Хлопця', value: 'male' }, { label: 'Дівчину', value: 'female' }, { label: 'Неважливо', value: 'any' }];
const GENDER_SEEK = [{ label: 'Я хлопець', value: 'male' }, { label: 'Я дівчина', value: 'female' }];

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [gender, setGender] = useState('any');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [removed, setRemoved] = useState<number[]>([]);
  const [added, setAdded] = useState<LocalPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(({ data }: { data: Post }) => {
        setPost(data);
        setTitle(data.title);
        setDescription(data.description ?? '');
        setPrice(String(data.price));
        setDistrict(data.district);
        setGender(data.gender);
        setAddress(data.address ?? '');
        setContact(data.contact);
      })
      .catch((error) => Alert.alert('Помилка', errorMessage(error)));
  }, [id]);

  if (!post) return <View style={s.loading}><ActivityIndicator color="#536C47" /></View>;

  const has = post.type === 'has_housing';
  const kept = (post.photo_items ?? []).filter((photo) => !removed.includes(photo.id));
  const remainingPhotoSlots = MAX_PHOTOS - kept.length;

  const onSave = async () => {
    setLoading(true);
    try {
      await api.put(`/posts/${post.id}`, { title, description, price, district, gender, address, contact });

      for (const photoId of removed) {
        await api.delete(`/posts/${post.id}/photos/${photoId}`);
      }

      if (has && added.length) {
        try {
          await uploadPhotos(post.id, added);
        } catch (error) {
          Alert.alert('Зміни збережено, але нові фото не завантажились', errorMessage(error));
          router.back();
          return;
        }
      }
      router.back();
    } catch (error) {
      Alert.alert('Не вдалося зберегти', errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Редагувати оголошення</Text>
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Заголовок</Text>
            <TextInput style={s.input} value={title} onChangeText={setTitle} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>{has ? 'Ціна з особи, грн/міс' : 'Бюджет до, грн/міс'}</Text>
            <TextInput style={s.input} value={price} onChangeText={(value) => setPrice(value.replace(/\D/g, ''))} keyboardType="number-pad" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>{has ? 'Район' : 'Бажаний район'}</Text>
            <Chips options={DISTRICTS.map((value) => ({ label: value, value }))} value={district} onChange={setDistrict} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>{has ? 'Кого шукаєте у співмешканці' : 'Ваша стать'}</Text>
            <Chips options={has ? GENDER_HAS : GENDER_SEEK} value={gender} onChange={setGender} />
          </View>

          {has && (
            <View style={s.field}>
              <Text style={s.label}>Адреса</Text>
              <TextInput style={s.input} value={address} onChangeText={setAddress} />
            </View>
          )}

          {has && (
            <View style={s.field}>
              <Text style={s.label}>Фото квартири</Text>
              {kept.length > 0 && (
                <View style={s.grid}>
                  {kept.map((photo) => (
                    <View key={photo.id} style={s.thumb}>
                      <Image source={{ uri: photoUrl(photo.url) }} style={s.img} contentFit="cover" />
                      <Pressable style={s.remove} hitSlop={8} onPress={() => setRemoved((current) => [...current, photo.id])}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              {remainingPhotoSlots > 0
                ? <PhotoPicker photos={added} onChange={setAdded} max={remainingPhotoSlots} />
                : <Text style={s.undo}>Досягнуто максимум {MAX_PHOTOS} фото</Text>}
              {removed.length > 0 && (
                <Pressable onPress={() => setRemoved([])}>
                  <Text style={s.undo}>Скасувати видалення ({removed.length})</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Опис</Text>
            <TextInput style={[s.input, s.multiline]} value={description} onChangeText={setDescription} multiline />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Контакт для зв’язку</Text>
            <TextInput style={s.input} value={contact} onChangeText={setContact} autoCapitalize="none" />
          </View>

          <Button title="Зберегти зміни" onPress={onSave} loading={loading} />
          <Button title="Скасувати" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F1' },
  page: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 24, gap: 20 },
  title: { color: '#29382C', fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  card: { gap: 18, borderWidth: 1, borderColor: '#E9EBE3', borderRadius: 20, backgroundColor: '#fff', padding: 22 },
  field: { gap: 7 },
  label: { color: '#455343', fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#E4E8DF', borderRadius: 12, backgroundColor: '#FBFBF7', paddingHorizontal: 13, paddingVertical: 12, color: '#344435', fontSize: 14 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumb: { width: 92, height: 92, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  undo: { color: '#718B53', fontSize: 12, fontWeight: '700' },
});
