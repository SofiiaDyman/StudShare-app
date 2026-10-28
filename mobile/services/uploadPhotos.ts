import { Platform } from 'react-native';
import { api } from './api';

export type LocalPhoto = { uri: string; name: string; type: string };
type NativeFile = { uri: string; name: string; type: string };
type NativeFormData = FormData & { append(name: string, value: NativeFile): void };

export async function uploadPhotos(postId: number, photos: LocalPhoto[]) {
  const form = new FormData() as NativeFormData;
  for (const photo of photos) {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(photo.uri)).blob();
      form.append('photos', blob, photo.name);
    } else {
      form.append('photos', { uri: photo.uri, name: photo.name, type: photo.type });
    }
  }
  await api.post(`/posts/${postId}/photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
}
