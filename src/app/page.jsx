"use client";

import { useState, useEffect, useMemo } from "react";
import initialFaunaSeed from "@/data/fauna-seed.json";
import MapWrapper from "@/components/MapWrapper";
import NavbarHUD from "@/components/NavbarHUD";
import FaunaDrawer from "@/components/FaunaDrawer";
import { Compass, Sparkles, AlertTriangle } from "lucide-react";

export default function PusantaraFaunaPage() {
  // State Master Data
  const [faunaList, setFaunaList] = useState(initialFaunaSeed.species || []);
  const [biogeographicLines, setBiogeographicLines] = useState(initialFaunaSeed.biogeographicLines || {});
  
  // State Interaksi & Filter
  const [activeFauna, setActiveFauna] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIsland, setSelectedIsland] = useState("Semua Pulau");

  // State Layer Switcher
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMigration, setShowMigration] = useState(true);
  const [showBiogeography, setShowBiogeography] = useState(true);

  // State GBIF Live Data
  const [gbifPoints, setGbifPoints] = useState([]);
  const [gbifLoading, setGbifLoading] = useState(false);
  const [showGbifLayer, setShowGbifLayer] = useState(false);

  // Enrich data secara background dari API internal Next.js (Wikipedia enrichments)
  useEffect(() => {
    async function loadEnrichedFauna() {
      try {
        const res = await fetch("/api/fauna");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.species) {
            setFaunaList(json.data.species);
            if (json.data.biogeographicLines) {
              setBiogeographicLines(json.data.biogeographicLines);
            }
          }
        }
      } catch (err) {
        console.log("Background enrichment notice:", err.message);
      }
    }
    loadEnrichedFauna();
  }, []);

  // Handler query empiris GBIF
  const handleFetchGbif = async (scientificName) => {
    if (!scientificName) return;
    setGbifLoading(true);
    try {
      const res = await fetch(`/api/gbif?scientificName=${encodeURIComponent(scientificName)}&limit=30`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.occurrences) {
          setGbifPoints(json.occurrences);
          setShowGbifLayer(true);
        }
      }
    } catch (err) {
      console.warn("Gagal query GBIF:", err);
    } finally {
      setGbifLoading(false);
    }
  };

  // Reset GBIF points saat fauna berganti
  const handleSelectFauna = (fauna) => {
    setActiveFauna(fauna);
    setGbifPoints([]);
    setShowGbifLayer(false);
  };

  // Filter Fauna Berdasarkan Kriteria Aktif
  const filteredFauna = useMemo(() => {
    return faunaList.filter((item) => {
      // 1. Search Query
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.island.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status IUCN
      const matchStatus = statusFilter === "ALL" || item.iucnStatus === statusFilter;

      // 3. Pulau
      const matchIsland =
        selectedIsland === "Semua Pulau" ||
        item.island.toLowerCase() === selectedIsland.toLowerCase();

      return matchSearch && matchStatus && matchIsland;
    });
  }, [faunaList, searchQuery, statusFilter, selectedIsland]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Fullscreen Map Canvas */}
      <div className="w-full h-full">
        <MapWrapper
          faunaList={filteredFauna}
          activeFauna={activeFauna}
          onSelectFauna={handleSelectFauna}
          showMarkers={showMarkers}
          showMigration={showMigration}
          showBiogeography={showBiogeography}
          biogeographicLines={biogeographicLines}
          gbifPoints={showGbifLayer ? gbifPoints : []}
        />
      </div>

      {/* 2. Floating HUD Navigation & Filters */}
      <NavbarHUD
        speciesList={faunaList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedIsland={selectedIsland}
        onIslandChange={setSelectedIsland}
        onSelectFauna={handleSelectFauna}
        showMarkers={showMarkers}
        onToggleMarkers={() => setShowMarkers((prev) => !prev)}
        showMigration={showMigration}
        onToggleMigration={() => setShowMigration((prev) => !prev)}
        showBiogeography={showBiogeography}
        onToggleBiogeography={() => setShowBiogeography((prev) => !prev)}
      />

      {/* 3. Bottom Quick Carousel (Saat Tidak Ada Satwa Dipilih / Drawer Tutup) */}
      {!activeFauna && (
        <div className="absolute bottom-5 left-4 right-4 z-[400] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-4xl w-full p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-emerald-500/20 shadow-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
              <Compass className="w-3.5 h-3.5" />
              <span>Jelajah Satwa ({filteredFauna.length}):</span>
            </div>

            {filteredFauna.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectFauna(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/40 text-xs text-white transition-all shrink-0 active:scale-95 group"
              >
                <span className="w-2 h-2 rounded-full" style={{
                  backgroundColor: item.iucnStatus === 'CR' ? '#dc2626' : item.iucnStatus === 'EN' ? '#ea580c' : item.iucnStatus === 'VU' ? '#f59e0b' : '#10b981'
                }}></span>
                <span className="font-semibold group-hover:text-emerald-300">{item.name}</span>
                <span className="text-[10px] text-slate-400">({item.island})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Detail Adaptive Sheet / Drawer */}
      <FaunaDrawer
        fauna={activeFauna}
        onClose={() => setActiveFauna(null)}
        onFetchGbif={handleFetchGbif}
        gbifLoading={gbifLoading}
        gbifCount={gbifPoints.length}
        showGbifLayer={showGbifLayer}
        onToggleGbifLayer={() => setShowGbifLayer((prev) => !prev)}
      />
    </main>
  );
}
