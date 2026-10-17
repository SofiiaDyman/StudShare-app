async function embedText(text) {
    try {
        const res = await fetch(`${process.env.NLP_URL || 'http://localhost:8000'}/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) return null;
        return (await res.json()).embedding;
    } catch (error) {
        console.warn('NLP-сервіс недоступний:', error.message);
        return null;
    }
}

module.exports = { embedText };