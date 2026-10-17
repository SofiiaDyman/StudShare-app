async function geocodeAddress(address) {
    const query = `${address}, Львів, Україна`;
    try {
        if (process.env.GOOGLE_MAPS_API_KEY) {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            const data = await (await fetch(url)).json();
            const loc = data.results?.[0]?.geometry?.location;
            return loc ? { lat: loc.lat, lng: loc.lng } : null;
        }
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