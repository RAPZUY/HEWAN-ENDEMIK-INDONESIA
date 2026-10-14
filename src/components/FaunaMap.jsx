"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap
} from "react-leaflet";
import L from "leaflet";

// Status IUCN Colors Mapping
const IUCN_COLORS = {
  CR: "#dc2626", // Crimson
  EN: "#ea580c", // Orange
  VU: "#f59e0b", // Amber
  LC: "#10b981"  // Emerald
};

// Emoji avatar untuk siluet fauna di dalam Leaflet Marker
const SPECIES_ICONS = {
  "komodo": "🦎",
  "badak-jawa": "🦏",
  "harimau-sumatera": "🐅",
  "orangutan-kalimantan": "🦧",
  "jalak-bali": "🪶",
  "burung-cendrawasih": "🦜",
  "anoa": "🐂",
  "babirusa": "🐗",
  "tarsius": "🐒",
  "bekantan": "🐵",
  "penyu-belimbing": "🐢"
};

/**
 * Controller untuk auto pan & zoom ketika fauna aktif berubah
 */
function MapCameraController({ activeFauna }) {
  const map = useMap();

  useEffect(() => {
    if (!activeFauna || !activeFauna.coordinates) return;

    map.flyTo(activeFauna.coordinates, 8, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }, [activeFauna, map]);

  return null;
}

/**
 * Komponen Utama Peta Fauna Indonesia
 */
export default function FaunaMap({
  faunaList = [],
  activeFauna,
  onSelectFauna,
  showMarkers = true,
  showMigration = true,
  showBiogeography = true,
  biogeographicLines = {},
  gbifPoints = []
}) {
  const [mapReady, setMapReady] = useState(false);

  // Boundary koordinat kepulauan Indonesia
  const indonesiaBounds = [
    [-11.5, 94.0], // Barat Daya
    [6.5, 142.0]   // Timur Laut
  ];

  // Helper untuk membuat Leaflet DivIcon kustom berdesain modern
  const createCustomMarkerIcon = (fauna, isActive) => {
    const color = IUCN_COLORS[fauna.iucnStatus] || "#10b981";
    const emoji = SPECIES_ICONS[fauna.id] || "🐾";

    return L.divIcon({
      className: `fauna-custom-marker ${isActive ? "active" : ""}`,
      iconSize: [44, 44],
      iconAnchor: [22, 42],
      popupAnchor: [0, -40],
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isActive ? `<div class="fauna-pulse-ring" style="border: 2px solid ${color}; background-color: ${color}20;"></div>` : ""}
          <div class="fauna-marker-pin" style="background: radial-gradient(circle at 30% 30%, ${color}, #0f172a); border-color: ${isActive ? '#ffffff' : color};">
            <div class="fauna-marker-inner">
              <span style="display:inline-block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8)); font-size: 16px;">${emoji}</span>
            </div>
          </div>
          <!-- Micro-badge status IUCN -->
          <span style="
            position: absolute;
            top: -6px;
            right: -6px;
            background-color: ${color};
            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 5px;
            border-radius: 9999px;
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          ">${fauna.iucnStatus}</span>
        </div>
      `
    });
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-2.5, 118.0]}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={true}
        className="w-full h-full"
        whenReady={() => setMapReady(true)}
      >
        {/* OpenStreetMap CartoDB Dark Matter / Satellite Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Dynamic Camera Animation */}
        <MapCameraController activeFauna={activeFauna} />

        {/* 1. Garis Biogeografis Wallace & Weber */}
        {showBiogeography && biogeographicLines && (
          <>
            {biogeographicLines.wallaceLine && (
              <Polyline
                positions={biogeographicLines.wallaceLine.coordinates}
                pathOptions={{
                  color: biogeographicLines.wallaceLine.color,
                  weight: 3,
                  opacity: 0.85,
                  dashArray: "8, 10"
                }}
              >
                <Tooltip sticky direction="top" className="bg-slate-900/90 text-amber-300 font-semibold px-2 py-1 rounded border border-amber-500/30">
                  <div className="text-xs">
                    <span className="font-bold text-amber-400">Garis Wallace (Pemisah Zona Sunda & Wallacea)</span>
                    <p className="text-[10px] text-slate-300">Batas zoogeografi Alfred Russel Wallace (1859)</p>
                  </div>
                </Tooltip>
              </Polyline>
            )}

            {biogeographicLines.weberLine && (
              <Polyline
                positions={biogeographicLines.weberLine.coordinates}
                pathOptions={{
                  color: biogeographicLines.weberLine.color,
                  weight: 3,
                  opacity: 0.85,
                  dashArray: "8, 10"
                }}
              >
                <Tooltip sticky direction="top" className="bg-slate-900/90 text-sky-300 font-semibold px-2 py-1 rounded border border-sky-500/30">
                  <div className="text-xs">
                    <span className="font-bold text-sky-400">Garis Weber (Pemisah Wallacea & Australis)</span>
                    <p className="text-[10px] text-slate-300">Batas kesetimbangan faunistik Max Wilhelm Carl Weber</p>
                  </div>
                </Tooltip>
              </Polyline>
            )}
          </>
        )}

        {/* 2. Rute Migrasi / Persebaran Spasial Polylines */}
        {showMigration && faunaList.map((fauna) => {
          if (!fauna.migrationWaypoints || fauna.migrationWaypoints.length < 2) return null;
          const isCurrentActive = activeFauna?.id === fauna.id;
          const color = IUCN_COLORS[fauna.iucnStatus] || "#10b981";

          return (
            <Polyline
              key={`migration-${fauna.id}`}
              positions={fauna.migrationWaypoints}
              pathOptions={{
                color: color,
                weight: isCurrentActive ? 4 : 2,
                opacity: isCurrentActive ? 0.95 : 0.45,
                dashArray: "10, 14",
                className: "animated-migration-trail"
              }}
            >
              <Tooltip sticky direction="center">
                <div className="text-xs bg-slate-900 text-white p-1 rounded shadow">
                  <p className="font-bold text-emerald-400">Koridor Jelajah {fauna.name}</p>
                  <p className="text-[10px] text-slate-300">{fauna.island} ({fauna.locationName})</p>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 3. Titik Observasi Empiris GBIF untuk Fauna Aktif */}
        {activeFauna && gbifPoints && gbifPoints.length > 0 && gbifPoints.map((point, idx) => (
          <Marker
            key={`gbif-point-${idx}`}
            position={[point.lat, point.lng]}
            icon={L.divIcon({
              className: "gbif-ping-marker",
              iconSize: [12, 12],
              iconAnchor: [6, 6],
              html: `
                <div style="
                  width: 10px;
                  height: 10px;
                  background-color: #38bdf8;
                  border: 1.5px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 0 8px #0284c7;
                "></div>
              `
            })}
          >
            <Tooltip direction="top">
              <div className="text-[11px] bg-slate-900 text-sky-200 p-1.5 rounded border border-sky-500/30">
                <p className="font-semibold">Observasi GBIF ({point.year || "Spasial"})</p>
                <p className="text-[10px] text-slate-300">{point.locality}</p>
                <p className="text-[9px] text-slate-400 italic">Basis: {point.basisOfRecord}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* 4. Marker Utama Fauna Interaktif */}
        {showMarkers && faunaList.map((fauna) => {
          const isActive = activeFauna?.id === fauna.id;
          return (
            <Marker
              key={fauna.id}
              position={fauna.coordinates}
              icon={createCustomMarkerIcon(fauna, isActive)}
              eventHandlers={{
                click: () => onSelectFauna(fauna)
              }}
            >
              <Tooltip direction="top" offset={[0, -36]} opacity={0.95}>
                <div className="bg-slate-900/95 text-white p-2 rounded-lg shadow-xl border border-emerald-500/30 min-w-[140px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{SPECIES_ICONS[fauna.id] || "🐾"}</span>
                    <p className="font-bold text-sm text-emerald-300">{fauna.name}</p>
                  </div>
                  <p className="text-[10px] italic text-slate-400">{fauna.scientificName}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-300">{fauna.island}</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                      style={{ backgroundColor: `${IUCN_COLORS[fauna.iucnStatus]}30`, color: IUCN_COLORS[fauna.iucnStatus] }}
                    >
                      {fauna.iucnStatus}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Mini Watermark HUD Peta */}
      <div className="absolute bottom-3 left-4 z-[400] pointer-events-none hidden sm:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Pusantara Geoportal &bull; Proyeksi Spasial WGS84</span>
      </div>
    </div>
  );
}
