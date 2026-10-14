"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Layers,
  MapPin,
  Check,
  X
} from "lucide-react";

// Definisi semantik status IUCN dengan label dan deskripsi aksesibilitas
const IUCN_DEFINITIONS = {
  CR: {
    label: "CR",
    fullName: "Kritis (Critically Endangered)",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30",
    activeColor: "bg-red-600 text-white border-red-500 font-bold"
  },
  EN: {
    label: "EN",
    fullName: "Terancam Punah (Endangered)",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30",
    activeColor: "bg-orange-600 text-white border-orange-500 font-bold"
  },
  VU: {
    label: "VU",
    fullName: "Rentan (Vulnerable)",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30",
    activeColor: "bg-amber-600 text-white border-amber-500 font-bold"
  },
  LC: {
    label: "LC",
    fullName: "Risiko Rendah (Least Concern)",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30",
    activeColor: "bg-emerald-600 text-white border-emerald-500 font-bold"
  }
};

const REGIONS = [
  "Semua",
  "Sumatera",
  "Jawa",
  "Bali",
  "Kalimantan",
  "Sulawesi",
  "Nusa Tenggara",
  "Maluku",
  "Papua"
];

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

  // Evaluasi dataset aktif: Hanya render status IUCN yang memiliki jumlah > 0
  const dynamicIucnOptions = useMemo(() => {
    const counts = { ALL: speciesList.length };

    speciesList.forEach((sp) => {
      const st = sp.iucnStatus;
      if (st) {
        counts[st] = (counts[st] || 0) + 1;
      }
    });

    const options = [
      {
        value: "ALL",
        label: "Semua",
        count: counts.ALL,
        fullName: "Semua Status Konservasi",
        badgeColor: "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700",
        activeColor: "bg-emerald-600 text-white border-emerald-500 font-bold"
      }
    ];

    Object.keys(IUCN_DEFINITIONS).forEach((key) => {
      if (counts[key] && counts[key] > 0) {
        options.push({
          value: key,
          label: IUCN_DEFINITIONS[key].label,
          count: counts[key],
          fullName: IUCN_DEFINITIONS[key].fullName,
          badgeColor: IUCN_DEFINITIONS[key].badgeColor,
          activeColor: IUCN_DEFINITIONS[key].activeColor
        });
      }
    });

    return options;
  }, [speciesList]);

  // Autocomplete real-time hasil pencarian
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === "") return [];
    const query = searchQuery.toLowerCase().trim();
    return speciesList
      .filter((f) =>
        f.name.toLowerCase().includes(query) ||
        f.scientificName.toLowerCase().includes(query) ||
        (f.region || f.island || "").toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, speciesList]);

  // Click outside to close search and menus
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
    <header className="absolute top-4 left-4 right-4 lg:right-96 z-40 pointer-events-none transition-all duration-300">
      <div className="flex flex-col gap-2.5 pointer-events-auto max-w-full">
        {/* Top Floating Glass Bar: Clean DOM, no redundant empty wrappers */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/60">
          
          {/* Logo & Judul Bersih "NUSANTARA FAUNA" */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950 border border-emerald-400/30 shrink-0">
              <span className="text-xl" role="img" aria-label="Ikon Flora Fauna">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  NUSANTARA <span className="text-emerald-400">FAUNA</span>
                </h1>
                <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  GEOPORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Peta Sebaran Satwa Endemik Indonesia & Konservasi
              </p>
            </div>
          </div>

          {/* Search Bar Input Real-Time dengan Autocomplete */}
          <div className="relative flex-1 min-w-48 max-w-sm" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                aria-label="Cari nama satwa atau nama ilmiah"
                placeholder="Cari satwa atau nama latin..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full h-11 pl-9 pr-8 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  aria-label="Hapus pencarian"
                  className="w-11 h-11 flex items-center justify-center absolute right-0 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hasil Pencarian:
                </div>
                {searchResults.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFauna(f);
                      setIsSearchFocused(false);
                      onSearchChange(f.name);
                    }}
                    className="w-full min-h-11 px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-500/10 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{f.name}</span>
                        <span className="text-xs font-normal italic text-slate-400 font-serif">({f.scientificName})</span>
                      </p>
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{f.region || f.island} &bull; {f.locationName}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {f.iucnStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Dropdown Wilayah & Layer */}
          <div className="flex items-center gap-2">
            {/* Filter Wilayah */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowIslandMenu(!showIslandMenu);
                  setShowLayerMenu(false);
                }}
                aria-label={`Pilih Wilayah: ${selectedIsland}`}
                className="h-11 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{selectedIsland}</span>
              </button>

              {showIslandMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
                  {REGIONS.map((reg) => {
                    const isSelected = selectedIsland.toLowerCase() === reg.toLowerCase() || (reg === "Semua" && selectedIsland === "Semua");
                    return (
                      <button
                        key={reg}
                        onClick={() => {
                          onIslandChange(reg);
                          setShowIslandMenu(false);
                        }}
                        className={`w-full min-h-11 text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300 font-bold"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span>{reg}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kontrol Layer Peta & Garis Biogeografi */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLayerMenu(!showLayerMenu);
                  setShowIslandMenu(false);
                }}
                aria-label="Pengaturan Layer Peta"
                className="h-11 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Layer Peta</span>
              </button>

              {showLayerMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    KONTROL LAYER GEOSPASIAL:
                  </span>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800 p-2 rounded-lg cursor-pointer min-h-11">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Titik Sebaran Satwa
                    </span>
                    <input
                      type="checkbox"
                      checked={showMarkers}
                      onChange={onToggleMarkers}
                      aria-label="Toggle Titik Sebaran Satwa"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800 p-2 rounded-lg cursor-pointer min-h-11">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Jalur Jelajah Satwa
                    </span>
                    <input
                      type="checkbox"
                      checked={showMigration}
                      onChange={onToggleMigration}
                      aria-label="Toggle Jalur Jelajah Satwa"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-200 hover:bg-slate-800 p-2 rounded-lg cursor-pointer min-h-11">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                      Garis Wallace & Weber
                    </span>
                    <input
                      type="checkbox"
                      checked={showBiogeography}
                      onChange={onToggleBiogeography}
                      aria-label="Toggle Garis Wallace dan Weber"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IUCN Status Dynamic Filter: Hanya render yang jumlahnya > 0 dengan touch target >= 44x44px */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Status IUCN:</span>
          </div>

          {dynamicIucnOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusFilterChange(opt.value)}
                aria-label={`Filter status konservasi ${opt.fullName} (${opt.count} satwa)`}
                title={`${opt.fullName} - ${opt.count} satwa`}
                className={`min-h-11 px-4 py-2 rounded-xl text-xs transition-all border flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  isSelected
                    ? opt.activeColor
                    : `${opt.badgeColor} border-slate-700`
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
