const db = require('../db');

module.exports = async function requireVerified(req, res, next) {
    try {
        const [rows] = await db.query('SELECT is_verified FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(401).json({ error: 'Користувача не знайдено' });
        if (!rows[0].is_verified) {
            return res.status(403).json({ error: 'Підтвердіть університетську пошту', code: 'EMAIL_NOT_VERIFIED' });
        }
        next();
    } catch (error) {
        console.error('requireVerified error:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
};