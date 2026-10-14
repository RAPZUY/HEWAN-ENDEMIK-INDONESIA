import { NextResponse } from "next/server";
import { getAllFauna, getBiogeographicLines } from "@/lib/fauna-service";

export async function GET() {
  try {
    const species = await getAllFauna();
    const biogeographicLines = getBiogeographicLines();
    return NextResponse.json({
      success: true,
      data: {
        species,
        biogeographicLines
      }
    });
  } catch (error) {
    console.error("API Fauna Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data fauna" },
      { status: 500 }
    );
  }
}
