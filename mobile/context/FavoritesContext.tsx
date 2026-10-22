import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Post } from '../types';
import { useAuth } from './AuthContext';

type FavoritesContextType = {
  isFavorite: (postId: number) => boolean;
  toggle: (postId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType>(null as unknown as FavoritesContextType);
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.is_verified) {
      setIds(new Set());
      return;
    }
    api.get('/favorites')
      .then(({ data }) => setIds(new Set((data as Post[]).map((p) => p.id))))
      .catch(() => {});
  }, [user?.id, user?.is_verified]);

  const change = (postId: number, add: boolean) =>
    setIds((prev) => {
      const next = new Set(prev);
      if (add) next.add(postId); else next.delete(postId);
      return next;
    });

  const toggle = async (postId: number) => {
    const wasFavorite = ids.has(postId);
    change(postId, !wasFavorite);                       // одразу міняємо UI
    try {
      if (wasFavorite) await api.delete(`/favorites/${postId}`);
      else await api.post(`/favorites/${postId}`);
    } catch {
      change(postId, wasFavorite);                      // відкат при помилці
    }
  };

  return (
    <FavoritesContext.Provider value={{ isFavorite: (id) => ids.has(id), toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}