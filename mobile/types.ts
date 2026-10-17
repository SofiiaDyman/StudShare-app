export type PostType = 'has_housing' | 'seeking';

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  type: PostType;
  title: string;
  description: string;
  price: number;
  district: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact: string;
  status: 'open' | 'closed';
  created_at: string;
  author: { id: number; full_name: string; is_verified: boolean };
  is_favorite: boolean;
  compatibility: number | null;
}

export interface Profile {
  sleep: number | null;
  cleanliness: number | null;
  noise: number | null;
  smoking: number | null;
  budget_min: number | null;
  budget_max: number | null;
  bio: string | null;
}