import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LMap } from 'leaflet';
import type { Post } from '../types';

type Props = { posts: Post[]; onSelect: (post: Post) => void };
type Leaflet = typeof import('leaflet');

export default function PostsMap({ posts, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const selectRef = useRef(onSelect);
  const [leaflet, setLeaflet] = useState<Leaflet | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    import('leaflet')
      .then((module) => setLeaflet('default' in module ? module.default : module))
      .catch((error: unknown) => {
        console.error('Leaflet load error:', error);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    if (!leaflet || !box.current) return;
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const map = leaflet.map(box.current, { scrollWheelZoom: false }).setView([49.8397, 24.0297], 12);
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap',
    }).addTo(map);
    layerRef.current = leaflet.layerGroup().addTo(map);
    mapRef.current = map;
    setReady(true);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, [leaflet]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!leaflet || !ready || !map || !layer) return;
    layer.clearLayers();
    const points: [number, number][] = [];

    posts.forEach((post) => {
      const lat = post.lat;
      const lng = post.lng;
      if (lat == null || lng == null) return;

      const icon = leaflet.divIcon({
        className: '',
        html: '<div style="width:22px;height:22px;border-radius:50%;background:#536C47;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
        iconSize: [22, 22], iconAnchor: [11, 11],
      });
      const element = document.createElement('div');
      element.style.cssText = 'font-family:system-ui,sans-serif;min-width:170px';
      const title = document.createElement('div');
      title.style.cssText = 'font-weight:800;font-size:14px;margin-bottom:4px';
      title.textContent = post.title;
      const info = document.createElement('div');
      info.style.cssText = 'font-size:12px;color:#555;margin-bottom:8px';
      info.textContent = `${post.price} грн/міс · ${post.district}${post.address ? ` · ${post.address}` : ''}`;
      const button = document.createElement('button');
      button.textContent = 'Деталі';
      button.style.cssText = 'background:#304632;color:#fff;border:0;border-radius:8px;padding:7px 14px;cursor:pointer;font-weight:700';
      button.onclick = () => selectRef.current(post);
      element.append(title, info, button);

      leaflet.marker([lat, lng], { icon }).addTo(layer).bindPopup(element);
      points.push([lat, lng]);
    });

    if (points.length) map.fitBounds(leaflet.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [leaflet, ready, posts]);

  return (
    <div ref={box} style={{ width: '100%', height: '100%', minHeight: 360 }}>
      {loadError && <div style={{ padding: 16, color: '#7C8378' }}>Не вдалося завантажити карту.</div>}
    </div>
  );
}