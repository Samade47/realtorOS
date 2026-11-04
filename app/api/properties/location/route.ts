import { NextRequest, NextResponse } from "next/server";
import * as turf from "@turf/turf";
import { PropertyLocationHistory } from "@/lib/map/map-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, propertyTitle, propertyRef, previousLatitude, previousLongitude, newLatitude, newLongitude, reason, changedBy } = body;

    if (!propertyId || newLatitude === undefined || newLongitude === undefined) {
      return NextResponse.json(
        { success: false, error: "Identifiant du bien et nouvelles coordonnées requis." },
        { status: 400 }
      );
    }

    if (newLatitude < -90 || newLatitude > 90 || newLongitude < -180 || newLongitude > 180) {
      return NextResponse.json(
        { success: false, error: "Coordonnées géographiques hors limites." },
        { status: 422 }
      );
    }

    // Calculate geodesic displacement distance in meters
    let distanceMeters = 0;
    if (previousLatitude !== undefined && previousLongitude !== undefined) {
      const from = turf.point([previousLongitude, previousLatitude]);
      const to = turf.point([newLongitude, newLatitude]);
      distanceMeters = Math.round(turf.distance(from, to, { units: "kilometers" }) * 1000);
    }

    const historyEntry: PropertyLocationHistory = {
      id: `loc-hist-${Date.now()}`,
      propertyId,
      propertyTitle: propertyTitle || "Bien immobilier",
      propertyRef: propertyRef || "TNG-REF",
      previousLatitude: previousLatitude ?? newLatitude,
      previousLongitude: previousLongitude ?? newLongitude,
      newLatitude,
      newLongitude,
      distanceMeters,
      reason: reason || "Correction manuelle de l'emplacement",
      changedBy: changedBy || "Agent RealtorOS",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      historyEntry,
      distanceMeters,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
