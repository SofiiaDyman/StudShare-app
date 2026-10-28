import { Alert, Linking, Platform } from 'react-native';
import type { Post } from '../types';

const hasPoint = (post: Post) => post.lat != null && post.lng != null;

export const canShowOnMap = (post: Post) =>
  post.type === 'has_housing' && (hasPoint(post) || !!post.address);

const googleUrl = (post: Post) => {
  const query = hasPoint(post) ? `${post.lat},${post.lng}` : `${post.address}, Львів`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const appleUrl = (post: Post) =>
  hasPoint(post)
    ? `https://maps.apple.com/?ll=${post.lat},${post.lng}&q=${encodeURIComponent(post.address ?? post.title)}`
    : `https://maps.apple.com/?q=${encodeURIComponent(`${post.address}, Львів`)}`;

async function openMap(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Open map error:', error);
    Alert.alert('Помилка', 'Не вдалося відкрити карту');
  }
}

export function showOnMap(post: Post) {
  if (Platform.OS === 'ios') {
    Alert.alert('Показати на карті', undefined, [
      { text: 'Apple Maps', onPress: () => { void openMap(appleUrl(post)); } },
      { text: 'Google Maps', onPress: () => { void openMap(googleUrl(post)); } },
      { text: 'Скасувати', style: 'cancel' },
    ]);
    return;
  }
  void openMap(googleUrl(post));
}
