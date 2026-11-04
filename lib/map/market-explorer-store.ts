/**
 * RealtorOS Morocco — Market Explorer Store & Spatial Engine
 * Manages geocoded properties in Tangier, strategic geographical zones,
 * spatial point-in-polygon queries, and map workspace settings.
 */

import * as turf from "@turf/turf";
import {
  MapProperty,
  StrategicZone,
  ZoneCategory,
  MapStyleOption,
  MapWorkspaceSettings,
  LocationSearchResult,
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
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  // Additional rich properties across Tangier
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
    legalStatus: "TITLED",
    titreFoncier: "TF 302811/06",
    status: "ACTIVE",
    ownerName: "Amine Benjelloun",
    ownerId: "c-1",
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
    legalStatus: "TITLED",
    titreFoncier: "TF 441092/06",
    status: "ACTIVE",
    ownerName: "Société Foncière Détroit",
    ownerId: "c-9",
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
    legalStatus: "TITLED",
    titreFoncier: "TF 510884/06",
    status: "ACTIVE",
    ownerName: "Tanger Marina Bay SARL",
    ownerId: "c-5",
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
    propertyIds: ["p-2"],
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-11-01T14:30:00Z",
  },
  {
    id: "zone-malabata-bay",
    name: "Front de Mer & Baie — Malabata",
    category: "haut_standing",
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
    propertyIds: ["p-1"],
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
  },
  {
    id: "zone-iberia-business",
    name: "Pôle Tertiaire & Libéral — Iberia",
    category: "commercial_opportunities",
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
];

// ─────────────────────────────────────────────────────────────────────────────
// SPATIAL ALGORITHMS (TURF.JS ENGINE)
// ─────────────────────────────────────────────────────────────────────────────

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
 * Formats area into human readable string (m² or km²).
 */
export function formatArea(areaM2: number): string {
  if (areaM2 >= 1000000) {
    return `${(areaM2 / 1000000).toFixed(2)} km²`;
  }
  return `${Math.round(areaM2).toLocaleString("fr-MA")} m²`;
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
 * Generates an approximated circle polygon given a center and radius in meters.
 */
export function createCirclePolygon(centerLngLat: [number, number], radiusMeters: number): GeoJSON.Polygon {
  const radiusKm = radiusMeters / 1000;
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
    return {
      ...zone,
      areaM2,
      propertyIds: insideProps.map((p) => p.id),
      updatedAt: new Date().toISOString(),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  PROPERTIES: "realtoros_map_properties_v1",
  ZONES: "realtoros_strategic_zones_v1",
  SETTINGS: "realtoros_map_settings_v1",
};

export function loadSavedProperties(): MapProperty[] {
  if (typeof window === "undefined") return INITIAL_MAP_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!raw) return INITIAL_MAP_PROPERTIES;
    return JSON.parse(raw);
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
    return JSON.parse(raw);
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
