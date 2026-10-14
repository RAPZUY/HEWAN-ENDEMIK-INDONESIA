"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * Dynamic Import FaunaMap dengan ssr: false
 * Menjamin Leaflet hanya dieksekusi di lingkungan browser (Client Component)
 */
const DynamicFaunaMap = dynamic(() => import("./FaunaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-950 text-slate-200">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
        <div className="absolute text-2xl animate-pulse">🌏</div>
      </div>
      <p className="mt-4 font-semibold text-emerald-400 tracking-wide text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        Memuat Peta Geospasial Kepulauan Nusantara...
      </p>
      <p className="text-xs text-slate-500 mt-1">Menginisialisasi Tile OpenStreetMap & Layer Biogeografi</p>
    </div>
  ),
});

export default function MapWrapper(props) {
  return <DynamicFaunaMap {...props} />;
}
