import { NextResponse } from "next/server";
import { fetchGbifOccurrences } from "@/lib/fauna-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scientificName = searchParams.get("scientificName");
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  if (!scientificName) {
    return NextResponse.json(
      { success: false, error: "Parameter scientificName diperlukan" },
      { status: 400 }
    );
  }

  try {
    const occurrences = await fetchGbifOccurrences(scientificName, limit);
    return NextResponse.json({
      success: true,
      scientificName,
      count: occurrences.length,
      occurrences
    });
  } catch (error) {
    console.error("API GBIF Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data GBIF" },
      { status: 500 }
    );
  }
}
