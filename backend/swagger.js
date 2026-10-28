const swaggerUi = require('swagger-ui-express');

const str = (example) => ({ type: 'string', example });
const int = (example) => ({ type: 'integer', example });
const obj = (properties, required) => ({ type: 'object', properties, ...(required && { required }) });
const body = (schema) => ({ required: true, content: { 'application/json': { schema } } });
const idParam = (name) => ({ name, in: 'path', required: true, schema: { type: 'integer', example: 1 } });
const query = (name, schema, description) => ({ name, in: 'query', schema, description });
const noAuth = { security: [] };
const r = (description) => ({ description });

const DISTRICTS = ['Франківський', 'Галицький', 'Залізничний', 'Личаківський', 'Шевченківський', 'Сихівський'];
const GENDER = { type: 'string', enum: ['male', 'female', 'any'], example: 'any',
  description: 'has_housing: кого шукають у співмешканці. seeking: ваша стать (male/female)' };

const postBody = obj({
  type: { type: 'string', enum: ['has_housing', 'seeking'], example: 'has_housing' },
  title: str('Кімната на Сихові'),
  description: str('Є пральна машина та інтернет'),
  price: int(4500),
  district: { type: 'string', enum: DISTRICTS, example: 'Сихівський' },
  gender: GENDER,
  address: str('вул. Стрийська, 201'),
  contact: str('@username'),
}, ['type', 'title', 'price', 'district', 'contact']);

const profileBody = obj({
  sleep: { type: 'integer', minimum: 1, maximum: 5, example: 3 },
  cleanliness: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
  noise: { type: 'integer', minimum: 1, maximum: 5, example: 2 },
  smoking: { type: 'integer', minimum: 1, maximum: 3, example: 1 },
  budget_min: int(3000),
  budget_max: int(6000),
  bio: str('Люблю спокій, вчуся на ІТ, шукаю охайних сусідів'),
});

const specs = {
  openapi: '3.0.0',
  info: {
    title: 'StudShare API',
    version: '2.0.0',
    description: 'API пошуку житла для студентів ЛНУ.\n\nТокен: /auth/verify або /auth/login -> скопіюй `token` -> кнопка Authorize (без слова Bearer).\nКод підтвердження без SMTP дивись у консолі бекенду.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  tags: [{ name: 'Auth' }, { name: 'Posts' }, { name: 'Favorites' }, { name: 'Profile' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Почати реєстрацію (надсилає код)', ...noAuth,
      requestBody: body(obj({ full_name: str('Тест Один'), email: str('test1@lnu.edu.ua'), password: str('123456') }, ['full_name', 'email', 'password'])),
      responses: { 202: r('Код надіслано (або надруковано в консолі)'), 400: r('Невалідні дані / не університетська пошта'), 409: r('Email вже зареєстровано'), 503: r('Не вдалось надіслати лист') } } },
    '/api/auth/verify': { post: { tags: ['Auth'], summary: 'Підтвердити код, створити акаунт, отримати токен', ...noAuth,
      requestBody: body(obj({ email: str('test1@lnu.edu.ua'), code: str('123456') }, ['email', 'code'])),
      responses: { 201: r('Акаунт створено, повертає token і user'), 400: r('Невірний/прострочений код'), 429: r('5 невдалих спроб') } } },
    '/api/auth/resend-code': { post: { tags: ['Auth'], summary: 'Надіслати код повторно', ...noAuth,
      requestBody: body(obj({ email: str('test1@lnu.edu.ua') }, ['email'])),
      responses: { 200: r('OK'), 400: r('Невалідний email'), 429: r('Ліміт 5 запитів / 10 хв') } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Вхід', ...noAuth,
      requestBody: body(obj({ email: str('test1@lnu.edu.ua'), password: str('123456') }, ['email', 'password'])),
      responses: { 200: r('token + user'), 401: r('Невірні дані'), 403: r('Пошта не підтверджена') } } },
    '/api/auth/me': { get: { tags: ['Auth'], summary: 'Поточний користувач', responses: { 200: r('user'), 401: r('Немає токена') } } },

    '/api/posts': {
      get: { tags: ['Posts'], summary: 'Стрічка оголошень з фільтрами',
        parameters: [
          query('type', { type: 'string', enum: ['has_housing', 'seeking'] }),
          query('district', { type: 'string', enum: DISTRICTS }),
          query('maxPrice', { type: 'integer' }),
          query('gender', { type: 'string', enum: ['male', 'female'] }, 'Показує male/female + any'),
          query('limit', { type: 'integer', default: 50 }),
          query('offset', { type: 'integer', default: 0 }),
        ], responses: { 200: r('Масив постів із compatibility') } },
      post: { tags: ['Posts'], summary: 'Створити оголошення', requestBody: body(postBody),
        responses: { 201: r('{ id, geocoded }'), 400: r('Валідація'), 403: r('Пошта не підтверджена') } },
    },
    '/api/posts/mine': { get: { tags: ['Posts'], summary: 'Мої оголошення (усі статуси)', responses: { 200: r('Масив') } } },
    '/api/posts/nearby': { get: { tags: ['Posts'], summary: 'Оголошення з координатами в радіусі (для карти)',
      parameters: [
        { ...query('lat', { type: 'number', example: 49.8397 }), required: true },
        { ...query('lng', { type: 'number', example: 24.0297 }), required: true },
        query('radius', { type: 'number', default: 5, example: 15 }, 'км'),
        query('type', { type: 'string', enum: ['has_housing', 'seeking'] }),
        query('gender', { type: 'string', enum: ['male', 'female'] }),
      ], responses: { 200: r('Масив постів'), 400: r('Потрібні lat і lng') } } },
    '/api/posts/{id}': {
      get: { tags: ['Posts'], summary: 'Деталі поста', parameters: [idParam('id')], responses: { 200: r('Пост'), 404: r('Не знайдено') } },
      put: { tags: ['Posts'], summary: 'Редагувати свій пост (лише текстові поля; фото редагуються через /photos)', parameters: [idParam('id')], requestBody: body(postBody),
        responses: { 200: r('OK'), 400: r('Валідація'), 404: r('Не знайдено або чужий') } },
      delete: { tags: ['Posts'], summary: 'Видалити свій пост', parameters: [idParam('id')], responses: { 200: r('OK'), 404: r('Не знайдено або чужий') } },
    },
    '/api/posts/{id}/close': { patch: { tags: ['Posts'], summary: 'Місце знайдено (закрити)', parameters: [idParam('id')],
      responses: { 200: r('OK'), 404: r('Не знайдено або чужий') } } },
    '/api/posts/{id}/photos': { post: { tags: ['Posts'], summary: 'Завантажити фото до свого оголошення (макс. 6, до 5 МБ, jpg/png/webp)',
      parameters: [idParam('id')],
      requestBody: { required: true, content: { 'multipart/form-data': { schema: {
        type: 'object', required: ['photos'],
        properties: { photos: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
      responses: { 201: r('{ photos: ["/uploads/....jpg"] }'), 400: r('Тип/розмір/кількість/не житло'), 404: r('Не знайдено або чужий'), 403: r('Пошта не підтверджена') } } },
    '/api/posts/{id}/photos/{photoId}': {
      delete: { tags: ['Posts'], summary: 'Видалити одне фото свого оголошення',
        parameters: [idParam('id'), idParam('photoId')],
        responses: { 200: r('OK'), 404: r('Фото не знайдено або пост чужий') } },
      put: { tags: ['Posts'], summary: 'Замінити одне фото (поле photo, до 5 МБ, jpg/png/webp)',
        parameters: [idParam('id'), idParam('photoId')],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: {
          type: 'object', required: ['photo'],
          properties: { photo: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: r('{ photo: { id, url } }'), 400: r('Тип/розмір/немає файлу'), 404: r('Не знайдено або чужий') } },
    },

    '/api/favorites': { get: { tags: ['Favorites'], summary: 'Мої обрані', responses: { 200: r('Масив постів') } } },
    '/api/favorites/{postId}': {
      post: { tags: ['Favorites'], summary: 'Додати в обране', parameters: [idParam('postId')], responses: { 201: r('OK'), 404: r('Поста немає') } },
      delete: { tags: ['Favorites'], summary: 'Прибрати з обраного', parameters: [idParam('postId')], responses: { 200: r('OK') } },
    },

    '/api/profile': {
      get: { tags: ['Profile'], summary: 'Моя анкета', responses: { 200: r('{ profile }') } },
      put: { tags: ['Profile'], summary: 'Зберегти анкету (рахує embedding біо)', requestBody: body(profileBody),
        responses: { 200: r('OK'), 400: r('Некоректні значення') } },
    },
    '/api/profile/{userId}': { get: { tags: ['Profile'], summary: 'Профіль студента + сумісність з тобою', parameters: [idParam('userId')],
      responses: { 200: r('{ user, profile, compatibility }'), 404: r('Немає') } } },
  },
};

module.exports = { swaggerUi, specs };
