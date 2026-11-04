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
} from "lucide-react";
import { MapProperty, StrategicZone, ZoneCategory, ZONE_CATEGORIES, ZoneCategoryMeta } from "@/lib/map/map-types";
import { formatArea } from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface RightPanelProps {
  selectedProperty: MapProperty | null;
  selectedZone: StrategicZone | null;
  isDrawingZoneActive: boolean;
  draftZone: Partial<StrategicZone> | null;
  matchingPropertiesInZone: MapProperty[];
  onClose: () => void;
  onZoomToProperty: (property: MapProperty) => void;
  onZoomToZone: (zone: StrategicZone) => void;
  onSaveZone: (zoneData: Partial<StrategicZone>) => void;
  onDeleteZone: (zoneId: string) => void;
  onExportZoneGeoJSON: (zone: StrategicZone) => void;
  onStartMovePropertyLocation: (property: MapProperty) => void;
}

const COLOR_PRESETS = [
  "#2563eb", // Deep blue
  "#9333ea", // Purple
  "#059669", // Emerald
  "#0284c7", // Sky
  "#ea580c", // Amber / orange
  "#dc2626", // Red
  "#475569", // Slate
];

export function RightPanel({
  selectedProperty,
  selectedZone,
  isDrawingZoneActive,
  draftZone,
  matchingPropertiesInZone,
  onClose,
  onZoomToProperty,
  onZoomToZone,
  onSaveZone,
  onDeleteZone,
  onExportZoneGeoJSON,
  onStartMovePropertyLocation,
}: RightPanelProps) {
  // Zone editing state
  const activeZone = selectedZone || draftZone;
  const [zoneName, setZoneName] = React.useState<string>("");
  const [zoneCategory, setZoneCategory] = React.useState<ZoneCategory>("haut_standing");
  const [zoneColor, setZoneColor] = React.useState<string>("#2563eb");
  const [zoneNotes, setZoneNotes] = React.useState<string>("");
  const [zoneTags, setZoneTags] = React.useState<string>("");

  // Synchronize when selectedZone or draftZone changes
  React.useEffect(() => {
    if (activeZone) {
      setZoneName(activeZone.name || "Nouvelle zone stratégique");
      setZoneCategory(activeZone.category || "haut_standing");
      setZoneColor(activeZone.color || "#2563eb");
      setZoneNotes(activeZone.notes || "");
      setZoneTags(activeZone.tags ? activeZone.tags.join(", ") : "");
    }
  }, [activeZone?.id, draftZone]);

  if (!selectedProperty && !activeZone) {
    return null;
  }

  const handleSaveZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    onSaveZone({
      name: zoneName.trim(),
      category: zoneCategory,
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
      <div className="w-full h-full bg-[var(--surface)]/95 backdrop-blur-md rounded-[var(--radius-lg)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden">
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
                <Badge variant={selectedProperty.status === "ACTIVE" ? "success" : "muted"} className="text-[9px]">
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
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Photo Showcase */}
              <div className="relative h-44 rounded-[var(--radius-md)] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner">
                {selectedProperty.photos && selectedProperty.photos[0] ? (
                  <img
                    src={selectedProperty.photos[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                    <Building2 size={32} />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant="outline" className="bg-black/60 text-white border-none text-[10px]">
                    {selectedProperty.transactionType.includes("SALE") ? "Vente" : "Location"}
                  </Badge>
                  <Badge variant="outline" className="bg-black/60 text-white border-none text-[10px]">
                    {selectedProperty.propertyType}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white font-bold px-2 py-1 rounded text-xs">
                  {formatMAD(selectedProperty.price)}
                </div>
              </div>

              {/* Title & Neighborhood */}
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                  {selectedProperty.title}
                </h3>
                <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-[var(--accent)] shrink-0" />
                  <span>{selectedProperty.address || selectedProperty.neighborhood}, Tanger</span>
                </p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[var(--background)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Surface</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">{selectedProperty.surface} m²</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Chambres</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">{selectedProperty.bedrooms} ch.</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">SDB</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">{selectedProperty.bathrooms} sdb</span>
                </div>
              </div>

              {/* Legal Status & Title Deed */}
              <div className="p-3 rounded-[var(--radius-md)] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                  <ShieldCheck size={14} />
                  <span>Statut Juridique Foncier</span>
                </div>
                <p className="text-[11px] font-mono font-medium text-[var(--foreground)]">
                  {selectedProperty.titreFoncier || "Titre Foncier vérifié"}
                </p>
                <span className="text-[10px] text-[var(--muted)] block">Conservation Foncière de Tanger</span>
              </div>

              {/* Coordinates & Precision */}
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Position Géographique (GPS)
                  </span>
                  <Badge variant="outline" className="text-[9px]">WGS84</Badge>
                </div>
                {selectedProperty.latitude !== undefined && selectedProperty.longitude !== undefined ? (
                  <div className="font-mono text-[11px] text-[var(--foreground)] flex justify-between">
                    <span>Lat: {selectedProperty.latitude.toFixed(6)}°</span>
                    <span>Lng: {selectedProperty.longitude.toFixed(6)}°</span>
                  </div>
                ) : (
                  <p className="text-amber-600 font-semibold text-[11px]">Coordonnées non renseignées</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartMovePropertyLocation(selectedProperty)}
                  leftIcon={<Edit2 size={11} />}
                  className="w-full text-xs h-7 mt-1"
                >
                  Modifier l'emplacement sur la carte
                </Button>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <h4 className="font-semibold text-xs text-[var(--foreground)] mb-1">Description</h4>
                  <p className="text-[var(--muted)] text-[11px] leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]/60 flex items-center justify-between gap-2">
              <Link href="/dashboard/properties" className="w-full">
                <Button size="sm" variant="outline" className="w-full text-xs" leftIcon={<ExternalLink size={12} />}>
                  Ouvrir fiche complète
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONTEXT B: STRATEGIC ZONE DETAILS / ACTIVE DRAWING */}
        {/* ========================================================================= */}
        {activeZone && (
          <form onSubmit={handleSaveZoneSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
                  style={{ backgroundColor: zoneColor }}
                />
                <h3 className="text-xs font-bold text-[var(--foreground)]">
                  {selectedZone ? "Propriétés de la zone" : "Enregistrer la nouvelle zone"}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {selectedZone && (
                  <button
                    type="button"
                    onClick={() => onZoomToZone(selectedZone)}
                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--border-subtle)] transition-colors"
                    title="Centrer sur la zone"
                  >
                    <Focus size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Zone Name */}
              <div>
                <label className="font-semibold block mb-1 text-[var(--foreground)]">Nom de la zone</label>
                <Input
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Ex: Secteur Résidentiel Prestige Marshan"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-semibold block mb-1 text-[var(--foreground)]">Typologie stratégique</label>
                <select
                  value={zoneCategory}
                  onChange={(e) => {
                    const cat = e.target.value as ZoneCategory;
                    setZoneCategory(cat);
                    const meta = ZONE_CATEGORIES.find((c: ZoneCategoryMeta) => c.id === cat);
                    if (meta) setZoneColor(meta.defaultColor);
                  }}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)] outline-none"
                >
                  {ZONE_CATEGORIES.map((cat: ZoneCategoryMeta) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  {ZONE_CATEGORIES.find((c: ZoneCategoryMeta) => c.id === zoneCategory)?.description}
                </p>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="font-semibold block mb-1.5 text-[var(--foreground)]">Couleur du contour</label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setZoneColor(color)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        zoneColor === color ? "border-[var(--foreground)] scale-110 shadow-xs" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Area & Properties Summary */}
              <div className="grid grid-cols-2 gap-2 bg-[var(--background)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Superficie calculée</span>
                  <span className="font-bold text-xs text-[var(--foreground)]">
                    {formatArea(activeZone.areaM2 || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block">Biens inclus</span>
                  <span className="font-bold text-xs text-[var(--accent)]">
                    {matchingPropertiesInZone.length} mandat{matchingPropertiesInZone.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Matching Properties Inside Zone */}
              <div>
                <h4 className="font-semibold text-xs text-[var(--foreground)] mb-1 flex items-center justify-between">
                  <span>Biens dans ce périmètre</span>
                  <Badge variant="outline" className="text-[9px]">
                    Spatialement détectés
                  </Badge>
                </h4>
                {matchingPropertiesInZone.length === 0 ? (
                  <p className="p-3 text-center text-[11px] text-[var(--muted)] bg-[var(--background)] rounded-[var(--radius-md)] border border-[var(--border)]">
                    Aucun bien géolocalisé ne se trouve actuellement dans ce polygone.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {matchingPropertiesInZone.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onZoomToProperty(p)}
                        className="p-2 rounded bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-[11px] truncate block">{p.title}</span>
                          <span className="text-[10px] text-[var(--muted)]">{p.neighborhood} • {p.surface} m²</span>
                        </div>
                        <span className="font-bold text-[11px] text-[var(--accent)] shrink-0">
                          {formatMAD(p.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes & Tags */}
              <div>
                <label className="font-semibold block mb-1 text-[var(--foreground)]">Tags sectoriels</label>
                <Input
                  value={zoneTags}
                  onChange={(e) => setZoneTags(e.target.value)}
                  placeholder="Ex: Mandats prioritaires, Promoteurs, Vue mer"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[var(--foreground)]">Notes de prospection</label>
                <textarea
                  value={zoneNotes}
                  onChange={(e) => setZoneNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-2 text-xs text-[var(--foreground)] outline-none"
                  placeholder="Stratégie d'acquisition de mandats sur ce quartier..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]/60 flex items-center justify-between gap-2">
              {selectedZone ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => onExportZoneGeoJSON(selectedZone)}
                    leftIcon={<Download size={12} />}
                    className="text-xs"
                    title="Exporter le polygone au format GeoJSON standard"
                  >
                    GeoJSON
                  </Button>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="destructive"
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer définitivement la zone "${selectedZone.name}" ?`)) {
                          onDeleteZone(selectedZone.id);
                        }
                      }}
                      className="text-xs h-8 px-2"
                    >
                      <Trash2 size={13} />
                    </Button>
                    <Button size="sm" variant="default" type="submit" leftIcon={<Save size={12} />} className="text-xs">
                      Enregistrer
                    </Button>
                  </div>
                </>
              ) : (
                <Button size="sm" variant="default" type="submit" leftIcon={<Save size={12} />} className="w-full text-xs">
                  Sauvegarder la zone
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
