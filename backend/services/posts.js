const db = require('../db');
const { compatibility } = require('./compatibility');

const POST_SELECT = `
    SELECT p.*,
           u.full_name AS author_name, u.is_verified AS author_verified,
           pr.sleep, pr.cleanliness, pr.noise, pr.smoking,
           pr.budget_min, pr.budget_max, pr.bio_embedding,
           EXISTS(SELECT 1 FROM favorites f WHERE f.post_id = p.id AND f.user_id = ?) AS is_favorite
    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN profiles pr ON pr.user_id = p.user_id`;

async function getProfile(userId) {
    const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    return rows[0] || null;
}

function formatPost(row, me) {
    const {
        author_name, author_verified, is_favorite,
        sleep, cleanliness, noise, smoking, budget_min, budget_max, bio_embedding,
        ...post
    } = row;

    return {
        ...post,
        author: { id: row.user_id, full_name: author_name, is_verified: !!author_verified },
        is_favorite: !!is_favorite,
        compatibility: row.user_id === me?.user_id ? null : compatibility(me, row)
    };
}

module.exports = { POST_SELECT, getProfile, formatPost };