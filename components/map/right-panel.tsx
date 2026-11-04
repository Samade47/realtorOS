"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Building2,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Home,
  ShieldCheck,
  Download,
  Trash2,
  Save,
  Focus,
  ExternalLink,
  Edit2,
  Tag,
  FileText,
  Shapes,
  Navigation,
  Phone,
  Mail,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  CircleDot,
  Compass,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  MapProperty,
  StrategicZone,
  ZoneCategory,
  ZONE_CATEGORIES,
  ZonePriority,
} from "@/lib/map/map-types";
import {
  formatArea,
  formatDistance,
  calculateZoneAnalytics,
} from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface RightPanelProps {
  selectedProperty: MapProperty | null;
  selectedZone: StrategicZone | null;
  isDrawingZoneActive: boolean;
  draftZone: Partial<StrategicZone> | null;
  allZones: StrategicZone[];
  properties: MapProperty[];
  onClose: () => void;
  onZoomToProperty: (property: MapProperty) => void;
  onZoomToZone: (zone: StrategicZone) => void;
  onSelectProperty: (property: MapProperty) => void;
  onSelectZone: (zone: StrategicZone) => void;
  onSaveZone: (zoneData: Partial<StrategicZone>) => void;
  onDeleteZone: (zoneId: string) => void;
  onDuplicateZone?: (zone: StrategicZone) => void;
  onExportZoneGeoJSON: (zone: StrategicZone) => void;
  onStartMovePropertyLocation: (property: MapProperty) => void;
  onHighlightSurroundingRadius?: (coords: [number, number], radiusMeters: number) => void;
  onStartEditZoneVertices?: (zone: StrategicZone) => void;
}

const COLOR_PRESETS = [
  "#2563eb", // Deep blue
  "#9333ea", // Purple
  "#059669", // Emerald
  "#0284c7", // Sky
  "#ea580c", // Amber / orange
  "#dc2626", // Red / coral
  "#d97706", // Warm amber
  "#475569", // Slate
];

const PRIORITY_OPTIONS: { id: ZonePriority; label: string; color: string }[] = [
  { id: "low", label: "Faible", color: "text-slate-400" },
  { id: "medium", label: "Moyenne", color: "text-blue-500" },
  { id: "high", label: "Haute", color: "text-amber-500" },
  { id: "critical", label: "Critique", color: "text-rose-500" },
];

export function RightPanel({
  selectedProperty,
  selectedZone,
  isDrawingZoneActive,
  draftZone,
  allZones,
  properties,
  onClose,
  onZoomToProperty,
  onZoomToZone,
  onSelectProperty,
  onSelectZone,
  onSaveZone,
  onDeleteZone,
  onDuplicateZone,
  onExportZoneGeoJSON,
  onStartMovePropertyLocation,
  onHighlightSurroundingRadius,
  onStartEditZoneVertices,
}: RightPanelProps) {
  // Zone editing state
  const activeZone = selectedZone || draftZone;
  const [zoneName, setZoneName] = React.useState<string>("");
  const [zoneCategory, setZoneCategory] = React.useState<ZoneCategory>("haut_standing");
  const [zonePriority, setZonePriority] = React.useState<ZonePriority>("high");
  const [zoneColor, setZoneColor] = React.useState<string>("#2563eb");
  const [zoneNotes, setZoneNotes] = React.useState<string>("");
  const [zoneTags, setZoneTags] = React.useState<string>("");
  const [zonePropertySearch, setZonePropertySearch] = React.useState<string>("");
  const [activeZoneTab, setActiveZoneTab] = React.useState<"overview" | "properties" | "strategy">("overview");

  // Property gallery state
  const [activePhotoIdx, setActivePhotoIdx] = React.useState(0);

  // Synchronize when selectedZone or draftZone changes
  React.useEffect(() => {
    if (activeZone) {
      setZoneName(activeZone.name || "Nouvelle zone stratégique");
      setZoneCategory(activeZone.category || "haut_standing");
      setZonePriority(activeZone.priority || "high");
      setZoneColor(activeZone.color || "#2563eb");
      setZoneNotes(activeZone.notes || "");
      setZoneTags(activeZone.tags ? activeZone.tags.join(", ") : "");
      setActiveZoneTab("overview");
    }
  }, [activeZone?.id, draftZone]);

  React.useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedProperty?.id]);

  if (!selectedProperty && !activeZone) {
    return null;
  }

  // Calculate Zone Analytics
  const zoneAnalytics = React.useMemo(() => {
    if (!activeZone || !activeZone.geometry) return null;
    return calculateZoneAnalytics(activeZone as StrategicZone, properties);
  }, [activeZone, properties]);

  // Filter properties in zone
  const filteredZoneProperties = React.useMemo(() => {
    if (!zoneAnalytics) return [];
    if (!zonePropertySearch.trim()) return zoneAnalytics.propertiesList;
    const q = zonePropertySearch.toLowerCase();
    return zoneAnalytics.propertiesList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
    );
  }, [zoneAnalytics, zonePropertySearch]);

  // Identify zones containing the currently selected property
  const containingZones = React.useMemo(() => {
    if (!selectedProperty || selectedProperty.latitude === undefined || selectedProperty.longitude === undefined) {
      return [];
    }
    return allZones.filter((z) => z.propertyIds?.includes(selectedProperty.id));
  }, [selectedProperty, allZones]);

  const handleSaveZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    onSaveZone({
      name: zoneName.trim(),
      category: zoneCategory,
      priority: zonePriority,
      color: zoneColor,
      notes: zoneNotes.trim(),
      tags: zoneTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="absolute top-18 bottom-12 right-3 z-20 w-80 sm:w-96 flex">
      <div className="w-full h-full bg-[var(--surface)]/95 backdrop-blur-md rounded-[var(--radius-lg)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden text-xs text-[var(--foreground)]">
        {/* ========================================================================= */}
        {/* CONTEXT A: SELECTED PROPERTY */}
        {/* ========================================================================= */}
        {selectedProperty && !activeZone && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                  {selectedProperty.reference}
                </span>
                <Badge
                  variant={selectedProperty.status === "ACTIVE" ? "success" : "muted"}
                  className="text-[9px]"
                >
                  {selectedProperty.status === "ACTIVE" ? "Disponible" : selectedProperty.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onZoomToProperty(selectedProperty)}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--border-subtle)] transition-colors"
                  title="Centrer la carte sur ce bien"
                >
                  <Focus size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
                  title="Fermer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Photo Gallery */}
              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="relative w-full h-44 rounded-[var(--radius-md)] overflow-hidden shadow-sm bg-black/10">
                    <img
                      src={selectedProperty.photos[activePhotoIdx] || selectedProperty.photos[0]}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] backdrop-blur-xs">
                      {activePhotoIdx + 1} / {selectedProperty.photos.length}
                    </div>
                  </div>
                  {selectedProperty.photos.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {selectedProperty.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt="Thumbnail"
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`h-10 w-14 object-cover rounded cursor-pointer border-2 transition-transform hover:scale-105 shrink-0 ${
                            activePhotoIdx === idx ? "border-[var(--accent)]" : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Price */}
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-extrabold text-[var(--foreground)]">
                    {formatMAD(selectedProperty.price)}
                  </span>
                  {selectedProperty.surface ? (
                    <span className="text-[11px] font-semibold text-[var(--muted)]">
                      {Math.round(selectedProperty.price / selectedProperty.surface).toLocaleString("fr-MA")} MAD/m²
                    </span>
                  ) : null}
                </div>
                <h4 className="font-bold text-sm text-[var(--foreground)] leading-snug mt-1">
                  {selectedProperty.title}
                </h4>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-500 shrink-0" />
                  <span>
                    {selectedProperty.neighborhood}, {selectedProperty.city || "Tanger"}
                  </span>
                </p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--background)]/60 border border-[var(--border)] text-center">
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Superficie</span>
                  <span className="font-bold text-xs">{selectedProperty.surface || "—"} m²</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Chambres</span>
                  <span className="font-bold text-xs">{selectedProperty.bedrooms || "0"} ch</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Salles de bain</span>
                  <span className="font-bold text-xs">{selectedProperty.bathrooms || "0"} sdb</span>
                </div>
              </div>

              {/* Location & GPS Info */}
              <div className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Localisation & Cadastre
                  </span>
                  <Badge variant={selectedProperty.locationPrecision === "exact" ? "success" : "warning"} className="text-[9px]">
                    {selectedProperty.locationPrecision === "exact" ? "Position exacte" : "Approximative"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Latitude :</span>
                    <span className="font-semibold">{selectedProperty.latitude?.toFixed(6)}° N</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Longitude :</span>
                    <span className="font-semibold">{selectedProperty.longitude?.toFixed(6)}° W</span>
                  </div>
                </div>

                {selectedProperty.titreFoncier && (
                  <div className="text-[11px] pt-1 border-t border-[var(--border)]/60 flex items-center justify-between">
                    <span className="text-[var(--muted)]">Titre Foncier (TF) :</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{selectedProperty.titreFoncier}</span>
                  </div>
                )}
              </div>

              {/* Strategic Zones Membership */}
              {containingZones.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                    Inclus dans {containingZones.length} zone(s) stratégique(s)
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {containingZones.map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => onSelectZone(z)}
                        className="flex items-center justify-between p-2 rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--border-subtle)] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }}></span>
                          <span className="font-semibold text-xs text-[var(--foreground)]">{z.name}</span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] font-mono">{formatArea(z.areaM2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner / Contact Information */}
              <div className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)]/40 space-y-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                  Propriétaire & Mandat
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{selectedProperty.ownerName || "Client Confidentiel"}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {selectedProperty.mandateType === "exclusive" ? "Mandat Exclusif" : "Mandat Simple"}
                  </Badge>
                </div>
                {selectedProperty.ownerPhone && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[var(--muted)] flex items-center gap-1">
                      <Phone size={11} /> {selectedProperty.ownerPhone}
                    </span>
                    <a
                      href={`https://wa.me/${selectedProperty.ownerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline font-semibold"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Primary Actions */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onStartMovePropertyLocation(selectedProperty)}
                    className="gap-1.5 text-xs border-[var(--border)]"
                  >
                    <Navigation size={13} className="text-amber-500" />
                    <span>Déplacer</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedProperty.latitude && selectedProperty.longitude && onHighlightSurroundingRadius) {
                        onHighlightSurroundingRadius([selectedProperty.longitude, selectedProperty.latitude], 500);
                      }
                    }}
                    className="gap-1.5 text-xs border-[var(--border)]"
                  >
                    <Compass size={13} className="text-blue-500" />
                    <span>Rayon 500m</span>
                  </Button>
                </div>

                <Link href={`/dashboard/properties`} className="block">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-semibold text-xs"
                  >
                    <ExternalLink size={13} />
                    <span>Ouvrir la fiche complète dans Biens</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONTEXT B: STRATEGIC ZONE (SELECTED OR DRAFT) */}
        {/* ========================================================================= */}
        {activeZone && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: zoneColor }} />
                <h4 className="font-bold text-xs truncate">{draftZone ? "Nouvelle Zone Délimitée" : zoneName}</h4>
              </div>
              <div className="flex items-center gap-1">
                {selectedZone && (
                  <button
                    type="button"
                    onClick={() => onZoomToZone(selectedZone)}
                    className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--accent)]"
                    title="Centrer sur la zone"
                  >
                    <Focus size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)]"
                  title="Fermer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Zone Subtabs */}
            <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--background)] text-center text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveZoneTab("overview")}
                className={`py-2 border-b-2 transition-colors ${
                  activeZoneTab === "overview"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)]"
                }`}
              >
                Aperçu
              </button>
              <button
                type="button"
                onClick={() => setActiveZoneTab("properties")}
                className={`py-2 border-b-2 transition-colors ${
                  activeZoneTab === "properties"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)]"
                }`}
              >
                Biens ({zoneAnalytics?.totalProperties || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveZoneTab("strategy")}
                className={`py-2 border-b-2 transition-colors ${
                  activeZoneTab === "strategy"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)]"
                }`}
              >
                Stratégie & Notes
              </button>
            </div>

            {/* Scrollable Zone Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: OVERVIEW & SPATIAL ANALYTICS */}
              {activeZoneTab === "overview" && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Metric Stat Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--background)]/70 border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted)] block">Superficie calculée</span>
                      <span className="text-sm font-extrabold text-[var(--foreground)]">
                        {formatArea(zoneAnalytics?.areaM2 || activeZone.areaM2 || 0)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--background)]/70 border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted)] block">Périmètre géodésique</span>
                      <span className="text-sm font-extrabold text-[var(--foreground)]">
                        {formatDistance(zoneAnalytics?.perimeterM || activeZone.perimeterM || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--background)]/70 border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted)] block">Biens géolocalisés</span>
                      <span className="text-sm font-extrabold text-[var(--accent)]">
                        {zoneAnalytics?.totalProperties || 0}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--background)]/70 border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted)] block">Prix moyen au m²</span>
                      <span className="text-sm font-extrabold text-[var(--foreground)]">
                        {zoneAnalytics?.averagePricePerM2MAD
                          ? `${zoneAnalytics.averagePricePerM2MAD.toLocaleString("fr-MA")} MAD`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Portfolio Total Value */}
                  {zoneAnalytics && zoneAnalytics.totalAskingValueMAD > 0 && (
                    <div className="p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                        Valeur totale du portefeuille sous mandat
                      </span>
                      <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-100">
                        {formatMAD(zoneAnalytics.totalAskingValueMAD)}
                      </span>
                    </div>
                  )}

                  {/* Edit Boundary Action */}
                  {selectedZone && onStartEditZoneVertices && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onStartEditZoneVertices(selectedZone)}
                      className="w-full gap-1.5 border-[var(--border)] text-xs font-semibold"
                    >
                      <Edit2 size={13} className="text-blue-500" />
                      <span>Modifier les contours géométriques</span>
                    </Button>
                  )}
                </div>
              )}

              {/* TAB 2: INCLUDED PROPERTIES */}
              {activeZoneTab === "properties" && (
                <div className="space-y-3 animate-in fade-in">
                  <Input
                    placeholder="Filtrer dans la zone..."
                    value={zonePropertySearch}
                    onChange={(e) => setZonePropertySearch(e.target.value)}
                    className="h-8 text-xs"
                  />

                  {filteredZoneProperties.length === 0 ? (
                    <div className="p-6 text-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
                      <p>Aucun bien identifié dans ce périmètre.</p>
                      <p className="text-[10px] mt-1">
                        Utilisez l'outil "+ Placer un bien" pour en ajouter un.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredZoneProperties.map((prop) => (
                        <div
                          key={prop.id}
                          onClick={() => {
                            onSelectProperty(prop);
                            onZoomToProperty(prop);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)]/40 hover:bg-[var(--border-subtle)] cursor-pointer transition-colors"
                        >
                          {prop.photos && prop.photos[0] ? (
                            <img
                              src={prop.photos[0]}
                              alt={prop.title}
                              className="w-12 h-12 object-cover rounded shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                              <Home size={18} className="text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] font-bold text-[var(--muted)]">
                                {prop.reference}
                              </span>
                              <span className="font-bold text-xs text-[var(--accent)]">
                                {formatMAD(prop.price)}
                              </span>
                            </div>
                            <h5 className="font-bold text-[11px] truncate text-[var(--foreground)] mt-0.5">
                              {prop.title}
                            </h5>
                            <p className="text-[10px] text-[var(--muted)] truncate">
                              {prop.propertyType} • {prop.surface} m²
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STRATEGY & CONFIGURATION */}
              {activeZoneTab === "strategy" && (
                <form onSubmit={handleSaveZoneSubmit} className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="font-bold block mb-1">Nom de la zone stratégique</label>
                    <Input
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Ex: Secteur Marshan — Villas de luxe"
                      className="h-8"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Catégorie stratégique</label>
                    <select
                      value={zoneCategory}
                      onChange={(e) => setZoneCategory(e.target.value as any)}
                      className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                    >
                      {ZONE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">Niveau de Priorité</label>
                      <select
                        value={zonePriority}
                        onChange={(e) => setZonePriority(e.target.value as any)}
                        className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Couleur d'identification</label>
                      <div className="flex items-center gap-1 mt-1">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setZoneColor(color)}
                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                              zoneColor === color ? "ring-2 ring-offset-2 ring-[var(--accent)]" : ""
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Notes de prospection & Cibles</label>
                    <textarea
                      rows={3}
                      value={zoneNotes}
                      onChange={(e) => setZoneNotes(e.target.value)}
                      placeholder="Ex: Forte demande MRE pour villas avec piscine. Prix au m² en hausse."
                      className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Mots-clés / Tags (séparés par virgule)</label>
                    <Input
                      value={zoneTags}
                      onChange={(e) => setZoneTags(e.target.value)}
                      placeholder="Ex: Vue mer, Prestige, Forte marge"
                      className="h-8"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-bold gap-1.5"
                    >
                      <Save size={13} />
                      <span>{draftZone ? "Créer la zone" : "Enregistrer les modifications"}</span>
                    </Button>
                  </div>
                </form>
              )}

              {/* Zone Secondary Actions */}
              {selectedZone && (
                <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onExportZoneGeoJSON(selectedZone)}
                    className="gap-1.5 text-xs border-[var(--border)]"
                  >
                    <Download size={13} />
                    <span>GeoJSON</span>
                  </Button>

                  {onDuplicateZone && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicateZone(selectedZone)}
                      className="gap-1.5 text-xs border-[var(--border)]"
                    >
                      <Copy size={13} />
                      <span>Dupliquer</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Confirmez-vous la suppression de la zone "${selectedZone.name}" ? (Vos biens ne seront pas supprimés)`)) {
                        onDeleteZone(selectedZone.id);
                      }
                    }}
                    className="col-span-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 text-xs"
                  >
                    <Trash2 size={13} />
                    <span>Supprimer la zone stratégique</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
