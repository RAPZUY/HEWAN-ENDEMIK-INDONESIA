"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  Info,
  Check
} from "lucide-react";

export default function NavbarHUD({
  speciesList = [],
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedIsland,
  onIslandChange,
  onSelectFauna,
  showMarkers,
  onToggleMarkers,
  showMigration,
  onToggleMigration,
  showBiogeography,
  onToggleBiogeography
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showIslandMenu, setShowIslandMenu] = useState(false);
  const searchContainerRef = useRef(null);

  // Daftar status IUCN
  const iucnOptions = [
    { value: "ALL", label: "Semua Status", color: "bg-slate-700 text-slate-200" },
    { value: "CR", label: "CR (Kritis)", color: "bg-red-500/20 text-red-400 border-red-500/40" },
    { value: "EN", label: "EN (Genting)", color: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
    { value: "VU", label: "VU (Rentan)", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    { value: "LC", label: "LC (Aman)", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" }
  ];

  const islandOptions = ["Semua Pulau", "Sumatera", "Jawa", "Bali", "Nusa Tenggara", "Kalimantan", "Sulawesi", "Papua"];

  // Autocomplete filtered list
  const searchResults = searchQuery.trim() === ""
    ? []
    : speciesList.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.island.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="absolute top-4 left-4 right-4 lg:right-[480px] z-[450] pointer-events-none transition-all duration-300">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Top Floating Glass Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  PUSANTARA <span className="text-emerald-400">FAUNA</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  GEOSPASIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Peta Konservasi & Sebaran Satwa Endemik Indonesia
              </p>
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="relative flex-1 max-w-xs sm:max-w-md" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari satwa, nama latin, atau pulau..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 text-xs text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-slate-800 text-[10px] font-semibold text-slate-400">
                  HASIL PENCARIAN SATWA:
                </div>
                {searchResults.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFauna(f);
                      setIsSearchFocused(false);
                      onSearchChange(f.name);
                    }}
                    className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-emerald-500/10 transition-colors border-b border-slate-800/40 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{f.name}</span>
                        <span className="text-[10px] font-normal italic text-slate-400">({f.scientificName})</span>
                      </p>
                      <p className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{f.island} &bull; {f.locationName}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {f.iucnStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layer Switcher & Filter Menu Trigger */}
          <div className="flex items-center gap-2">
            {/* Pulau Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowIslandMenu(!showIslandMenu);
                  setShowLayerMenu(false);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{selectedIsland}</span>
              </button>

              {showIslandMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
                  {islandOptions.map((isl) => (
                    <button
                      key={isl}
                      onClick={() => {
                        onIslandChange(isl);
                        setShowIslandMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        selectedIsland === isl
                          ? "bg-emerald-500/20 text-emerald-300 font-bold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{isl}</span>
                      {selectedIsland === isl && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layer Control Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLayerMenu(!showLayerMenu);
                  setShowIslandMenu(false);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Layer Peta</span>
              </button>

              {showLayerMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">PENGATURAN LAYER:</span>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800/60 p-1.5 rounded-lg cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Titik Sebaran Satwa
                    </span>
                    <input
                      type="checkbox"
                      checked={showMarkers}
                      onChange={onToggleMarkers}
                      className="accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800/60 p-1.5 rounded-lg cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Jalur Jelajah / Koridor
                    </span>
                    <input
                      type="checkbox"
                      checked={showMigration}
                      onChange={onToggleMigration}
                      className="accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800/60 p-1.5 rounded-lg cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      Garis Wallace & Weber
                    </span>
                    <input
                      type="checkbox"
                      checked={showBiogeography}
                      onChange={onToggleBiogeography}
                      className="accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IUCN Status Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filter IUCN:</span>
          </span>

          {iucnOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusFilterChange(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold"
                    : `${opt.color} bg-slate-900/80 hover:bg-slate-800 border-slate-700/60`
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
