/**
 * RealtorOS Morocco — Market Explorer Store & Spatial Engine
 * Manages geocoded properties in Tangier, strategic geographical zones,
 * spatial point-in-polygon queries, geometry validation, analytics, and map workspace settings.
 */

import * as turf from "@turf/turf";
import {
  MapProperty,
  StrategicZone,
  ZoneCategory,
  ZonePriority,
  MapStyleOption,
  MapWorkspaceSettings,
  LocationSearchResult,
  PropertyLocationHistory,
  PropertyFilterState,
  DEFAULT_PROPERTY_FILTER_STATE,
  ZoneAnalytics,
} from "./map-types";
import { DEMO_PROPERTIES } from "@/lib/data/demo-data";

// ─────────────────────────────────────────────────────────────────────────────
// MAP STYLES CONFIGURATION (VECTOR & SATELLITE TILE PROVIDERS)
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: "voyager",
    name: "Standard Urbain (Libre / Voyager)",
    description: "Rendu cartographique équilibré, clair et détaillé pour la navigation immobilière à Tanger.",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
    thumbnailUrl: "https://basemaps.cartocdn.com/rastertiles/voyager/13/4198/3120.png",
  },
  {
    id: "positron",
    name: "Minimaliste Clair (Positron)",
    description: "Design épuré style SaaS mettant en valeur les polygones et marqueurs de prix.",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
    thumbnailUrl: "https://basemaps.cartocdn.com/rastertiles/light_all/13/4198/3120.png",
  },
  {
    id: "dark",
    name: "Mode Sombre (Dark Matter)",
    description: "Interface nocturne élégante avec contraste accentué pour les zones de prospection.",
    styleUrl: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    thumbnailUrl: "https://basemaps.cartocdn.com/rastertiles/dark_all/13/4198/3120.png",
  },
  {
    id: "satellite",
    name: "Vue Satellite / Aérienne (ESRI)",
    description: "Imagerie satellite haute résolution pour apprécier l'environnement paysager et la topographie.",
    styleUrl: "/styles/satellite.json",
    thumbnailUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3120/4198",
  },
];

export const DEFAULT_WORKSPACE_SETTINGS: MapWorkspaceSettings = {
  center: [-5.813, 35.759], // Tangier center
  zoom: 12.8,
  pitch: 30, // 3D tilt
  bearing: -10, // Angled perspective towards Strait of Gibraltar
  mapStyle: "voyager",
  layers: {
    properties: true,
    zones: true,
    priceBadges: true,
    labels: true,
    buildings3d: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL TANGIER PROPERTIES WITH PRECISE COORDINATES & PHOTOS
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_MAP_PROPERTIES: MapProperty[] = [
  {
    ...DEMO_PROPERTIES[0], // p-1 Malabata
    latitude: 35.7765,
    longitude: -5.782,
    locationPrecision: "exact",
    standing: "haut_standing",
    ownerPhone: "+212 6 61 23 45 67",
    ownerEmail: "amine.tazi@gmail.com",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    ...DEMO_PROPERTIES[1], // p-2 Marshan
    latitude: 35.7925,
    longitude: -5.8205,
    locationPrecision: "exact",
    standing: "luxe",
    ownerPhone: "+212 6 63 45 67 89",
    ownerEmail: "fatima.alouani@yahoo.fr",
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    ...DEMO_PROPERTIES[2], // p-3 Centre-ville
    latitude: 35.7801,
    longitude: -5.8124,
    locationPrecision: "exact",
    standing: "moyen_standing",
    ownerPhone: "+212 6 65 12 34 56",
    ownerEmail: "karim.drissi@gmail.com",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    ...DEMO_PROPERTIES[3], // p-4 California
    latitude: 35.7712,
    longitude: -5.834,
    locationPrecision: "exact",
    standing: "luxe",
    ownerPhone: "+212 6 67 89 01 23",
    ownerEmail: "nabil.chraibi@outlook.com",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    ...DEMO_PROPERTIES[4], // p-5 Iberia
    latitude: 35.778,
    longitude: -5.822,
    locationPrecision: "exact",
    standing: "haut_standing",
    ownerPhone: "+212 6 61 98 76 54",
    ownerEmail: "laila.elamrani@gmail.com",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "p-6",
    reference: "TNG-2026-063",
    title: "Demeure d'exception dans la pinède — Vieille Montagne",
    propertyType: "VILLA",
    transactionType: ["SALE"],
    price: 9500000,
    neighborhood: "Vieille Montagne",
    city: "Tanger",
    address: "Route de la Vieille Montagne / Jbel Kbir",
    surface: 650,
    bedrooms: 6,
    bathrooms: 6,
    furnished: "unfurnished",
    condition: "new",
    standing: "luxe",
    legalStatus: "TITLED",
    titreFoncier: "TF 302811/06",
    status: "ACTIVE",
    ownerName: "Amine Benjelloun",
    ownerId: "c-1",
    ownerPhone: "+212 6 61 77 88 99",
    ownerEmail: "a.benjelloun@detroit.ma",
    mandateType: "exclusive",
    mandateExpiry: "2027-06-30",
    daysOnMarket: 12,
    description: "Propriété de très grand luxe avec parc boisé de 3 200 m², piscine à débordement et vue imprenable sur le Détroit.",
    latitude: 35.7872,
    longitude: -5.8525,
    locationPrecision: "exact",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "p-7",
    reference: "TNG-2026-071",
    title: "Terrain d'angle constructible vue mer — Achakkar / Cap Spartel",
    propertyType: "LAND",
    transactionType: ["SALE"],
    price: 3600000,
    neighborhood: "Achakkar",
    city: "Tanger",
    address: "Plateau d'Achakkar, proche Grottes d'Hercule",
    surface: 1200,
    bedrooms: 0,
    bathrooms: 0,
    furnished: "unfurnished",
    condition: "new",
    standing: "haut_standing",
    legalStatus: "TITLED",
    titreFoncier: "TF 441092/06",
    status: "ACTIVE",
    ownerName: "Société Foncière Détroit",
    ownerId: "c-9",
    ownerPhone: "+212 5 39 33 22 11",
    ownerEmail: "contact@fonciere-detroit.ma",
    mandateType: "exclusive",
    mandateExpiry: "2027-04-15",
    daysOnMarket: 22,
    description: "Parcelle viabilisée zonage villa R+1 avec permis de construire autorisé. Vue panoramique sur l'Océan Atlantique.",
    latitude: 35.7625,
    longitude: -5.932,
    locationPrecision: "exact",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "p-8",
    reference: "TNG-2026-084",
    title: "Appartement neuf 3 chambres dans résidence fermée — Tanja Balia",
    propertyType: "APARTMENT",
    transactionType: ["SALE"],
    price: 1150000,
    neighborhood: "Tanja Balia",
    city: "Tanger",
    address: "Résidence Al Majd, Tanja Balia",
    surface: 98,
    bedrooms: 3,
    bathrooms: 2,
    floor: 2,
    furnished: "unfurnished",
    condition: "new",
    standing: "moyen_standing",
    legalStatus: "TITLED",
    titreFoncier: "TF 510884/06",
    status: "ACTIVE",
    ownerName: "Tanger Marina Bay SARL",
    ownerId: "c-5",
    ownerPhone: "+212 6 62 11 44 55",
    ownerEmail: "contact@marinabay.ma",
    mandateType: "simple",
    mandateExpiry: "2027-01-31",
    daysOnMarket: 35,
    description: "Excellent rapport qualité/prix dans un quartier en plein essor. Idéal premier achat ou investissement locatif rentable.",
    latitude: 35.7582,
    longitude: -5.7592,
    locationPrecision: "exact",
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STRATEGIC ZONES (REAL TANGIER SECTORS)
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_STRATEGIC_ZONES: StrategicZone[] = [
  {
    id: "zone-marshan-prestige",
    name: "Secteur Historique & Prestige — Marshan",
    category: "luxury_villas",
    priority: "critical",
    description: "Quartier emblématique dominant le Détroit de Gibraltar, prisé pour ses propriétés historiques et sa tranquillité.",
    color: "#9333ea", // Purple
    isVisible: true,
    tags: ["Prestige", "Villas", "Vue Détroit", "Conservation"],
    notes: "Mandats à fortes commissions. Cible acquéreurs MRE et diplomates.",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-5.828, 35.796],
          [-5.814, 35.795],
          [-5.815, 35.789],
          [-5.826, 35.788],
          [-5.828, 35.796],
        ],
      ],
    },
    areaM2: 520000,
    perimeterM: 2950,
    propertyIds: ["p-2"],
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-11-01T14:30:00Z",
  },
  {
    id: "zone-malabata-bay",
    name: "Front de Mer & Baie — Malabata",
    category: "haut_standing",
    priority: "high",
    description: "Corniche maritime et résidences de standing avec vue directe sur la baie de Tanger.",
    color: "#2563eb", // Deep blue
    isVisible: true,
    tags: ["Bord de mer", "Appartements standing", "Terrasses vue mer"],
    notes: "Forte liquidité en revente et excellente rentabilité locative estivale.",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-5.792, 35.782],
          [-5.772, 35.778],
          [-5.775, 35.769],
          [-5.795, 35.773],
          [-5.792, 35.782],
        ],
      ],
    },
    areaM2: 780000,
    perimeterM: 3600,
    propertyIds: ["p-1"],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
  },
  {
    id: "zone-iberia-business",
    name: "Pôle Tertiaire & Libéral — Iberia",
    category: "commercial_opportunities",
    priority: "medium",
    description: "Cœur économique et consulaire de Tanger, idéal pour bureaux, professions libérales et commerces de standing.",
    color: "#ea580c", // Amber / orange
    isVisible: true,
    tags: ["Bureaux", "Cabinets", "Plateaux professionnels", "Commerces"],
    notes: "Demande locative constante pour notaires, architectes et sociétés de services.",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-5.829, 35.783],
          [-5.818, 35.782],
          [-5.819, 35.774],
          [-5.828, 35.775],
          [-5.829, 35.783],
        ],
      ],
    },
    areaM2: 410000,
    perimeterM: 2600,
    propertyIds: ["p-5"],
    createdAt: "2026-10-05T09:30:00Z",
    updatedAt: "2026-11-03T10:15:00Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TANGIER GAZETTEER & VERIFIED SEARCH INDEX
// ─────────────────────────────────────────────────────────────────────────────

export const TANGIER_LOCATION_INDEX: LocationSearchResult[] = [
  {
    id: "loc-malabata",
    title: "Malabata",
    subtitle: "Baie de Tanger • Plage & Hôtels de luxe",
    type: "neighborhood",
    coordinates: [-5.782, 35.7765],
    zoom: 14.5,
  },
  {
    id: "loc-marshan",
    title: "Marshan",
    subtitle: "Palais Mendoub • Vue Détroit & Kasbah",
    type: "neighborhood",
    coordinates: [-5.8205, 35.7925],
    zoom: 14.8,
  },
  {
    id: "loc-centre-ville",
    title: "Centre-ville (Boulevard Pasteur)",
    subtitle: "Place de France • Banques, commerces & vie urbaine",
    type: "neighborhood",
    coordinates: [-5.8124, 35.7801],
    zoom: 15,
  },
  {
    id: "loc-california",
    title: "California (Colline des Oliviers)",
    subtitle: "Secteur résidentiel boisé • Villas & duplex de standing",
    type: "neighborhood",
    coordinates: [-5.834, 35.7712],
    zoom: 14.5,
  },
  {
    id: "loc-iberia",
    title: "Iberia (Place Koweït)",
    subtitle: "Consulats • Centre d'affaires & professions libérales",
    type: "neighborhood",
    coordinates: [-5.822, 35.778],
    zoom: 15,
  },
  {
    id: "loc-vieille-montagne",
    title: "Vieille Montagne (Jbel Kbir)",
    subtitle: "Palais royaux • Domaine le plus prestigieux de Tanger",
    type: "neighborhood",
    coordinates: [-5.852, 35.787],
    zoom: 13.8,
  },
  {
    id: "loc-cap-spartel",
    title: "Cap Spartel & Achakkar",
    subtitle: "Côte atlantique • Grottes d'Hercule & parcelles vue mer",
    type: "neighborhood",
    coordinates: [-5.932, 35.762],
    zoom: 13.5,
  },
  {
    id: "loc-tanja-balia",
    title: "Tanja Balia",
    subtitle: "Zone résidentielle d'avenir • Forte rentabilité locative",
    type: "neighborhood",
    coordinates: [-5.759, 35.758],
    zoom: 14,
  },
  {
    id: "loc-tgv",
    title: "Tanger City Center (Gare TGV)",
    subtitle: "Mall commercial • Quartier d'affaires moderne",
    type: "landmark",
    coordinates: [-5.793, 35.7715],
    zoom: 15.2,
  },
  {
    id: "loc-boubana",
    title: "Boubana (Royal Golf)",
    subtitle: "Parcours 18 trous • Résidences calmes et verdoyantes",
    type: "neighborhood",
    coordinates: [-5.839, 35.761],
    zoom: 14.2,
  },
  {
    id: "loc-kasbah",
    title: "La Kasbah & Médina",
    subtitle: "Cœur historique • Riads authentiques et terrasses panoramiques",
    type: "neighborhood",
    coordinates: [-5.8115, 35.789],
    zoom: 15.5,
  },
  {
    id: "loc-gzenaya",
    title: "Gzenaya (Tanger Free Zone)",
    subtitle: "Pôle logistique & aéroport Tanger Ibn Battouta",
    type: "neighborhood",
    coordinates: [-5.908, 35.715],
    zoom: 13.8,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SPATIAL ALGORITHMS & VALIDATION (TURF.JS ENGINE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a polygon geometry:
 * - Checks coordinate count (minimum 3 distinct vertices).
 * - Detects self-intersections using turf.kinks.
 * - Validates coordinate bounds.
 */
export function validatePolygonGeometry(geometry: GeoJSON.Polygon): { valid: boolean; error?: string } {
  try {
    if (!geometry || !geometry.coordinates || !geometry.coordinates[0]) {
      return { valid: false, error: "Géométrie vide ou invalide." };
    }

    const ring = geometry.coordinates[0];
    if (ring.length < 4) {
      return { valid: false, error: "Un polygone doit contenir au moins 3 sommets distincts." };
    }

    // Coordinate range check
    for (const pt of ring) {
      const [lng, lat] = pt;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return { valid: false, error: `Coordonnées hors limites géographiques : [${lng}, ${lat}]` };
      }
    }

    // Self-intersection check using turf.kinks
    const polygonFeature = turf.polygon(geometry.coordinates);
    const kinks = turf.kinks(polygonFeature);
    if (kinks.features.length > 0) {
      return {
        valid: false,
        error: "Le polygone s'auto-intersecte (arêtes croisées). Veuillez ajuster les sommets.",
      };
    }

    const area = turf.area(polygonFeature);
    if (area <= 0) {
      return { valid: false, error: "La superficie du polygone doit être supérieure à zéro." };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Erreur de validation géométrique." };
  }
}

/**
 * Calculates geographical area in square meters using geodesic formula.
 */
export function calculateGeometryArea(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): number {
  try {
    return Math.round(turf.area(geometry));
  } catch (err) {
    console.error("Failed to compute geometry area:", err);
    return 0;
  }
}

/**
 * Calculates perimeter in meters of a polygon geometry.
 */
export function calculatePerimeterMeters(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): number {
  try {
    const line = turf.polygonToLine(geometry as any);
    if (line.type === "FeatureCollection") {
      let totalKm = 0;
      line.features.forEach((f) => {
        totalKm += turf.length(f, { units: "kilometers" });
      });
      return Math.round(totalKm * 1000);
    }
    return Math.round(turf.length(line, { units: "kilometers" }) * 1000);
  } catch {
    return 0;
  }
}

/**
 * Formats area into human readable string (m² or km²).
 */
export function formatArea(areaM2: number): string {
  if (areaM2 >= 1000000) {
    return `${(areaM2 / 1000000).toFixed(2)} km²`;
  }
  return `${Math.round(areaM2).toLocaleString("fr-MA")} m²`;
}

/**
 * Formats distance into human readable string (m or km).
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters).toLocaleString("fr-MA")} m`;
}

/**
 * Identifies which properties fall inside a strategic zone polygon.
 */
export function findPropertiesInPolygon(
  properties: MapProperty[],
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): MapProperty[] {
  try {
    return properties.filter((prop) => {
      if (prop.latitude === undefined || prop.longitude === undefined) return false;
      const point = turf.point([prop.longitude, prop.latitude]);
      return turf.booleanPointInPolygon(point, geometry);
    });
  } catch (err) {
    console.error("Point-in-polygon calculation error:", err);
    return [];
  }
}

/**
 * Calculates comprehensive spatial analytics for a strategic zone.
 */
export function calculateZoneAnalytics(zone: StrategicZone, properties: MapProperty[]): ZoneAnalytics {
  const areaM2 = zone.areaM2 || calculateGeometryArea(zone.geometry);
  const perimeterM = zone.perimeterM || calculatePerimeterMeters(zone.geometry);
  const includedProps = findPropertiesInPolygon(properties, zone.geometry);

  const exactCount = includedProps.filter((p) => p.locationPrecision === "exact").length;
  const approxCount = includedProps.length - exactCount;

  const availableCount = includedProps.filter((p) => p.status === "ACTIVE" || p.status === "NEW").length;
  const negotiationCount = includedProps.filter((p) => p.status === "UNDER_NEGOTIATION" || p.status === "RESERVED").length;
  const soldOrRentedCount = includedProps.filter((p) => p.status === "SOLD" || p.status === "RENTED").length;

  let totalAskingValueMAD = 0;
  let totalSurfaceM2 = 0;

  const propertiesByType: Record<string, number> = {};
  const propertiesByTransaction: Record<string, number> = {};

  includedProps.forEach((p) => {
    totalAskingValueMAD += p.price || 0;
    if (p.surface) totalSurfaceM2 += p.surface;

    const pType = p.propertyType || "AUTRE";
    propertiesByType[pType] = (propertiesByType[pType] || 0) + 1;

    p.transactionType.forEach((t) => {
      propertiesByTransaction[t] = (propertiesByTransaction[t] || 0) + 1;
    });
  });

  const averagePricePerM2MAD =
    totalSurfaceM2 > 0 ? Math.round(totalAskingValueMAD / totalSurfaceM2) : 0;

  return {
    areaM2,
    perimeterM,
    totalProperties: includedProps.length,
    exactPropertiesCount: exactCount,
    approximatePropertiesCount: approxCount,
    availableCount,
    negotiationCount,
    soldOrRentedCount,
    totalAskingValueMAD,
    averagePricePerM2MAD,
    propertiesByType,
    propertiesByTransaction,
    propertiesList: includedProps,
  };
}

/**
 * Reverse geocodes a [lng, lat] point in Tangier to the closest known neighborhood/sector.
 */
export function reverseGeocodeTangier(
  lng: number,
  lat: number
): { neighborhood: string; address: string; postalCode: string } {
  const currentPt = turf.point([lng, lat]);
  let closestLocation = TANGIER_LOCATION_INDEX[0];
  let minDistance = Infinity;

  TANGIER_LOCATION_INDEX.forEach((loc) => {
    const locPt = turf.point(loc.coordinates);
    const d = turf.distance(currentPt, locPt, { units: "kilometers" });
    if (d < minDistance) {
      minDistance = d;
      closestLocation = loc;
    }
  });

  const neighborhood = closestLocation.title.split("(")[0].trim();
  const address = `Secteur ${neighborhood}, Tanger`;
  const postalCode = "90000";

  return { neighborhood, address, postalCode };
}

/**
 * Generates an approximated circle polygon given a center and radius in meters.
 */
export function createCirclePolygon(centerLngLat: [number, number], radiusMeters: number): GeoJSON.Polygon {
  const radiusKm = Math.max(radiusMeters / 1000, 0.01);
  const circleFeature = turf.circle(centerLngLat, radiusKm, { steps: 64, units: "kilometers" });
  return circleFeature.geometry as GeoJSON.Polygon;
}

/**
 * Generates a rectangle polygon given two opposite corner coordinates.
 */
export function createRectanglePolygon(corner1: [number, number], corner2: [number, number]): GeoJSON.Polygon {
  const minLng = Math.min(corner1[0], corner2[0]);
  const maxLng = Math.max(corner1[0], corner2[0]);
  const minLat = Math.min(corner1[1], corner2[1]);
  const maxLat = Math.max(corner1[1], corner2[1]);

  return {
    type: "Polygon",
    coordinates: [
      [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ],
    ],
  };
}

/**
 * Synchronizes property IDs inside all strategic zones.
 */
export function synchronizeZonesWithProperties(
  zones: StrategicZone[],
  properties: MapProperty[]
): StrategicZone[] {
  return zones.map((zone) => {
    const insideProps = findPropertiesInPolygon(properties, zone.geometry);
    const areaM2 = calculateGeometryArea(zone.geometry);
    const perimeterM = calculatePerimeterMeters(zone.geometry);
    return {
      ...zone,
      areaM2,
      perimeterM,
      propertyIds: insideProps.map((p) => p.id),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Determines if a property matches the given property filters.
 */
export function matchesPropertyFilters(
  prop: MapProperty,
  filters: PropertyFilterState,
  zones: StrategicZone[]
): boolean {
  const conditions: boolean[] = [];

  // 1. Property Type
  if (filters.propertyTypes.length > 0) {
    conditions.push(filters.propertyTypes.includes(prop.propertyType));
  }

  // 2. Transaction Type
  if (filters.transactionType !== "ALL") {
    if (filters.transactionType === "SALE") {
      conditions.push(prop.transactionType.includes("SALE"));
    } else if (filters.transactionType === "RENTAL") {
      conditions.push(prop.transactionType.includes("RENTAL"));
    } else if (filters.transactionType === "BOTH") {
      conditions.push(prop.transactionType.includes("SALE") && prop.transactionType.includes("RENTAL"));
    }
  }

  // 3. Price Range
  if (filters.minPrice !== null) {
    conditions.push(prop.price >= filters.minPrice);
  }
  if (filters.maxPrice !== null) {
    conditions.push(prop.price <= filters.maxPrice);
  }

  // 4. Surface Range
  if (filters.minSurface !== null) {
    conditions.push((prop.surface || 0) >= filters.minSurface);
  }
  if (filters.maxSurface !== null) {
    conditions.push((prop.surface || 0) <= filters.maxSurface);
  }

  // 5. Status
  if (filters.statuses.length > 0) {
    conditions.push(filters.statuses.includes(prop.status));
  }

  // 6. Neighborhood
  if (filters.neighborhood) {
    conditions.push(
      prop.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase()) ||
        prop.address.toLowerCase().includes(filters.neighborhood.toLowerCase())
    );
  }

  // 7. Strategic Zone Containment
  if (filters.strategicZoneId) {
    const targetZone = zones.find((z) => z.id === filters.strategicZoneId);
    if (targetZone && prop.latitude !== undefined && prop.longitude !== undefined) {
      const pt = turf.point([prop.longitude, prop.latitude]);
      const inside = turf.booleanPointInPolygon(pt, targetZone.geometry);
      conditions.push(inside);
    } else {
      conditions.push(false);
    }
  }

  // 8. Legal Status
  if (filters.legalStatuses.length > 0) {
    conditions.push(filters.legalStatuses.includes(prop.legalStatus));
  }

  if (conditions.length === 0) return true;

  if (filters.logicalOperator === "OR") {
    return conditions.some(Boolean);
  }

  return conditions.every(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  PROPERTIES: "realtoros_map_properties_v2",
  ZONES: "realtoros_strategic_zones_v2",
  SETTINGS: "realtoros_map_settings_v2",
  LOCATION_HISTORY: "realtoros_location_history_v2",
  FILTER_PRESETS: "realtoros_filter_presets_v2",
};

export function loadSavedProperties(): MapProperty[] {
  if (typeof window === "undefined") return INITIAL_MAP_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!raw) return INITIAL_MAP_PROPERTIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MAP_PROPERTIES;
  } catch {
    return INITIAL_MAP_PROPERTIES;
  }
}

export function savePropertiesToStorage(props: MapProperty[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(props));
  } catch (err) {
    console.error("Failed to save properties to storage:", err);
  }
}

export function loadSavedZones(): StrategicZone[] {
  if (typeof window === "undefined") return INITIAL_STRATEGIC_ZONES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ZONES);
    if (!raw) return INITIAL_STRATEGIC_ZONES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STRATEGIC_ZONES;
  } catch {
    return INITIAL_STRATEGIC_ZONES;
  }
}

export function saveZonesToStorage(zones: StrategicZone[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  } catch (err) {
    console.error("Failed to save strategic zones to storage:", err);
  }
}

export function loadSavedWorkspaceSettings(): MapWorkspaceSettings {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_WORKSPACE_SETTINGS;
    return { ...DEFAULT_WORKSPACE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

export function saveWorkspaceSettingsToStorage(settings: MapWorkspaceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save workspace settings to storage:", err);
  }
}

export function loadLocationHistory(): PropertyLocationHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordLocationChange(entry: PropertyLocationHistory): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadLocationHistory();
    const updated = [entry, ...current].slice(0, 100); // keep last 100 history items
    localStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to record location change:", err);
  }
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filter: PropertyFilterState;
}

export function loadSavedFilterPresets(): SavedFilterPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILTER_PRESETS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFilterPreset(name: string, filter: PropertyFilterState): SavedFilterPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadSavedFilterPresets();
    const newPreset: SavedFilterPreset = {
      id: `filter-${Date.now()}`,
      name,
      filter,
    };
    const updated = [newPreset, ...current];
    localStorage.setItem(STORAGE_KEYS.FILTER_PRESETS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteFilterPreset(presetId: string): SavedFilterPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadSavedFilterPresets();
    const updated = current.filter((p) => p.id !== presetId);
    localStorage.setItem(STORAGE_KEYS.FILTER_PRESETS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
