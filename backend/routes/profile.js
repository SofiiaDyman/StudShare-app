const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { getProfile } = require('../services/posts');
const { compatibility } = require('../services/compatibility');
const { embedText } = require('../services/nlp');

const router = express.Router();

const publicProfile = (p) => p && ({
    sleep: p.sleep, cleanliness: p.cleanliness, noise: p.noise, smoking: p.smoking,
    budget_min: p.budget_min, budget_max: p.budget_max, bio: p.bio
});

const intIn = (v, min, max) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error('Некоректне значення в анкеті');
    return n;
};

router.get('/', auth, async (req, res) => {
    try {
        res.json({ profile: publicProfile(await getProfile(req.user.id)) });
    } catch (error) {
        console.error('Profile get error:', error);
        res.status(500).json({ error: 'Не вдалося отримати анкету' });
    }
});

router.put('/', auth, async (req, res) => {
    let v;
    try {
        v = {
            sleep: intIn(req.body.sleep, 1, 5),
            cleanliness: intIn(req.body.cleanliness, 1, 5),
            noise: intIn(req.body.noise, 1, 5),
            smoking: intIn(req.body.smoking, 1, 3),
            budget_min: intIn(req.body.budget_min, 0, 100000),
            budget_max: intIn(req.body.budget_max, 0, 100000),
            bio: String(req.body.bio ?? '').trim().slice(0, 1000)
        };
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    if (v.budget_min != null && v.budget_max != null && v.budget_min > v.budget_max) {
        return res.status(400).json({ error: 'Мінімальний бюджет більший за максимальний' });
    }

    try {
        const existing = await getProfile(req.user.id);
        let embedding = existing?.bio_embedding ?? null;
        if (v.bio !== (existing?.bio ?? '')) {
            embedding = v.bio ? await embedText(v.bio) : null; // перераховуємо лише при зміні тексту
        }

        await db.query(
            `INSERT INTO profiles (user_id, sleep, cleanliness, noise, smoking, budget_min, budget_max, bio, bio_embedding)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE sleep = VALUES(sleep), cleanliness = VALUES(cleanliness),
                noise = VALUES(noise), smoking = VALUES(smoking), budget_min = VALUES(budget_min),
                budget_max = VALUES(budget_max), bio = VALUES(bio), bio_embedding = VALUES(bio_embedding)`,
            [req.user.id, v.sleep, v.cleanliness, v.noise, v.smoking, v.budget_min, v.budget_max,
             v.bio || null, embedding ? JSON.stringify(embedding) : null]
        );
        res.json({ message: 'Анкету збережено' });
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ error: 'Не вдалося зберегти анкету' });
    }
});

// Профіль іншого студента + сумісність з тобою
router.get('/:userId', auth, async (req, res) => {
    const id = Number(req.params.userId);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Невірний ID' });

    try {
        const [users] = await db.query('SELECT id, full_name, is_verified, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ error: 'Користувача не знайдено' });

        const [profile, me] = await Promise.all([getProfile(id), getProfile(req.user.id)]);
        res.json({
            user: { ...users[0], is_verified: !!users[0].is_verified },
            profile: publicProfile(profile),
            compatibility: id === req.user.id ? null : compatibility(me, profile)
        });
    } catch (error) {
        console.error('Public profile error:', error);
        res.status(500).json({ error: 'Не вдалося отримати профіль' });
    }
});

module.exports = router;