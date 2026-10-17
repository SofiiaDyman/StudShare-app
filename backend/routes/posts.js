const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const { geocodeAddress } = require('../services/geocode');
const { POST_SELECT, getProfile, formatPost } = require('../services/posts');

const router = express.Router();
const TYPES = ['has_housing', 'seeking'];
const str = (v) => String(v ?? '').trim();

function validatePost(b) {
    if (!TYPES.includes(b.type)) return 'Невірний тип поста';
    if (!str(b.title)) return 'Вкажіть заголовок';
    if (!str(b.district)) return 'Вкажіть район';
    if (!str(b.contact)) return 'Вкажіть контакт (Telegram або телефон)';
    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0) return 'Вкажіть коректну ціну/бюджет';
    if (b.type === 'has_housing' && !str(b.address)) return 'Вкажіть адресу квартири';
    return null;
}

const parseId = (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Невірний ідентифікатор' });
        return null;
    }
    return id;
};

// Стрічка: GET /api/posts?type=has_housing&district=Сихівський&maxPrice=4000
router.get('/', auth, async (req, res) => {
    const { type, district, maxPrice } = req.query;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    const where = ["p.status = 'open'"];
    const params = [req.user.id];
    if (TYPES.includes(type)) { where.push('p.type = ?'); params.push(type); }
    if (district) { where.push('p.district = ?'); params.push(String(district)); }
    if (Number(maxPrice) > 0) { where.push('p.price <= ?'); params.push(Number(maxPrice)); }

    try {
        const me = await getProfile(req.user.id);
        const [rows] = await db.query(
            `${POST_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        res.json(rows.map((r) => formatPost(r, me)));
    } catch (error) {
        console.error('Posts list error:', error);
        res.status(500).json({ error: 'Не вдалося отримати пости' });
    }
});

// Мої пости (усі статуси)
router.get('/mine', auth, async (req, res) => {
    try {
        const me = await getProfile(req.user.id);
        const [rows] = await db.query(
            `${POST_SELECT} WHERE p.user_id = ? ORDER BY p.created_at DESC`,
            [req.user.id, req.user.id]
        );
        res.json(rows.map((r) => formatPost(r, me)));
    } catch (error) {
        console.error('Posts mine error:', error);
        res.status(500).json({ error: 'Не вдалося отримати ваші пости' });
    }
});

// Для карти: GET /api/posts/nearby?lat=49.84&lng=24.03&radius=10 (км)
router.get('/nearby', auth, async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius) || 5;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: 'Потрібні lat і lng' });
    }

    const where = [
        "p.status = 'open'",
        'p.lat IS NOT NULL AND p.lng IS NOT NULL',
        'ST_Distance_Sphere(POINT(p.lng, p.lat), POINT(?, ?)) <= ?'
    ];
    const params = [req.user.id, lng, lat, radiusKm * 1000];
    if (TYPES.includes(req.query.type)) { where.push('p.type = ?'); params.push(req.query.type); }

    try {
        const me = await getProfile(req.user.id);
        const [rows] = await db.query(`${POST_SELECT} WHERE ${where.join(' AND ')}`, params);
        res.json(rows.map((r) => formatPost(r, me)));
    } catch (error) {
        console.error('Posts nearby error:', error);
        res.status(500).json({ error: 'Не вдалося отримати пости поруч' });
    }
});

router.get('/:id', auth, async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    try {
        const me = await getProfile(req.user.id);
        const [rows] = await db.query(`${POST_SELECT} WHERE p.id = ?`, [req.user.id, id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Пост не знайдено' });
        res.json(formatPost(rows[0], me));
    } catch (error) {
        console.error('Post get error:', error);
        res.status(500).json({ error: 'Не вдалося отримати пост' });
    }
});

router.post('/', auth, requireVerified, async (req, res) => {
    const error = validatePost(req.body);
    if (error) return res.status(400).json({ error });

    const b = req.body;
    try {
        const address = str(b.address) || null;
        const coords = address ? await geocodeAddress(address) : null;

        const [result] = await db.query(
            `INSERT INTO posts (user_id, type, title, description, price, district, address, lat, lng, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, b.type, str(b.title), str(b.description), Math.round(Number(b.price)),
             str(b.district), address, coords?.lat ?? null, coords?.lng ?? null, str(b.contact)]
        );
        res.status(201).json({ id: result.insertId, geocoded: !!coords });
    } catch (err) {
        console.error('Post create error:', err);
        res.status(500).json({ error: 'Не вдалося створити пост' });
    }
});

router.put('/:id', auth, requireVerified, async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    try {
        const [rows] = await db.query('SELECT type, address, lat, lng FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Пост не знайдено' });
        const existing = rows[0];

        const error = validatePost({ ...req.body, type: existing.type });
        if (error) return res.status(400).json({ error });

        const b = req.body;
        const address = str(b.address) || null;
        let { lat, lng } = existing;
        if (address !== existing.address) {
            const coords = address ? await geocodeAddress(address) : null;
            lat = coords?.lat ?? null;
            lng = coords?.lng ?? null;
        }

        await db.query(
            `UPDATE posts SET title = ?, description = ?, price = ?, district = ?, address = ?, lat = ?, lng = ?, contact = ?
             WHERE id = ? AND user_id = ?`,
            [str(b.title), str(b.description), Math.round(Number(b.price)), str(b.district), address, lat, lng, str(b.contact), id, req.user.id]
        );
        res.json({ message: 'Пост оновлено' });
    } catch (err) {
        console.error('Post update error:', err);
        res.status(500).json({ error: 'Не вдалося оновити пост' });
    }
});

// "Місце знайдено": закрити пост
router.patch('/:id/close', auth, async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    try {
        const [result] = await db.query("UPDATE posts SET status = 'closed' WHERE id = ? AND user_id = ?", [id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Пост не знайдено' });
        res.json({ message: 'Пост закрито' });
    } catch (error) {
        console.error('Post close error:', error);
        res.status(500).json({ error: 'Не вдалося закрити пост' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    try {
        const [result] = await db.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Пост не знайдено' });
        res.json({ message: 'Пост видалено' });
    } catch (error) {
        console.error('Post delete error:', error);
        res.status(500).json({ error: 'Не вдалося видалити пост' });
    }
});

module.exports = router;