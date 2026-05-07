'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/287/287221.png', // Pokeball icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const shinyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', // Star icon
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MarkerData {
  id: number;
  name: string;
  pos: [number, number];
  isShiny?: boolean;
}

const mockMarkers: MarkerData[] = [
  { id: 1, name: 'Charizard Outbreak', pos: [51.505, -0.09], isShiny: true },
  { id: 2, name: 'Gimmighoul Chest', pos: [51.51, -0.1], isShiny: false },
  { id: 3, name: 'Rare Spawn: Roaring Moon', pos: [51.49, -0.08], isShiny: true },
];

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function InteractiveMap({ region }: { region: string }) {
  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={13} 
      className="h-full w-full bg-slate-950"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {mockMarkers.map((m) => (
        <Marker key={m.id} position={m.pos} icon={m.isShiny ? shinyIcon : customIcon}>
          <Popup className="custom-popup">
            <div className="p-2 bg-slate-900 text-white rounded-lg border border-slate-800">
              <h5 className="font-black italic uppercase tracking-tighter text-sky-400">{m.name}</h5>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Coordinate scan confirmed</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Heatmap/Hotspot visualization */}
      <Circle 
        center={[51.505, -0.09]} 
        radius={500} 
        pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.1 }} 
      />

      <MapResizer />
    </MapContainer>
  );
}
