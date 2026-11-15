async function geocodeAddress(address) {
    const query = `${address}, Львів, Україна`;
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'StudShare/1.0 (student project)' } });
        const data = await res.json();
        return data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
    } catch (error) {
        console.error('Geocode error:', error.message);
        return null;
    }
}

module.exports = { geocodeAddress };