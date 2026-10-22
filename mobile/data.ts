export const DISTRICTS = ['Франківський', 'Галицький', 'Залізничний', 'Личаківський', 'Шевченківський', 'Сихівський'];

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