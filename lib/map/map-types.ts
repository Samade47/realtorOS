/**
 * RealtorOS Morocco — Market Explorer (Map) Types
 * Definitive specifications for geospatial entities, interactive vector map controls,
 * strategic zoning, and property spatial indexing.
 */

import { DemoProperty } from "@/lib/data/demo-data";

export type ZoneCategory =
  | "haut_standing"
  | "luxury_villas"
  | "high_rental_potential"
  | "affordable_investment"
  | "commercial_opportunities"
  | "prospecting_priority"
  | "custom";

export interface ZoneCategoryMeta {
  id: ZoneCategory;
  label: string;
  defaultColor: string;
  description: string;
}

export const ZONE_CATEGORIES: ZoneCategoryMeta[] = [
  {
    id: "haut_standing",
    label: "Haut standing",
    defaultColor: "#2563eb", // Deep royal blue
    description: "Résidences et appartements de grand standing avec finitions premium.",
  },
  {
    id: "luxury_villas",
    label: "Villas de luxe",
    defaultColor: "#9333ea", // Purple
    description: "Propriétés d'exception, villas avec parc paysager et piscines.",
  },
  {
    id: "high_rental_potential",
    label: "Fort potentiel locatif",
    defaultColor: "#059669", // Emerald green
    description: "Secteurs à forte demande locative (saisonnière ou longue durée).",
  },
  {
    id: "affordable_investment",
    label: "Investissement abordable",
    defaultColor: "#0284c7", // Sky blue
    description: "Zones émergentes offrant un ticket d'entrée modéré et plus-value future.",
  },
  {
    id: "commercial_opportunities",
    label: "Opportunités commerciales",
    defaultColor: "#ea580c", // Amber / orange
    description: "Emplacements stratégiques pour bureaux, commerces et plateaux professionnels.",
  },
  {
    id: "prospecting_priority",
    label: "Prospection prioritaire",
    defaultColor: "#dc2626", // Red / coral
    description: "Périmètres ciblés pour mandats exclusifs et recherche foncière active.",
  },
  {
    id: "custom",
    label: "Zone personnalisée",
    defaultColor: "#475569", // Slate
    description: "Périmètre sur-mesure défini par l'agent immobilier.",
  },
];

export interface MapProperty extends DemoProperty {
  latitude?: number;
  longitude?: number;
  locationPrecision?: "exact" | "approximate" | "neighborhood";
  photos?: string[];
  altitude?: number;
}

export interface StrategicZone {
  id: string;
  userId?: string;
  name: string;
  category: ZoneCategory;
  description?: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  areaM2: number;
  color: string;
  isVisible: boolean;
  tags: string[];
  notes?: string;
  propertyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type DrawingMode =
  | "select"
  | "add_property"
  | "draw_polygon"
  | "draw_rectangle"
  | "draw_radius"
  | "measure";

export type MapStyleId = "voyager" | "positron" | "dark" | "satellite";

export interface MapStyleOption {
  id: MapStyleId;
  name: string;
  description: string;
  styleUrl: string;
  thumbnailUrl: string;
}

export interface MapWorkspaceSettings {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  mapStyle: MapStyleId;
  layers: {
    properties: boolean;
    zones: boolean;
    priceBadges: boolean;
    labels: boolean;
    buildings3d: boolean;
  };
}

export interface LocationSearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "neighborhood" | "street" | "property" | "zone" | "landmark";
  coordinates: [number, number]; // [lng, lat]
  zoom?: number;
  propertyId?: string;
  zoneId?: string;
}

export interface MeasureResult {
  distanceMeters: number;
  points: [number, number][];
}
