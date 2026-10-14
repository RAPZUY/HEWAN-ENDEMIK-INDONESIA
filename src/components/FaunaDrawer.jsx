"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Dna,
  Compass,
  Globe2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  Maximize2,
  Minimize2,
  BookOpen,
  Newspaper
} from "lucide-react";

// Semantic IUCN metadata badges
const IUCN_META = {
  CR: { label: "Kritis (Critically Endangered)", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40", dot: "bg-red-500" },
  EN: { label: "Terancam Punah (Endangered)", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40", dot: "bg-orange-500" },
  VU: { label: "Rentan (Vulnerable)", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40", dot: "bg-amber-500" },
  LC: { label: "Risiko Rendah (Least Concern)", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40", dot: "bg-emerald-500" }
};

// Zona biogeografi badges
const ZONE_META = {
  Asiatis: { label: "Zona Asiatis (Paparan Sunda)", bg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40" },
  Wallacea: { label: "Zona Wallacea (Peralihan)", bg: "bg-amber-950/60 text-amber-300 border-amber-500/40" },
  Australis: { label: "Zona Australis (Paparan Sahul)", bg: "bg-sky-950/60 text-sky-300 border-sky-500/40" }
};

// SVG Siluet Satwa Lokal sebagai fallback gambar resmi
const FALLBACK_FAUNA_SVG = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="#09131d"/>
  <circle cx="300" cy="180" r="70" fill="#064e3b" opacity="0.3"/>
  <path d="M260 220 C270 170 330 170 340 220 Z" fill="#10b981"/>
  <circle cx="300" cy="150" r="28" fill="#10b981"/>
  <text x="300" y="270" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="15" font-weight="600">Dokumentasi Satwa Nusantara</text>
  <text x="300" y="295" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12">Ilustrasi Siluet Konservasi</text>
</svg>
`);

export default function FaunaDrawer({
  fauna,
  onClose,
  onFetchGbif,
  gbifLoading,
  gbifCount,
  showGbifLayer,
  onToggleGbifLayer
}) {
  const [activeTab, setActiveTab] = useState("overview"); // overview | biogeography | media | conservation | taxonomy
  const [mobileSnap, setMobileSnap] = useState("half"); // collapsed | half | full
  const [imgSrc, setImgSrc] = useState(null);

  if (!fauna) return null;

  const iucn = IUCN_META[fauna.iucnStatus] || IUCN_META.LC;
  const zoneInfo = ZONE_META[fauna.biogeographicZone] || ZONE_META.Asiatis;
  const displayImage = imgSrc || fauna.displayImage || fauna.imageUrl || FALLBACK_FAUNA_SVG;

  const handleImageError = () => {
    setImgSrc(FALLBACK_FAUNA_SVG);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP DRAWER: Floating Slide-over Panel (Non-intrusive)                 */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-96 xl:w-[420px] z-50 flex-col bg-slate-900/95 backdrop-blur-2xl border-l border-emerald-500/20 shadow-2xl text-slate-200 transition-transform duration-300">
        {/* Header Drawer */}
        <div className="p-5 pb-3 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${iucn.bg} ${iucn.text} ${iucn.border}`}>
                <span className={`w-2 h-2 rounded-full ${iucn.dot}`}></span>
                IUCN: {fauna.iucnStatus}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {fauna.region || fauna.island}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${zoneInfo.bg}`}>
                {fauna.biogeographicZone}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">{fauna.name}</h2>
            <p className="text-xs italic text-emerald-400 font-serif mt-0.5">{fauna.scientificName}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Panel Detail"
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex px-3 py-2 gap-1 border-b border-slate-800 bg-slate-950/50 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Ringkasan", icon: BookOpen },
            { id: "media", label: "Media & Berita", icon: Newspaper },
            { id: "biogeography", label: "Biogeografi", icon: Compass },
            { id: "conservation", label: "Konservasi", icon: ShieldAlert },
            { id: "taxonomy", label: "Taksonomi", icon: Dna }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Buka tab ${tab.label}`}
                className={`min-h-11 flex items-center justify-center gap-1.5 px-2.5 rounded-lg font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Gambar dengan Fallback SVG Otomatis */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 aspect-video bg-slate-950">
            <img
              src={displayImage}
              alt={fauna.name}
              onError={handleImageError}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-200 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-48">{fauna.locationName}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded">
                {fauna.coordinates[0].toFixed(2)}°, {fauna.coordinates[1].toFixed(2)}°
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-3.5 text-xs">
              {/* Deskripsi Ensiklopedis Lugas */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 leading-relaxed text-slate-300">
                <p>{fauna.summary}</p>
              </div>

              {/* Ekstrak Resmi Wikipedia Indonesia */}
              {fauna.wikiExtract && (
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 leading-relaxed text-slate-300">
                  <div className="flex items-center gap-2 mb-1.5 font-semibold text-emerald-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ensiklopedia Wikipedia Indonesia</span>
                  </div>
                  <p>{fauna.wikiExtract}</p>
                  {fauna.wikiPageUrl && (
                    <a
                      href={fauna.wikiPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                    >
                      Baca artikel penuh di Wikipedia
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Grid Status & Tren Populasi */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block mb-0.5">Estimasi Populasi</span>
                  <span className="font-bold text-white text-xs">{fauna.populationEstimate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block mb-0.5">Tren Populasi</span>
                  <div className="flex items-center gap-1.5">
                    {fauna.populationTrend.toLowerCase().includes("menurun") ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : fauna.populationTrend.toLowerCase().includes("meningkat") ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-semibold text-slate-200">{fauna.populationTrend}</span>
                  </div>
                </div>
              </div>

              {/* Fakta Unik Adaptasi */}
              {fauna.funFacts && fauna.funFacts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2 font-bold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fakta Adaptasi & Ekologi</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {fauna.funFacts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Integrasi GBIF */}
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Observasi Lapangan GBIF</span>
                  </div>
                  {gbifCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      {gbifCount} titik aktif
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mb-2.5">
                  Tampilkan catatan titik kemunculan spesimen dari Global Biodiversity Information Facility.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFetchGbif(fauna.scientificName)}
                    disabled={gbifLoading}
                    className="min-h-11 flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {gbifLoading ? "Mengambil Data GBIF..." : "Query Titik Riil GBIF"}
                  </button>
                  {gbifCount > 0 && (
                    <button
                      onClick={onToggleGbifLayer}
                      className={`min-h-11 px-3 py-2 rounded-lg font-semibold border transition-all ${
                        showGbifLayer
                          ? "bg-sky-400 text-slate-950 border-sky-300"
                          : "bg-slate-800 text-sky-300 border-sky-500/40"
                      }`}
                    >
                      {showGbifLayer ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & DOKUMEN KONSERVASI LEGAL */}
          {activeTab === "media" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-300">
                <p className="text-slate-400 mb-2">
                  Koleksi artikel berita konservasi, rilis pers kementerian, dan laporan ilmiah terbuka resmi:
                </p>
                {fauna.mediaReferences && fauna.mediaReferences.length > 0 ? (
                  <div className="space-y-2.5">
                    {fauna.mediaReferences.map((ref, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                          <span>{ref.publisher}</span>
                          <span className="text-slate-500">{ref.date}</span>
                        </div>
                        <h4 className="font-bold text-white text-xs leading-snug">{ref.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{ref.excerpt}</p>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-11 inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 pt-1"
                        >
                          Buka Sumber Berita Resmi
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Referensi media sedang diperbarui oleh balai konservasi.</p>
                )}
              </div>

              {/* Tautan Luar Terverifikasi */}
              {fauna.externalLinks && fauna.externalLinks.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <span className="font-bold text-white block">Tautan Portal Konservasi:</span>
                  <div className="flex flex-col gap-1.5">
                    {fauna.externalLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-11 p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BIOGEOGRAPHY */}
          {activeTab === "biogeography" && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-emerald-500/20 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Compass className="w-4 h-4" />
                  <span>Karakteristik Zona Biogeografi: {fauna.biogeographicZone}</span>
                </div>
                <p>{fauna.biogeography}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                <span className="font-bold text-white block">Wilayah Sebaran Spasial:</span>
                <p className="leading-relaxed">{fauna.distributionDescription}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Titik Koordinat Jelajah:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {fauna.migrationWaypoints ? fauna.migrationWaypoints.length : 0} Waypoints
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: CONSERVATION */}
          {activeTab === "conservation" && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2 font-bold text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Ancaman Utama Kelangsungan Hidup</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {fauna.threats.map((threat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Program Konservasi & Mitigasi</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {fauna.conservationAction}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: TAXONOMY */}
          {activeTab === "taxonomy" && (
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 divide-y divide-slate-800 text-xs">
              {Object.entries(fauna.taxonomy || {}).map(([rank, val]) => (
                <div key={rank} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                  <span className="text-slate-400 capitalize">{rank}</span>
                  <span className="font-serif italic font-semibold text-emerald-300">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER: Adaptive Bottom Sheet with Touch Targets >= 44x44px       */}
      {/* ========================================================================= */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-emerald-500/30 rounded-t-3xl shadow-2xl text-slate-200 transition-all duration-300 ${
          mobileSnap === "collapsed"
            ? "h-20"
            : mobileSnap === "half"
            ? "h-[55vh]"
            : "h-[90vh]"
        }`}
      >
        {/* Handle Bar & Quick Controls */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setMobileSnap(mobileSnap === "collapsed" ? "half" : mobileSnap === "half" ? "full" : "collapsed")}
              className="cursor-pointer flex-1 flex flex-col items-center py-1"
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileSnap(mobileSnap === "full" ? "half" : "full")}
                aria-label="Ubah Ukuran Panel Bawah"
                className="w-11 h-11 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                {mobileSnap === "full" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                aria-label="Tutup Panel Bawah"
                className="w-11 h-11 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{fauna.name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${iucn.bg} ${iucn.text} ${iucn.border}`}>
                  {fauna.iucnStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic font-serif">{fauna.scientificName} &bull; {fauna.region || fauna.island}</p>
            </div>
          </div>
        </div>

        {/* Mobile Content Area */}
        {mobileSnap !== "collapsed" && (
          <div className="p-4 overflow-y-auto h-[calc(100%-85px)] space-y-3.5 text-xs">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
              <img
                src={displayImage}
                alt={fauna.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700">
              {fauna.summary}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Populasi</span>
                <span className="font-bold text-white">{fauna.populationEstimate}</span>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Zona</span>
                <span className="font-bold text-emerald-400">{fauna.biogeographicZone}</span>
              </div>
            </div>

            {/* Media Referensi Ringkas di Mobile */}
            {fauna.mediaReferences && fauna.mediaReferences.length > 0 && (
              <div className="p-3 bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-700">
                <span className="font-bold text-white block">Referensi Berita / KSDAE:</span>
                <p className="text-slate-300">{fauna.mediaReferences[0].title}</p>
                <a
                  href={fauna.mediaReferences[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 inline-flex items-center gap-1.5 text-emerald-400 font-semibold underline underline-offset-4"
                >
                  Buka Dokumen Resmi ({fauna.mediaReferences[0].publisher})
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
