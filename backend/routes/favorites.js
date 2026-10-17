const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { POST_SELECT, getProfile, formatPost } = require('../services/posts');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const me = await getProfile(req.user.id);
        const [rows] = await db.query(
            `${POST_SELECT}
             JOIN favorites fv ON fv.post_id = p.id AND fv.user_id = ?
             ORDER BY fv.created_at DESC`,
            [req.user.id, req.user.id]
        );
        res.json(rows.map((r) => formatPost(r, me)));
    } catch (error) {
        console.error('Favorites fetch error:', error);
        res.status(500).json({ error: 'Не вдалося отримати обрані' });
    }
});

router.post('/:postId', auth, async (req, res) => {
    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Невірний ID' });

    try {
        await db.query(
            `INSERT INTO favorites (user_id, post_id) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [req.user.id, postId]
        );
        res.status(201).json({ message: 'Додано до обраних' });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).json({ error: 'Пост не знайдено' });
        console.error('Favorite add error:', error);
        res.status(500).json({ error: 'Не вдалося додати в обране' });
    }
});

router.delete('/:postId', auth, async (req, res) => {
    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Невірний ID' });

    try {
        await db.query('DELETE FROM favorites WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
        res.json({ message: 'Видалено з обраних' });
    } catch (error) {
        console.error('Favorite remove error:', error);
        res.status(500).json({ error: 'Не вдалося видалити з обраних' });
    }
});

module.exports = router;