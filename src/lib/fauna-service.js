import faunaSeed from "@/data/fauna-seed.json";

/**
 * Service API Pusantara Fauna
 * Mengintegrasikan Curated Master Seed, Wikipedia ID REST API, dan GBIF API
 */

const WIKIPEDIA_API_BASE = "https://id.wikipedia.org/api/rest_v1/page/summary";
const GBIF_API_BASE = "https://api.gbif.org/v1/occurrence/search";

/**
 * Mengambil ringkasan resmi dari Wikipedia Bahasa Indonesia
 * @param {string} wikiTitle 
 * @returns {Promise<{extract: string, thumbnail: string, pageUrl: string} | null>}
 */
export async function fetchWikipediaSummary(wikiTitle) {
  if (!wikiTitle) return null;
  try {
    const encodedTitle = encodeURIComponent(wikiTitle.trim());
    const response = await fetch(`${WIKIPEDIA_API_BASE}/${encodedTitle}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "PusantaraFauna/1.0 (Educational Non-Profit Conservation Portal; contact@pusantarafauna.id)"
      },
      next: { revalidate: 86400 } // Cache 24 jam di Next.js
    });

    if (!response.ok) return null;
    const data = await response.json();

    return {
      extract: data.extract || "",
      description: data.description || "",
      thumbnail: data.thumbnail?.source || data.originalimage?.source || null,
      pageUrl: data.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodedTitle}`
    };
  } catch (error) {
    console.warn(`[FaunaService] Gagal fetch Wikipedia untuk "${wikiTitle}":`, error.message);
    return null;
  }
}

/**
 * Mengambil titik kemunculan spasial empiris dari GBIF API
 * @param {string} scientificName 
 * @param {number} limit 
 * @returns {Promise<Array<{lat: number, lng: number, year: number, locality: string, basisOfRecord: string}>>}
 */
export async function fetchGbifOccurrences(scientificName, limit = 25) {
  if (!scientificName) return [];
  try {
    const queryParams = new URLSearchParams({
      country: "ID", // Indonesia
      scientificName: scientificName.trim(),
      hasCoordinate: "true",
      limit: String(limit)
    });

    const response = await fetch(`${GBIF_API_BASE}?${queryParams.toString()}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 43200 } // Cache 12 jam
    });

    if (!response.ok) return [];
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results
      .filter((rec) => typeof rec.decimalLatitude === "number" && typeof rec.decimalLongitude === "number")
      .map((rec) => ({
        lat: rec.decimalLatitude,
        lng: rec.decimalLongitude,
        year: rec.year || null,
        locality: rec.locality || rec.stateProvince || "Indonesia",
        basisOfRecord: rec.basisOfRecord || "OBSERVATION",
        recordedBy: rec.recordedBy || null
      }));
  } catch (error) {
    console.warn(`[FaunaService] Gagal fetch GBIF untuk "${scientificName}":`, error.message);
    return [];
  }
}

/**
 * Mengambil daftar master fauna yang diperkaya (hybrid curated seed + Wikipedia data)
 * @returns {Promise<Array<Object>>}
 */
export async function getAllFauna() {
  const baseSpecies = faunaSeed.species || [];

  // Diperkaya secara asinkron (fallback graceful bila offline / gagal)
  const enrichedList = await Promise.all(
    baseSpecies.map(async (item) => {
      let wikiData = null;
      if (item.wikiTitle) {
        wikiData = await fetchWikipediaSummary(item.wikiTitle);
      }

      return {
        ...item,
        wikiExtract: wikiData?.extract || null,
        wikiPageUrl: wikiData?.pageUrl || null,
        // Gunakan thumbnail Wikipedia jika tersedia dan gambar seed belum ada atau sebagai alternatif
        displayImage: wikiData?.thumbnail || item.imageUrl
      };
    })
  );

  return enrichedList;
}

/**
 * Mengambil informasi garis Wallace dan Weber
 */
export function getBiogeographicLines() {
  return faunaSeed.biogeographicLines || {};
}
