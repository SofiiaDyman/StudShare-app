const RANGES = { sleep: 4, cleanliness: 4, noise: 4, smoking: 2 };

function questionnaireScore(a, b) {
    if (!a || !b) return null;
    const scores = [];

    for (const [key, range] of Object.entries(RANGES)) {
        if (a[key] != null && b[key] != null) {
            scores.push(1 - Math.abs(a[key] - b[key]) / range);
        }
    }

    // Бюджет: якщо діапазони перетинаються, повний бал, інакше штраф за розрив
    if (a.budget_max != null && b.budget_max != null) {
        const gap = Math.max(a.budget_min ?? 0, b.budget_min ?? 0) - Math.min(a.budget_max, b.budget_max);
        scores.push(gap <= 0 ? 1 : Math.max(0, 1 - gap / 2000));
    }

    return scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : null;
}

const parseEmbedding = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function textScore(a, b) {
    const ea = parseEmbedding(a?.bio_embedding);
    const eb = parseEmbedding(b?.bio_embedding);
    if (!ea || !eb || ea.length !== eb.length) return null;
    return Math.min(1, Math.max(0, cosine(ea, eb)));
}

// Повертає ціле 0..100 або null, якщо порівнювати нічого
function compatibility(me, other) {
    const q = questionnaireScore(me, other);
    const t = textScore(me, other);
    if (q == null && t == null) return null;
    if (q == null) return Math.round(t * 100);
    if (t == null) return Math.round(q * 100);
    return Math.round((0.6 * q + 0.4 * t) * 100);
}

module.exports = { compatibility };