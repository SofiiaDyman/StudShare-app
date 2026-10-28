import type { PostType } from './types';

export const DISTRICTS = ['Франківський', 'Галицький', 'Залізничний', 'Личаківський', 'Шевченківський', 'Сихівський'];

export const GENDER_FILTER = [
  { label: 'Усі', value: '' },
  { label: 'Хлопець', value: 'male' },
  { label: 'Дівчина', value: 'female' },
];

export function genderLabel(type: PostType, gender?: string): string | null {
  if (type === 'has_housing') {
    return gender === 'male' ? 'Шукають хлопця' : gender === 'female' ? 'Шукають дівчину' : 'Стать неважлива';
  }
  return gender === 'male' ? 'Хлопець' : gender === 'female' ? 'Дівчина' : null;
}

export type TraitKey = 'sleep' | 'cleanliness' | 'noise' | 'smoking';

export interface Trait {
  key: TraitKey;
  label: string;
  left: string;
  right: string;
  min: number;
  max: number;
}

export const TRAITS: Trait[] = [
  { key: 'sleep', label: 'Режим сну', left: 'Жайворонок', right: 'Сова', min: 1, max: 5 },
  { key: 'cleanliness', label: 'Охайність', left: 'Невимушено', right: 'Педантично', min: 1, max: 5 },
  { key: 'noise', label: 'Шум і гості', left: 'Тиша', right: 'Гучно й весело', min: 1, max: 5 },
  { key: 'smoking', label: 'Куріння', left: 'Проти', right: 'Курю', min: 1, max: 3 },
];