"use client";

import { useState, useEffect, useMemo } from "react";
import initialFaunaSeed from "@/data/fauna-seed.json";
import MapWrapper from "@/components/MapWrapper";
import NavbarHUD from "@/components/NavbarHUD";
import FaunaDrawer from "@/components/FaunaDrawer";
import { Compass } from "lucide-react";

export default function NusantaraFaunaPage() {
  // State Master Dataset
  const [faunaList, setFaunaList] = useState(initialFaunaSeed.species || []);
  const [biogeographicLines, setBiogeographicLines] = useState(initialFaunaSeed.biogeographicLines || {});
  
  // State Interaksi & Filter
  const [activeFauna, setActiveFauna] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIsland, setSelectedIsland] = useState("Semua");

  // State Layer Switcher
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMigration, setShowMigration] = useState(true);
  const [showBiogeography, setShowBiogeography] = useState(true);

  // State GBIF Empiris Data
  const [gbifPoints, setGbifPoints] = useState([]);
  const [gbifLoading, setGbifLoading] = useState(false);
  const [showGbifLayer, setShowGbifLayer] = useState(false);

  // Background Enrichment dari API internal Next.js (Wikipedia, iNaturalist, GBIF)
  useEffect(() => {
    let isMounted = true;
    async function loadEnrichedFauna() {
      try {
        const res = await fetch("/api/fauna");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data.species) {
            setFaunaList(json.data.species);
            if (json.data.biogeographicLines) {
              setBiogeographicLines(json.data.biogeographicLines);
            }
          }
        }
      } catch (err) {
        // Graceful degradation: tetap gunakan master dataset statis
        console.info("Enrichment fallback active, using local curated dataset.");
      }
    }
    loadEnrichedFauna();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler query empiris GBIF dengan timeout dan caching
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
    } catch {
      // Graceful fallback
    } finally {
      setGbifLoading(false);
    }
  };

  // Pilih fauna dan reset layer GBIF
  const handleSelectFauna = (fauna) => {
    setActiveFauna(fauna);
    setGbifPoints([]);
    setShowGbifLayer(false);
  };

  // Filter Reaktif Multi-Dimensi (Search, Status IUCN, Wilayah)
  const filteredFauna = useMemo(() => {
    return faunaList.filter((item) => {
      // 1. Pencarian teks
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.scientificName.toLowerCase().includes(query) ||
        (item.region || item.island || "").toLowerCase().includes(query) ||
        (item.biogeographicZone || "").toLowerCase().includes(query);

      // 2. Filter Status IUCN
      const matchStatus = statusFilter === "ALL" || item.iucnStatus === statusFilter;

      // 3. Filter Wilayah / Pulau
      const itemRegion = (item.region || item.island || "").toLowerCase();
      const selectedRegionLower = selectedIsland.toLowerCase();
      const matchIsland =
        selectedIsland === "Semua" ||
        selectedIsland === "Semua Pulau" ||
        itemRegion.includes(selectedRegionLower) ||
        selectedRegionLower.includes(itemRegion);

      return matchSearch && matchStatus && matchIsland;
    });
  }, [faunaList, searchQuery, statusFilter, selectedIsland]);

  return (
    <main className="relative w-screen h-screen min-h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Fullscreen Map Canvas */}
      <div className="w-full h-full min-h-screen">
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

      {/* 3. Reaktif Jelajah Satwa Carousel (Tampil saat drawer tertutup) */}
      {!activeFauna && (
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-4xl w-full p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
              <Compass className="w-4 h-4" />
              <span>Jelajah Satwa ({filteredFauna.length}):</span>
            </div>

            {filteredFauna.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectFauna(item)}
                aria-label={`Pilih satwa ${item.name}`}
                className="min-h-11 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/40 text-xs text-white transition-all shrink-0 active:scale-95 group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      item.iucnStatus === "CR"
                        ? "#dc2626"
                        : item.iucnStatus === "EN"
                        ? "#ea580c"
                        : item.iucnStatus === "VU"
                        ? "#f59e0b"
                        : "#10b981"
                  }}
                ></span>
                <span className="font-semibold group-hover:text-emerald-300">{item.name}</span>
                <span className="text-slate-400 text-xs">({item.region || item.island})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Adaptive Detail Panel (Slide-over desktop & Bottom Sheet mobile) */}
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
