import type { Profile, Post, User } from '../types';

let demoPreviewEnabled = false;

export const isDemoPreviewEnabled = () => demoPreviewEnabled;
export const enableDemoPreview = () => {
  demoPreviewEnabled = true;
};
export const disableDemoPreview = () => {
  demoPreviewEnabled = false;
};

export const DEMO_USER: User = {
  id: 0,
  full_name: 'Демо-користувач',
  email: 'demo@studshare.local',
  is_verified: true,
};

const DEMO_PROFILE: Profile = {
  sleep: 3,
  cleanliness: 4,
  noise: 2,
  smoking: 1,
  budget_min: 3000,
  budget_max: 6000,
  bio: 'Люблю затишок, прогулянки Львовом і спокійні вечори. Шукаю дружніх сусідів.',
};

const DEMO_POSTS: Post[] = [
  {
    id: 101,
    user_id: 201,
    type: 'has_housing',
    title: 'Світла кімната біля Стрийського парку',
    description: 'Шукаємо сусіда у затишну квартиру. Є пральна машина, швидкий інтернет і все необхідне для комфортного життя.',
    price: 4800,
    district: 'Франківський',
    gender: 'female',
    address: 'вул. Володимира Великого',
    photos: [],
    photo_items: [],
    lat: 49.8142,
    lng: 24.0135,
    contact: '@studshare_demo',
    status: 'open',
    created_at: '2026-10-15T12:00:00.000Z',
    author: { id: 201, full_name: 'Марія К.', is_verified: true },
    is_favorite: true,
    compatibility: 92,
  },
  {
    id: 102,
    user_id: 202,
    type: 'has_housing',
    title: 'Шукаємо сусіда в квартиру в центрі',
    description: 'Квартира поруч з університетом. Дружня атмосфера, окрема кімната та спільна кухня.',
    price: 5500,
    district: 'Галицький',
    gender: 'any',
    address: 'вул. Коперника',
    photos: [],
    photo_items: [],
    lat: 49.8372,
    lng: 24.0253,
    contact: '@studshare_demo',
    status: 'open',
    created_at: '2026-10-12T12:00:00.000Z',
    author: { id: 202, full_name: 'Андрій М.', is_verified: true },
    is_favorite: false,
    compatibility: 84,
  },
  {
    id: 103,
    user_id: 203,
    type: 'seeking',
    title: 'Шукаю підселення біля ЛНУ',
    description: 'Студентка, охайна й неконфліктна. Бюджет до 5000 грн, бажано з гарним транспортним сполученням.',
    price: 5000,
    district: 'Франківський',
    gender: 'female',
    address: null,
    photos: [],
    photo_items: [],
    lat: null,
    lng: null,
    contact: '@studshare_demo',
    status: 'open',
    created_at: '2026-10-10T12:00:00.000Z',
    author: { id: 203, full_name: 'Софія Д.', is_verified: true },
    is_favorite: false,
    compatibility: 76,
  },
];

export function getDemoResponse(url = '', params: Record<string, unknown> = {}) {
  const path = url.split('?')[0].replace(/\/+$/, '');

  if (path === '/posts') {
    const type = params.type;
    const district = params.district;
    const maxPrice = Number(params.maxPrice) || Infinity;
    const gender = params.gender;
    return DEMO_POSTS.filter((post) =>
      (!type || post.type === type)
      && (!district || post.district === district)
      && (!gender || post.gender === gender || post.gender === 'any')
      && post.price <= maxPrice,
    );
  }
  if (path === '/posts/nearby') {
    return DEMO_POSTS.filter((post) =>
      post.lat != null && post.lng != null
      && (!params.type || post.type === params.type)
      && (!params.gender || post.gender === params.gender || post.gender === 'any'),
    );
  }
  if (path === '/posts/mine') return [];
  if (path === '/favorites') return DEMO_POSTS.filter((post) => post.is_favorite);
  if (path === '/profile') return { profile: DEMO_PROFILE };

  const postMatch = path.match(/^\/posts\/(\d+)$/);
  if (postMatch) return DEMO_POSTS.find((post) => post.id === Number(postMatch[1])) ?? null;

  const profileMatch = path.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    const post = DEMO_POSTS.find((item) => item.author.id === Number(profileMatch[1]));
    return post
      ? { user: post.author, profile: DEMO_PROFILE, compatibility: post.compatibility }
      : { user: DEMO_USER, profile: DEMO_PROFILE, compatibility: null };
  }

  return null;
}
