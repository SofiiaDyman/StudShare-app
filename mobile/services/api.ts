import axios from 'axios';
import { API_URL } from './config';
import { getToken } from './tokenStorage';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(e: unknown, fallback = 'Щось пішло не так') {
  if (axios.isAxiosError(e)) {
    if (e.response?.data?.error) return e.response.data.error as string;
    if (!e.response) return 'Немає зв’язку з сервером';
  }
  return fallback;
}