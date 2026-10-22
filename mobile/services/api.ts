import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';
import { getDemoResponse, isDemoPreviewEnabled } from './demoPreview';

export const TOKEN_KEY = 'studshare_token';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  if (isDemoPreviewEnabled()) {
    config.adapter = async (adapterConfig) => {
      if (adapterConfig.method?.toUpperCase() !== 'GET') {
        const response = {
          data: { error: 'Демо-режим лише для перегляду. Увійди, щоб змінювати дані.' },
          status: 403,
          statusText: 'Forbidden',
          headers: new axios.AxiosHeaders(),
          config: adapterConfig,
        };
        return Promise.reject(new axios.AxiosError(
          'Демо-режим лише для перегляду',
          axios.AxiosError.ERR_BAD_REQUEST,
          adapterConfig,
          undefined,
          response,
        ));
      }

      return {
        data: getDemoResponse(config.url, adapterConfig.params),
        status: 200,
        statusText: 'OK',
        headers: new axios.AxiosHeaders(),
        config: adapterConfig,
      };
    };
    return config;
  }

  const token = await SecureStore.getItemAsync(TOKEN_KEY);
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