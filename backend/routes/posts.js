const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const { geocodeAddress } = require('../services/geocode');
const { POST_SELECT, getProfile, formatPost } = require('../services/posts');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const MAX_PHOTOS = 6;
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const TYPES = ['has_housing', 'seeking'];
const GENDERS = ['male', 'female', 'any'];
const str = (v) => String(v ?? '').trim();

const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype])
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: MAX_PHOTOS },
    fileFilter: (req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new Error('BAD_TYPE')))
});

const removeFiles = async (names) => {
    await Promise.all(names.map(async (name) => {
        try {
            await fs.promises.unlink(path.join(UPLOAD_DIR, name));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Photo cleanup error:', error);
                throw error;
            }
        }
    }));
};

const uploadError = (error) =>
    error.message === 'BAD_TYPE' ? 'Дозволені лише JPG, PNG або WEBP'
        : error.code === 'LIMIT_FILE_SIZE' ? 'Фото завелике (максимум 5 МБ)'
            : error.code === 'LIMIT_UNEXPECTED_FILE' || error.code === 'LIMIT_FILE_COUNT' ? `Максимум ${MAX_PHOTOS} фото`
                : 'Не вдалося прочитати файли';

function addGenderFilter(where, params, gender) {
    if (gender === 'male' || gender === 'female') {
        where.push("(p.gender = ? OR p.gender = 'any')");
        params.push(gender);
    }
}

function validatePost(b) {
    if (!TYPES.includes(b.type)) return 'Невірний тип поста';
    if (!str(b.title)) return 'Вкажіть заголовок';
    if (!str(b.district)) return 'Вкажіть район';
    if (!str(b.contact)) return 'Вкажіть контакт (Telegram або телефон)';
    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0) return 'Вкажіть коректну ціну/бюджет';
    if (b.type === 'has_housing' && !str(b.address)) return 'Вкажіть адресу квартири';
    const gender = b.gender || 'any';
    if (!GENDERS.includes(gender)) return 'Невірне значення статі';
    if (b.type === 'seeking' && gender === 'any') return 'Вкажіть свою стать';
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
    addGenderFilter(where, params, req.query.gender);

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
    addGenderFilter(where, params, req.query.gender);

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
            `INSERT INTO posts (user_id, type, title, description, price, district, gender, address, lat, lng, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, b.type, str(b.title), str(b.description), Math.round(Number(b.price)),
             str(b.district), b.gender || 'any', address, coords?.lat ?? null, coords?.lng ?? null, str(b.contact)]
        );
        res.status(201).json({ id: result.insertId, geocoded: !!coords });
    } catch (err) {
        console.error('Post create error:', err);
        res.status(500).json({ error: 'Не вдалося створити пост' });
    }
});

// Завантаження фото: POST /api/posts/:id/photos (multipart, поле "photos")
router.post('/:id/photos', auth, requireVerified,
    async (req, res, next) => {
        const id = parseId(req, res);
        if (id === null) return;
        try {
            const [rows] = await db.query('SELECT type FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Пост не знайдено' });
            if (rows[0].type !== 'has_housing') {
                return res.status(400).json({ error: 'Фото можна додавати лише до оголошень про житло' });
            }
            req.postId = id;
            next();
        } catch (error) {
            console.error('Photo precheck error:', error);
            res.status(500).json({ error: 'Не вдалося завантажити фото' });
        }
    },
    (req, res, next) => upload.array('photos', MAX_PHOTOS)(req, res, async (error) => {
        if (!error) return next();
        try {
            await removeFiles((req.files || []).map((file) => file.filename));
        } catch (cleanupError) {
            console.error('Photo upload cleanup error:', cleanupError);
        }
        res.status(400).json({ error: uploadError(error) });
    }),
    async (req, res) => {
        const files = req.files || [];
        const names = files.map((file) => file.filename);
        try {
            if (files.length === 0) return res.status(400).json({ error: 'Додайте хоча б одне фото' });
            const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM post_photos WHERE post_id = ?', [req.postId]);
            if (cnt + files.length > MAX_PHOTOS) {
                await removeFiles(names);
                return res.status(400).json({ error: `Максимум ${MAX_PHOTOS} фото на оголошення` });
            }
            await db.query('INSERT INTO post_photos (post_id, filename) VALUES ?', [names.map((name) => [req.postId, name])]);
            res.status(201).json({ photos: names.map((name) => `/uploads/${name}`) });
        } catch (error) {
            try {
                await removeFiles(names);
            } catch (cleanupError) {
                console.error('Photo upload cleanup error:', cleanupError);
            }
            console.error('Photo upload error:', error);
            res.status(500).json({ error: 'Не вдалося зберегти фото' });
        }
    }
);

// Видалити одне фото: DELETE /api/posts/:id/photos/:photoId
router.delete('/:id/photos/:photoId', auth, async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const photoId = Number(req.params.photoId);
    if (!Number.isInteger(photoId)) return res.status(400).json({ error: 'Невірний ідентифікатор фото' });

    try {
        const [rows] = await db.query(
            `SELECT ph.filename FROM post_photos ph
             JOIN posts p ON p.id = ph.post_id
             WHERE ph.id = ? AND p.id = ? AND p.user_id = ?`,
            [photoId, id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Фото не знайдено' });

        await db.query('DELETE FROM post_photos WHERE id = ?', [photoId]);
        await removeFiles([rows[0].filename]);
        res.json({ message: 'Фото видалено' });
    } catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({ error: 'Не вдалося видалити фото' });
    }
});

// Замінити одне фото: PUT /api/posts/:id/photos/:photoId (multipart, поле "photo")
router.put('/:id/photos/:photoId', auth, requireVerified,
    async (req, res, next) => {
        const id = parseId(req, res);
        if (id === null) return;
        const photoId = Number(req.params.photoId);
        if (!Number.isInteger(photoId)) return res.status(400).json({ error: 'Невірний ідентифікатор фото' });
        try {
            const [rows] = await db.query(
                `SELECT ph.filename FROM post_photos ph
                 JOIN posts p ON p.id = ph.post_id
                 WHERE ph.id = ? AND p.id = ? AND p.user_id = ?`,
                [photoId, id, req.user.id]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Фото не знайдено' });
            req.photoId = photoId;
            req.oldFile = rows[0].filename;
            next();
        } catch (error) {
            console.error('Photo replace precheck error:', error);
            res.status(500).json({ error: 'Не вдалося замінити фото' });
        }
    },
    (req, res, next) => upload.single('photo')(req, res, async (error) => {
        if (!error) return next();
        try {
            if (req.file) await removeFiles([req.file.filename]);
        } catch (cleanupError) {
            console.error('Photo replace cleanup error:', cleanupError);
        }
        res.status(400).json({ error: uploadError(error) });
    }),
    async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Додайте файл у поле photo' });
        try {
            await db.query('UPDATE post_photos SET filename = ? WHERE id = ?', [req.file.filename, req.photoId]);
        } catch (error) {
            try {
                await removeFiles([req.file.filename]);
            } catch (cleanupError) {
                console.error('Photo replace cleanup error:', cleanupError);
            }
            console.error('Photo replace error:', error);
            return res.status(500).json({ error: 'Не вдалося замінити фото' });
        }

        try {
            await removeFiles([req.oldFile]);
        } catch (error) {
            console.error('Replaced photo cleanup error:', error);
        }
        res.json({ photo: { id: req.photoId, url: `/uploads/${req.file.filename}` } });
    }
);

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
            `UPDATE posts SET title = ?, description = ?, price = ?, district = ?, gender = ?, address = ?, lat = ?, lng = ?, contact = ?
             WHERE id = ? AND user_id = ?`,
            [str(b.title), str(b.description), Math.round(Number(b.price)), str(b.district), b.gender || 'any',
             address, lat, lng, str(b.contact), id, req.user.id]
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
        const [photos] = await db.query(
            'SELECT ph.filename FROM post_photos ph JOIN posts p ON p.id = ph.post_id WHERE p.id = ? AND p.user_id = ?',
            [id, req.user.id]
        );
        const [result] = await db.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Пост не знайдено' });
        await removeFiles(photos.map((photo) => photo.filename));
        res.json({ message: 'Пост видалено' });
    } catch (error) {
        console.error('Post delete error:', error);
        res.status(500).json({ error: 'Не вдалося видалити пост' });
    }
});

module.exports = router;