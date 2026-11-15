SET NAMES utf8mb4;
USE studshare;

UPDATE users
SET full_name = CASE email
  WHEN 'test1@lnu.edu.ua' THEN 'Тест Один'
  WHEN 'test2@lnu.edu.ua' THEN 'Тест Два'
  WHEN 'test3@lnu.edu.ua' THEN 'Тест Три'
  ELSE full_name
END
WHERE email IN ('test1@lnu.edu.ua', 'test2@lnu.edu.ua', 'test3@lnu.edu.ua')
  AND full_name LIKE 'Ð%';

UPDATE profiles
SET bio = CASE user_id
  WHEN 1 THEN 'Люблю спокій, вчуся на ІТ, шукаю охайних сусідів'
  WHEN 2 THEN 'Студент-програміст, люблю тишу, готую вдома, не палю'
  WHEN 3 THEN 'Люблю вечірки, гучну музику і гостей'
  ELSE bio
END
WHERE user_id IN (1, 2, 3)
  AND bio LIKE 'Ð%';

UPDATE posts
SET title = IF(title LIKE 'Ð%', 'Кімната на Сихові', title),
    description = IF(description LIKE 'Ð%', 'Є пральна машина та інтернет', description),
    district = IF(district LIKE 'Ð%', 'Сихівський', district),
    address = IF(address LIKE 'Ð%', 'вул. Стрийська, 201', address)
WHERE id = 1 AND user_id = 1;

UPDATE posts
SET title = IF(title LIKE 'Ð%', 'Квартира в центрі', title),
    district = IF(district LIKE 'Ð%', 'Франківський', district),
    address = IF(address LIKE 'Ð%', 'вул. Коперника, 10', address)
WHERE id = 2 AND user_id = 1;

UPDATE posts
SET title = IF(title LIKE 'Ð%', 'Шукаю підселення', title),
    district = IF(district LIKE 'Ð%', 'Франківський', district)
WHERE id = 3 AND user_id = 1;

UPDATE posts
SET title = IF(title LIKE 'Ð%', 'Двохкімнатна квартира', title),
    district = IF(district LIKE 'Ð%', 'Залізничний', district),
    address = IF(address LIKE 'Ð%', 'вул. Коротка, 5', address)
WHERE id = 4 AND user_id = 2;

UPDATE posts
SET title = IF(title LIKE 'Ð%', 'Шукаю, до кого підселитись', title),
    district = IF(district LIKE 'Ð%', 'Личаківський', district)
WHERE id = 5 AND user_id = 3;
