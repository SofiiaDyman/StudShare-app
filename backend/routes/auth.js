const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { sendVerificationCode } = require('../services/mailer');

const router = express.Router();

const DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || 'lnu.edu.ua').toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 5;

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: 'Забагато спроб, спробуй пізніше' } });
const codeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 5, message: { error: 'Забагато запитів коду, зачекай трохи' } });

const signToken = (user) =>
    jwt.sign({ id: user.id, full_name: user.full_name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

const sanitizeUser = (u) => ({
    id: u.id, full_name: u.full_name, email: u.email, is_verified: !!u.is_verified, created_at: u.created_at
});

// lnu.edu.ua або піддомени типу student.lnu.edu.ua (але не evil-lnu.edu.ua)
const isUniversityEmail = (email) => {
    const domain = email.split('@')[1] || '';
    return domain === DOMAIN || domain.endsWith(`.${DOMAIN}`);
};

const hashCode = (code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');

async function issuePendingCode(email) {
    const code = String(crypto.randomInt(100000, 1000000));
    const [result] = await db.query(
        `UPDATE pending_registrations
         SET code_hash = ?, expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), attempts = 0
         WHERE email = ?`,
        [hashCode(code), email]
    );
    if (result.affectedRows === 0) return false;
    await sendVerificationCode(email, code);
    return true;
}

router.post('/register', authLimiter, async (req, res) => {
    const full_name = String(req.body.full_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: "Ім'я, email і пароль є обов'язковими" });
    }
    if (!EMAIL_RE.test(email) || !isUniversityEmail(email)) {
        return res.status(400).json({ error: `Реєстрація можлива лише з університетською поштою @${DOMAIN}` });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль має містити мінімум 6 символів' });
    }

    try {
        const [existing] = await db.query('SELECT id, is_verified FROM users WHERE email = ?', [email]);
        if (existing.length > 0 && existing[0].is_verified) {
            return res.status(409).json({ error: 'Користувач з таким email вже існує' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const code = String(crypto.randomInt(100000, 1000000));
        await db.query(
            `INSERT INTO pending_registrations (full_name, email, password_hash, code_hash, expires_at)
             VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash),
                code_hash = VALUES(code_hash), expires_at = VALUES(expires_at), attempts = 0`,
            [full_name, email, passwordHash, hashCode(code)]
        );

        try {
            await sendVerificationCode(email, code);
        } catch (mailError) {
            console.error('Не вдалося надіслати лист:', mailError.message);
            return res.status(503).json({ error: 'Не вдалося надіслати код. Спробуйте надіслати його повторно.' });
        }

        res.status(202).json({ message: 'Код підтвердження надіслано. Введіть його, щоб створити акаунт.' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Не вдалося розпочати реєстрацію' });
    }
});

router.post('/login', authLimiter, async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
        return res.status(400).json({ error: 'email і password є обов\'язковими' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Невірні облікові дані' });
        }
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Підтвердіть пошту перед входом' });
        }
        res.json({ token: signToken(user), user: sanitizeUser(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Не вдалося виконати вхід' });
    }
});

router.post('/verify', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    if (!EMAIL_RE.test(email) || !isUniversityEmail(email)) {
        return res.status(400).json({ error: 'Вкажіть коректну університетську пошту' });
    }
    if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ error: 'Код має складатися з 6 цифр' });
    }

    let connection;
    let inTransaction = false;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        inTransaction = true;
        const [rows] = await connection.query(
            'SELECT *, expires_at < NOW() AS expired FROM pending_registrations WHERE email = ? FOR UPDATE',
            [email]
        );
        const pending = rows[0];
        if (!pending || pending.expired) {
            await connection.rollback();
            inTransaction = false;
            return res.status(400).json({ error: 'Код недійсний або прострочений. Надішліть новий.' });
        }
        if (pending.attempts >= MAX_ATTEMPTS) {
            await connection.rollback();
            inTransaction = false;
            return res.status(429).json({ error: 'Забагато невдалих спроб. Надішліть новий код.' });
        }

        const a = Buffer.from(hashCode(code));
        const b = Buffer.from(pending.code_hash);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            await connection.query('UPDATE pending_registrations SET attempts = attempts + 1 WHERE email = ?', [email]);
            await connection.commit();
            inTransaction = false;
            return res.status(400).json({ error: 'Невірний код' });
        }

        const [existingUsers] = await connection.query(
            'SELECT id, is_verified FROM users WHERE email = ? FOR UPDATE',
            [email]
        );
        let userId;
        if (existingUsers.length > 0) {
            if (existingUsers[0].is_verified) {
                await connection.rollback();
                inTransaction = false;
                return res.status(409).json({ error: 'Користувач з таким email вже існує' });
            }
            userId = existingUsers[0].id;
            await connection.query(
                'UPDATE users SET full_name = ?, password_hash = ?, is_verified = TRUE WHERE id = ?',
                [pending.full_name, pending.password_hash, userId]
            );
        } else {
            const [result] = await connection.query(
                'INSERT INTO users (full_name, email, password_hash, is_verified) VALUES (?, ?, ?, TRUE)',
                [pending.full_name, pending.email, pending.password_hash]
            );
            userId = result.insertId;
        }
        const [users] = await connection.query(
            'SELECT id, full_name, email, is_verified, created_at FROM users WHERE id = ?',
            [userId]
        );
        await connection.query('DELETE FROM pending_registrations WHERE email = ?', [email]);
        await connection.commit();
        inTransaction = false;

        const user = sanitizeUser(users[0]);
        res.status(201).json({ token: signToken(user), user });
    } catch (error) {
        if (connection && inTransaction) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Registration rollback error:', rollbackError);
            }
        }
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Не вдалося завершити реєстрацію' });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/resend-code', codeLimiter, async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || !isUniversityEmail(email)) {
        return res.status(400).json({ error: 'Вкажіть коректну університетську пошту' });
    }

    try {
        await issuePendingCode(email);
        res.json({ message: 'Якщо для цієї адреси очікується підтвердження, код надіслано.' });
    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ error: 'Не вдалося надіслати код' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, is_verified, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Користувача не знайдено' });
        res.json({ user: sanitizeUser(rows[0]) });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Не вдалося отримати профіль' });
    }
});

module.exports = router;