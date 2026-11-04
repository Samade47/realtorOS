import { NextRequest, NextResponse } from "next/server";
import { validatePolygonGeometry, calculateGeometryArea, calculatePerimeterMeters } from "@/lib/map/market-explorer-store";
import { StrategicZone } from "@/lib/map/map-types";

export async function GET() {
  try {
    // In production, fetch from PostgreSQL/Supabase.
    return NextResponse.json({ success: true, message: "Zones API available" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, geometry, color, priority, tags, notes } = body;

    if (!name || !geometry) {
      return NextResponse.json(
        { success: false, error: "Nom et géométrie de la zone requis." },
        { status: 400 }
      );
    }

    // Server-side geometry validation
    const validation = validatePolygonGeometry(geometry);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422 }
      );
    }

    // Server-side geodesic calculations
    const areaM2 = calculateGeometryArea(geometry);
    const perimeterM = calculatePerimeterMeters(geometry);

    const newZone: StrategicZone = {
      id: body.id || `zone-${Date.now()}`,
      name: name.trim(),
      category: category || "haut_standing",
      priority: priority || "medium",
      color: color || "#2563eb",
      geometry,
      areaM2,
      perimeterM,
      isVisible: true,
      tags: tags || [],
      notes: notes || "",
      propertyIds: body.propertyIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, zone: newZone }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, geometry } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de zone manquant." }, { status: 400 });
    }

    let areaM2 = body.areaM2;
    let perimeterM = body.perimeterM;

    if (geometry) {
      const validation = validatePolygonGeometry(geometry);
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 422 });
      }
      areaM2 = calculateGeometryArea(geometry);
      perimeterM = calculatePerimeterMeters(geometry);
    }

    return NextResponse.json({
      success: true,
      zone: {
        ...body,
        areaM2,
        perimeterM,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
