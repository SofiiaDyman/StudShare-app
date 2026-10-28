import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Під час розробки Expo знає IP ноутбука (hostUri), тож підставляємо його автоматично
function getHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

// За потреби можна задати вручну: EXPO_PUBLIC_API_URL=http://192.168.0.12:3000/api
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${getHost()}:3000/api`;

// http://host:3000/api -> http://host:3000 (звідти віддаються /uploads/...)
export const FILES_URL = API_URL.replace(/\/api\/?$/, '');
export const photoUrl = (photo: string) => (photo.startsWith('http') ? photo : `${FILES_URL}${photo}`);