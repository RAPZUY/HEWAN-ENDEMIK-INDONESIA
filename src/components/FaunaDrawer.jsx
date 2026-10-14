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
  ChevronUp,
  Maximize2,
  Minimize2,
  BookOpen
} from "lucide-react";

// Status IUCN Badges & Color Tokens
const IUCN_META = {
  CR: { label: "Kritis (Critically Endangered)", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-500" },
  EN: { label: "Genting (Endangered)", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-500" },
  VU: { label: "Rentan (Vulnerable)", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-500" },
  LC: { label: "Risiko Rendah (Least Concern)", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500" }
};

export default function FaunaDrawer({
  fauna,
  onClose,
  onFetchGbif,
  gbifLoading,
  gbifCount,
  showGbifLayer,
  onToggleGbifLayer
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "biogeography" | "conservation" | "taxonomy"
  const [mobileSnap, setMobileSnap] = useState("half"); // "collapsed" | "half" | "full"

  if (!fauna) return null;

  const iucn = IUCN_META[fauna.iucnStatus] || IUCN_META.LC;

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP DRAWER: Right Sliding Sidebar (440px wide)                        */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-[450px] z-[500] flex-col bg-slate-900/95 backdrop-blur-2xl border-l border-emerald-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.7)] text-slate-200 transition-transform duration-300">
        {/* Header Drawer */}
        <div className="p-5 pb-3 border-b border-slate-800/80 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${iucn.bg} ${iucn.text} ${iucn.border}`}>
                <span className={`w-2 h-2 rounded-full ${iucn.dot} animate-pulse`}></span>
                IUCN: {fauna.iucnStatus}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {fauna.island}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{fauna.name}</h2>
            <p className="text-xs italic text-emerald-400 font-serif mt-0.5">{fauna.scientificName}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Panel"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-4 py-2 gap-1 border-b border-slate-800/80 bg-slate-950/40 text-xs">
          {[
            { id: "overview", label: "Ringkasan", icon: BookOpen },
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Cover Image & Quick Location Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 group aspect-video bg-slate-950">
            <img
              src={fauna.displayImage || fauna.imageUrl}
              alt={fauna.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-200 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[240px]">{fauna.locationName}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {fauna.coordinates[0].toFixed(2)}°, {fauna.coordinates[1].toFixed(2)}°
              </span>
            </div>
          </div>

          {/* TAB CONTENT: 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Wikipedia Extract Box */}
              {fauna.wikiExtract && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-sm leading-relaxed text-slate-300">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ringkasan Ensiklopedia (Wikipedia ID)</span>
                  </div>
                  <p>{fauna.wikiExtract}</p>
                  {fauna.wikiPageUrl && (
                    <a
                      href={fauna.wikiPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                    >
                      Baca selengkapnya di Wikipedia Indonesia
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Bento Grid: Status Populasi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Estimasi Populasi</span>
                  <span className="text-base font-bold text-white block">{fauna.populationEstimate}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Tren Populasi</span>
                  <div className="flex items-center gap-1.5">
                    {fauna.populationTrend.toLowerCase().includes("menurun") ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : fauna.populationTrend.toLowerCase().includes("meningkat") ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-200">{fauna.populationTrend}</span>
                  </div>
                </div>
              </div>

              {/* Fakta Unik Bento */}
              {fauna.funFacts && fauna.funFacts.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Fakta Menarik & Keunikan Adaptasi</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {fauna.funFacts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trigger Live GBIF Integration */}
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Globe2 className="w-4 h-4" />
                    <span>Observasi Global (GBIF API)</span>
                  </div>
                  {gbifCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      {gbifCount} titik termuat
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Tampilkan catatan titik koordinat kemunculan riil berbasis spesimen/observasi lapangan dari Global Biodiversity Information Facility.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFetchGbif(fauna.scientificName)}
                    disabled={gbifLoading}
                    className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {gbifLoading ? "Mengambil Data GBIF..." : "Query Titik Riil GBIF"}
                  </button>
                  {gbifCount > 0 && (
                    <button
                      onClick={onToggleGbifLayer}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
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

          {/* TAB CONTENT: 2. BIOGEOGRAPHY */}
          {activeTab === "biogeography" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/20 leading-relaxed space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Dinamika Spasial & Garis Biogeografi</span>
                </div>
                <p>{fauna.biogeography}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="font-bold text-white text-xs block">Deskripsi Wilayah Persebaran:</span>
                <p className="leading-relaxed">{fauna.distributionDescription}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Titik Waypoint Jalur:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {fauna.migrationWaypoints ? fauna.migrationWaypoints.length : 0} Titik Koordinat
                </span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. CONSERVATION & THREATS */}
          {activeTab === "conservation" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Ancaman Utama Terhadap Kelangsungan Hidup</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {fauna.threats.map((threat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Aksi Nyata & Program Konservasi</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fauna.conservationAction}
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. TAXONOMY */}
          {activeTab === "taxonomy" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 divide-y divide-slate-800 text-xs">
                {Object.entries(fauna.taxonomy || {}).map(([rank, val]) => (
                  <div key={rank} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                    <span className="text-slate-400 capitalize">{rank}</span>
                    <span className="font-serif italic font-semibold text-emerald-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER: Adaptive Bottom Sheet with Snap Points                     */}
      {/* ========================================================================= */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[500] bg-slate-900/95 backdrop-blur-2xl border-t border-emerald-500/20 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] text-slate-200 transition-all duration-300 ${
          mobileSnap === "collapsed"
            ? "h-20"
            : mobileSnap === "half"
            ? "h-[55vh]"
            : "h-[90vh]"
        }`}
      >
        {/* Drag handle & header bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setMobileSnap(mobileSnap === "collapsed" ? "half" : mobileSnap === "half" ? "full" : "collapsed")}
              className="cursor-pointer flex-1 flex flex-col items-center"
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-2"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMobileSnap(mobileSnap === "full" ? "half" : "full")}
                aria-label="Toggle Ukuran Drawer"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                {mobileSnap === "full" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                aria-label="Tutup Panel"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{fauna.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${iucn.bg} ${iucn.text} ${iucn.border}`}>
                  {fauna.iucnStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">{fauna.scientificName} &bull; {fauna.island}</p>
            </div>
          </div>
        </div>

        {/* Mobile Content Area */}
        {mobileSnap !== "collapsed" && (
          <div className="p-4 overflow-y-auto h-[calc(100%-85px)] space-y-4 text-xs">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
              <img
                src={fauna.displayImage || fauna.imageUrl}
                alt={fauna.name}
                className="w-full h-full object-cover"
              />
            </div>

            {fauna.wikiExtract && (
              <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700">
                {fauna.wikiExtract}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Populasi</span>
                <span className="font-bold text-white text-xs">{fauna.populationEstimate}</span>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Tren</span>
                <span className="font-bold text-emerald-400 text-xs">{fauna.populationTrend}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 block">Habitat & Lokasi</span>
              <p className="text-slate-200">{fauna.locationName}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
