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

// Status IUCN Colors Mapping (Semantic Conservation Palette)
const IUCN_COLORS = {
  CR: "#dc2626", // Red-600
  EN: "#ea580c", // Orange-600
  VU: "#f59e0b", // Amber-500
  LC: "#10b981"  // Emerald-500
};

// Emoji avatar untuk marker satwa di Leaflet
const SPECIES_ICONS = {
  "harimau-sumatera": "🐅",
  "gajah-sumatera": "🐘",
  "orangutan-sumatera": "🦧",
  "badak-jawa": "🦏",
  "elang-jawa": "🦅",
  "orangutan-kalimantan": "🦧",
  "bekantan": "🐵",
  "macan-dahan-kalimantan": "🐆",
  "jalak-bali": "🪶",
  "komodo": "🦎",
  "anoa": "🐂",
  "babirusa": "🐗",
  "tarsius": "🐒",
  "maleo": "🥚",
  "kuskus-beruang-talaud": "🐻",
  "bidadari-halmahera": "🪽",
  "burung-cendrawasih": "🦜",
  "kasuari-gelambir-ganda": "🦃",
  "kanguru-pohon-mantel-emas": "🦘",
  "penyu-belimbing": "🐢",
  "mambruk-victoria": "🕊️"
};

/**
 * Controller untuk auto pan & zoom ketika fauna aktif berubah
 * Menggunakan durasi animasi 1.2s sesuai spesifikasi
 */
function MapCameraController({ activeFauna }) {
  const map = useMap();

  useEffect(() => {
    if (!activeFauna || !activeFauna.coordinates) return;

    map.flyTo(activeFauna.coordinates, 8, {
      animate: true,
      duration: 1.2
    });
  }, [activeFauna, map]);

  return null;
}

/**
 * Komponen Utama Peta Geospasial Satwa Endemik Indonesia
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Batas spasial kepulauan Indonesia
  const indonesiaBounds = [
    [-11.5, 94.0], // Barat Daya (Samudra Hindia)
    [6.5, 142.0]   // Timur Laut (Papua & Samudra Pasifik)
  ];

  // Generator Leaflet DivIcon kustom dengan touch target >= 44x44px
  const createCustomMarkerIcon = (fauna, isActive) => {
    const color = IUCN_COLORS[fauna.iucnStatus] || "#10b981";
    const emoji = SPECIES_ICONS[fauna.id] || "🐾";

    return L.divIcon({
      className: `fauna-custom-marker ${isActive ? "active" : ""}`,
      iconSize: [44, 44],
      iconAnchor: [22, 42],
      popupAnchor: [0, -40],
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          ${isActive ? `<div class="fauna-pulse-ring" style="border: 2px solid ${color}; background-color: ${color}25;"></div>` : ""}
          <div class="fauna-marker-pin" style="background: radial-gradient(circle at 30% 30%, ${color}, #09131d); border-color: ${isActive ? '#ffffff' : color};">
            <div class="fauna-marker-inner">
              <span style="display:inline-block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8)); font-size: 16px;">${emoji}</span>
            </div>
          </div>
          <span style="
            position: absolute;
            top: -4px;
            right: -4px;
            background-color: ${color};
            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 9999px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          ">${fauna.iucnStatus}</span>
        </div>
      `
    });
  };

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full min-h-screen">
      <MapContainer
        center={[-2.5, 118.0]}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* CartoDB Voyager Tile: Kontras tinggi, bersih, dan menonjolkan daratan kepulauan */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Dynamic Pan & Zoom Camera Animation (1.2s) */}
        <MapCameraController activeFauna={activeFauna} />

        {/* 1. Garis Biogeografis Wallace & Weber */}
        {showBiogeography && biogeographicLines && (
          <>
            {biogeographicLines.wallaceLine && (
              <Polyline
                positions={biogeographicLines.wallaceLine.coordinates}
                pathOptions={{
                  color: biogeographicLines.wallaceLine.color || "#f59e0b",
                  weight: 3,
                  opacity: 0.9,
                  dashArray: "8, 10"
                }}
              >
                <Tooltip sticky direction="top">
                  <div className="text-xs bg-slate-900 text-amber-300 p-2 rounded-lg border border-amber-500/40 shadow-lg">
                    <p className="font-bold text-amber-400">Garis Wallace</p>
                    <p className="text-[10px] text-slate-300">Pemisah Zona Asiatis (Sunda) dan Wallacea</p>
                  </div>
                </Tooltip>
              </Polyline>
            )}

            {biogeographicLines.weberLine && (
              <Polyline
                positions={biogeographicLines.weberLine.coordinates}
                pathOptions={{
                  color: biogeographicLines.weberLine.color || "#0ea5e9",
                  weight: 3,
                  opacity: 0.9,
                  dashArray: "8, 10"
                }}
              >
                <Tooltip sticky direction="top">
                  <div className="text-xs bg-slate-900 text-sky-300 p-2 rounded-lg border border-sky-500/40 shadow-lg">
                    <p className="font-bold text-sky-400">Garis Weber</p>
                    <p className="text-[10px] text-slate-300">Batas Faunal Balance Wallacea dan Zona Australis (Sahul)</p>
                  </div>
                </Tooltip>
              </Polyline>
            )}
          </>
        )}

        {/* 2. Rute Spasial Koridor Jelajah */}
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
                <div className="text-xs bg-slate-900 text-white p-2 rounded-lg shadow-xl border border-slate-700">
                  <p className="font-bold text-emerald-400">Koridor Jelajah: {fauna.name}</p>
                  <p className="text-[10px] text-slate-300">{fauna.region || fauna.island} &bull; {fauna.locationName}</p>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 3. Titik Observasi Lapangan GBIF */}
        {activeFauna && gbifPoints && gbifPoints.length > 0 && gbifPoints.map((point, idx) => (
          <Marker
            key={`gbif-point-${idx}`}
            position={[point.lat, point.lng]}
            icon={L.divIcon({
              className: "gbif-ping-marker",
              iconSize: [14, 14],
              iconAnchor: [7, 7],
              html: `
                <div style="
                  width: 12px;
                  height: 12px;
                  background-color: #0ea5e9;
                  border: 2px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 0 10px #0284c7;
                "></div>
              `
            })}
          >
            <Tooltip direction="top">
              <div className="text-xs bg-slate-900 text-sky-200 p-2 rounded-lg border border-sky-500/40 shadow-xl">
                <p className="font-semibold text-sky-300">Rekam Spesimen GBIF ({point.year || "Spasial"})</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{point.locality}</p>
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
                <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl border border-emerald-500/40 min-w-36">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{SPECIES_ICONS[fauna.id] || "🐾"}</span>
                    <p className="font-bold text-xs text-emerald-300">{fauna.name}</p>
                  </div>
                  <p className="text-[10px] italic text-slate-400 font-serif">{fauna.scientificName}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] pt-1 border-t border-slate-800">
                    <span className="text-slate-300 font-medium">{fauna.region || fauna.island}</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-bold text-[9px]"
                      style={{ backgroundColor: `${IUCN_COLORS[fauna.iucnStatus]}25`, color: IUCN_COLORS[fauna.iucnStatus] }}
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

      {/* Legenda Biogeografi Nusantara (Ketika Layer Aktif) */}
      {showBiogeography && (
        <div className="hidden md:flex absolute bottom-4 left-4 z-30 flex-col gap-1.5 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-200 shadow-xl max-w-xs pointer-events-auto">
          <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-0.5">
            Legenda Biogeografi
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-400 shrink-0"></span>
            <span><strong className="text-amber-300">Garis Wallace:</strong> Batas Zona Asiatis & Peralihan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-sky-400 shrink-0"></span>
            <span><strong className="text-sky-300">Garis Weber:</strong> Batas Peralihan & Australis</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 leading-normal border-t border-slate-800 pt-1">
            <strong>3 Zona:</strong> Asiatis (Sunda), Wallacea (Sulawesi/Nusa Tenggara/Maluku), Australis (Sahul/Papua).
          </div>
        </div>
      )}
    </div>
  );
}
