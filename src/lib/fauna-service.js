import faunaSeed from "@/data/fauna-seed.json";

/**
 * Service API Nusantara Fauna
 * Mengintegrasikan Curated Master Seed, Wikipedia ID REST API, iNaturalist Public API, dan GBIF API.
 * Mendukung graceful degradation, batas timeout 3 detik, dan in-memory caching.
 */

const WIKIPEDIA_API_BASE = "https://id.wikipedia.org/api/rest_v1/page/summary";
const INATURALIST_API_BASE = "https://api.inaturalist.org/v1/taxa";
const GBIF_SPECIES_BASE = "https://api.gbif.org/v1/species/match";
const GBIF_OCCURRENCE_BASE = "https://api.gbif.org/v1/occurrence/search";

// In-Memory Cache untuk mencegah redundansi request
const memoryCache = new Map();

/**
 * Helper fetch dengan timeout 3 detik dan graceful error handling
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Mengambil ringkasan ensiklopedia resmi dari Wikipedia Bahasa Indonesia
 * @param {string} wikiTitle 
 * @returns {Promise<{extract: string, description: string, thumbnail: string, pageUrl: string} | null>}
 */
export async function fetchWikipediaSummary(wikiTitle) {
  if (!wikiTitle) return null;
  const cacheKey = `wiki:${wikiTitle}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const encodedTitle = encodeURIComponent(wikiTitle.trim());
    const response = await fetchWithTimeout(
      `${WIKIPEDIA_API_BASE}/${encodedTitle}`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "NusantaraFauna/2.0 (Conservation Education Portal; contact@nusantarafauna.id)"
        },
        next: { revalidate: 86400 } // Cache 24 jam Next.js
      },
      3000
    );

    if (!response || !response.ok) return null;
    const data = await response.json();

    const result = {
      extract: data.extract || "",
      description: data.description || "",
      thumbnail: data.thumbnail?.source || data.originalimage?.source || null,
      pageUrl: data.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodedTitle}`
    };

    memoryCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Mengambil metadata takson dan foto resolusi tinggi dari iNaturalist Public API
 * @param {string} scientificName
 * @returns {Promise<{defaultPhoto: string, observationCount: number, taxonId: number} | null>}
 */
export async function fetchInaturalistTaxon(scientificName) {
  if (!scientificName) return null;
  const cacheKey = `inat:${scientificName}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const query = encodeURIComponent(scientificName.trim());
    const response = await fetchWithTimeout(
      `${INATURALIST_API_BASE}?q=${query}&per_page=1`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 86400 }
      },
      3000
    );

    if (!response || !response.ok) return null;
    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;
    const taxon = data.results[0];

    const result = {
      defaultPhoto: taxon.default_photo?.medium_url || taxon.default_photo?.url || null,
      photoAttribution: taxon.default_photo?.attribution || null,
      observationCount: taxon.observations_count || 0,
      taxonId: taxon.id || null
    };

    memoryCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Mengambil verifikasi taksonomi dari GBIF API
 * @param {string} scientificName 
 * @returns {Promise<{usageKey: number, status: string, confidence: number} | null>}
 */
export async function fetchGbifSpeciesMatch(scientificName) {
  if (!scientificName) return null;
  const cacheKey = `gbif-match:${scientificName}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const query = encodeURIComponent(scientificName.trim());
    const response = await fetchWithTimeout(
      `${GBIF_SPECIES_BASE}?name=${query}&strict=true`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 86400 }
      },
      3000
    );

    if (!response || !response.ok) return null;
    const data = await response.json();

    const result = {
      usageKey: data.usageKey || null,
      status: data.status || "UNKNOWN",
      confidence: data.confidence || 0
    };

    memoryCache.set(cacheKey, result);
    return result;
  } catch {
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
  const cacheKey = `gbif-occ:${scientificName}:${limit}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  try {
    const queryParams = new URLSearchParams({
      country: "ID",
      scientificName: scientificName.trim(),
      hasCoordinate: "true",
      limit: String(limit)
    });

    const response = await fetchWithTimeout(
      `${GBIF_OCCURRENCE_BASE}?${queryParams.toString()}`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 43200 }
      },
      3000
    );

    if (!response || !response.ok) return [];
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    const occurrences = data.results
      .filter((rec) => typeof rec.decimalLatitude === "number" && typeof rec.decimalLongitude === "number")
      .map((rec) => ({
        lat: rec.decimalLatitude,
        lng: rec.decimalLongitude,
        year: rec.year || null,
        locality: rec.locality || rec.stateProvince || "Indonesia",
        basisOfRecord: rec.basisOfRecord || "OBSERVATION",
        recordedBy: rec.recordedBy || null
      }));

    memoryCache.set(cacheKey, occurrences);
    return occurrences;
  } catch {
    return [];
  }
}

/**
 * Mengambil daftar master fauna yang diperkaya (hybrid curated seed + Wikipedia data + iNaturalist)
 * Memiliki proteksi timeout dan fallback 100% aman
 * @returns {Promise<Array<Object>>}
 */
export async function getAllFauna() {
  const baseSpecies = faunaSeed.species || [];

  const enrichedList = await Promise.all(
    baseSpecies.map(async (item) => {
      let wikiData = null;
      let inatData = null;

      try {
        if (item.wikiTitle) {
          wikiData = await fetchWikipediaSummary(item.wikiTitle);
        }
      } catch {
        wikiData = null;
      }

      try {
        if (item.scientificName) {
          inatData = await fetchInaturalistTaxon(item.scientificName);
        }
      } catch {
        inatData = null;
      }

      return {
        ...item,
        wikiExtract: wikiData?.extract || null,
        wikiPageUrl: wikiData?.pageUrl || null,
        inaturalistPhoto: inatData?.defaultPhoto || null,
        inaturalistObsCount: inatData?.observationCount || null,
        displayImage: wikiData?.thumbnail || inatData?.defaultPhoto || item.imageUrl
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
