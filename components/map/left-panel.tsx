"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Shapes,
  Layers,
  Filter,
  Eye,
  EyeOff,
  Focus,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  MapPinOff,
} from "lucide-react";
import { MapProperty, StrategicZone, ZoneCategory, ZONE_CATEGORIES, ZoneCategoryMeta } from "@/lib/map/map-types";
import { formatArea } from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LeftPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  properties: MapProperty[];
  zones: StrategicZone[];
  selectedPropertyId?: string;
  selectedZoneId?: string;
  onSelectProperty: (property: MapProperty) => void;
  onSelectZone: (zone: StrategicZone) => void;
  onToggleZoneVisibility: (zoneId: string) => void;
  onDeleteZone: (zoneId: string) => void;
  onZoomToZone: (zone: StrategicZone) => void;
  onStartDrawZone: () => void;
  onPlacePropertyOnMap: (property: MapProperty) => void;
  layerSettings: {
    properties: boolean;
    zones: boolean;
    priceBadges: boolean;
    labels: boolean;
    buildings3d: boolean;
  };
  onToggleLayer: (layerName: "properties" | "zones" | "priceBadges" | "labels" | "buildings3d") => void;
}

export function LeftPanel({
  isOpen,
  onToggle,
  properties,
  zones,
  selectedPropertyId,
  selectedZoneId,
  onSelectProperty,
  onSelectZone,
  onToggleZoneVisibility,
  onDeleteZone,
  onZoomToZone,
  onStartDrawZone,
  onPlacePropertyOnMap,
  layerSettings,
  onToggleLayer,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"properties" | "zones" | "layers">("properties");
  const [propertySearch, setPropertySearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const filteredProperties = React.useMemo(() => {
    return properties.filter((prop) => {
      const q = propertySearch.toLowerCase();
      const matchesSearch =
        !q ||
        prop.title.toLowerCase().includes(q) ||
        prop.reference.toLowerCase().includes(q) ||
        prop.neighborhood.toLowerCase().includes(q);

      const matchesType = typeFilter === "ALL" || prop.propertyType === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "LOCATED" && prop.latitude !== undefined) ||
        (statusFilter === "UNLOCATED" && prop.latitude === undefined);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, propertySearch, typeFilter, statusFilter]);

  const locatedCount = properties.filter((p) => p.latitude !== undefined).length;

  return (
    <div
      className={`absolute top-18 bottom-12 left-3 z-20 flex transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 sm:w-96" : "w-10"
      }`}
    >
      {/* Container Card */}
      <div className="w-full h-full bg-[var(--surface)]/95 backdrop-blur-md rounded-[var(--radius-lg)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
                <MapPin size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--foreground)]">Explorateur Immobilier</h3>
                <p className="text-[10px] text-[var(--muted)]">Tanger • {locatedCount} biens cartographiés</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <MapPin size={16} className="text-[var(--accent)]" />
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
            title={isOpen ? "Réduire le panneau" : "Agrandir le panneau"}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* Tabs Selector */}
            <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--background)] text-xs font-medium text-center">
              <button
                type="button"
                onClick={() => setActiveTab("properties")}
                className={`py-2 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === "properties"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Building2 size={13} />
                <span>Biens ({properties.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("zones")}
                className={`py-2 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === "zones"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Shapes size={13} />
                <span>Zones ({zones.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("layers")}
                className={`py-2 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === "layers"
                    ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Layers size={13} />
                <span>Calques</span>
              </button>
            </div>

            {/* TAB 1: PROPERTIES LIST */}
            {activeTab === "properties" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Filters */}
                <div className="p-2.5 border-b border-[var(--border)] space-y-2 bg-[var(--background)]/40">
                  <div className="flex items-center gap-2 px-2 py-1 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)]">
                    <Search size={13} className="text-[var(--muted)]" />
                    <input
                      type="text"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      placeholder="Filtrer réf, titre ou quartier..."
                      className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded px-1.5 py-0.5 outline-none"
                    >
                      <option value="ALL">Tous types</option>
                      <option value="APARTMENT">Appartements</option>
                      <option value="VILLA">Villas</option>
                      <option value="COMMERCIAL">Bureaux / Commerces</option>
                      <option value="LAND">Terrains</option>
                      <option value="STUDIO">Studios</option>
                      <option value="DUPLEX">Duplex</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded px-1.5 py-0.5 outline-none"
                    >
                      <option value="ALL">Tous statuts</option>
                      <option value="LOCATED">Sur la carte ({locatedCount})</option>
                      <option value="UNLOCATED">Sans coordonnées</option>
                    </select>
                  </div>
                </div>

                {/* Property Cards List */}
                <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)] p-1">
                  {filteredProperties.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--muted)]">
                      Aucun bien ne correspond aux filtres.
                    </div>
                  ) : (
                    filteredProperties.map((prop) => {
                      const isSelected = selectedPropertyId === prop.id;
                      const hasCoords = prop.latitude !== undefined && prop.longitude !== undefined;
                      return (
                        <div
                          key={prop.id}
                          onClick={() => {
                            if (hasCoords) onSelectProperty(prop);
                          }}
                          className={`p-2.5 rounded-[var(--radius-md)] transition-all cursor-pointer flex gap-2.5 ${
                            isSelected
                              ? "bg-[var(--accent-subtle)] border border-[var(--accent)]"
                              : "hover:bg-[var(--border-subtle)]"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                            {prop.photos && prop.photos[0] ? (
                              <img
                                src={prop.photos[0]}
                                alt={prop.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                <Building2 size={20} />
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium truncate">
                              {prop.neighborhood}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-[var(--muted)] font-semibold">
                                {prop.reference}
                              </span>
                              <Badge
                                variant={prop.status === "ACTIVE" ? "success" : "muted"}
                                className="text-[9px] py-0 px-1"
                              >
                                {prop.status === "ACTIVE" ? "Disponible" : prop.status}
                              </Badge>
                            </div>

                            <h4 className="text-xs font-bold text-[var(--foreground)] truncate mt-0.5">
                              {prop.title}
                            </h4>

                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="font-bold text-[var(--accent)]">
                                {formatMAD(prop.price)}
                              </span>
                              <span className="text-[10px] text-[var(--muted)]">
                                {prop.surface} m² • {prop.propertyType}
                              </span>
                            </div>

                            {/* Location Status Indicator */}
                            <div className="mt-1.5 flex items-center justify-between">
                              {hasCoords ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                  <MapPin size={10} /> Localisé à Tanger
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlacePropertyOnMap(prop);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800"
                                >
                                  <MapPinOff size={10} /> Placer sur la carte
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: STRATEGIC ZONES */}
            {activeTab === "zones" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/40">
                  <span className="text-xs text-[var(--muted)] font-medium">
                    {zones.length} zone{zones.length > 1 ? "s" : ""} stratégique{zones.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={onStartDrawZone}
                    leftIcon={<Plus size={12} />}
                    className="text-xs h-7 px-2"
                  >
                    Tracer zone
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)] p-1">
                  {zones.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
                      <Shapes size={28} className="mx-auto text-[var(--muted)] opacity-60" />
                      <p className="font-semibold text-[var(--foreground)]">Créez votre première zone stratégique</p>
                      <p className="text-[11px]">
                        Tracez un polygone sur Tanger pour délimiter vos secteurs prioritaires et analyser les biens
                        inclus.
                      </p>
                      <Button size="sm" variant="outline" onClick={onStartDrawZone} className="text-xs mt-2">
                        Commencer le tracé
                      </Button>
                    </div>
                  ) : (
                    zones.map((zone) => {
                      const isSelected = selectedZoneId === zone.id;
                      const catMeta = ZONE_CATEGORIES.find((c: ZoneCategoryMeta) => c.id === zone.category);
                      return (
                        <div
                          key={zone.id}
                          onClick={() => onSelectZone(zone)}
                          className={`p-2.5 rounded-[var(--radius-md)] transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? "bg-[var(--accent-subtle)] border border-[var(--accent)]"
                              : "hover:bg-[var(--border-subtle)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="h-3 w-3 rounded-full shrink-0 border border-white/40 shadow-2xs"
                                style={{ backgroundColor: zone.color }}
                              />
                              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                                {zone.name}
                              </h4>
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--muted)] shrink-0">
                              {formatArea(zone.areaM2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                            <span className="truncate">{catMeta?.label || zone.category}</span>
                            <Badge variant="outline" className="text-[9px] py-0">
                              {zone.propertyIds.length} bien{zone.propertyIds.length > 1 ? "s" : ""} inclus
                            </Badge>
                          </div>

                          {/* Quick zone actions */}
                          <div className="pt-1 flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleZoneVisibility(zone.id);
                              }}
                              className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] rounded"
                              title={zone.isVisible ? "Masquer sur la carte" : "Afficher sur la carte"}
                            >
                              {zone.isVisible ? <Eye size={13} /> : <EyeOff size={13} className="text-rose-500" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onZoomToZone(zone);
                              }}
                              className="p-1 text-[var(--muted)] hover:text-[var(--accent)] rounded"
                              title="Centrer la vue sur cette zone"
                            >
                              <Focus size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Supprimer la zone "${zone.name}" ?`)) {
                                  onDeleteZone(zone.id);
                                }
                              }}
                              className="p-1 text-[var(--muted)] hover:text-rose-600 rounded"
                              title="Supprimer la zone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MAP LAYERS & VISIBILITY */}
            {activeTab === "layers" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-[var(--foreground)] mb-1">Affichage des Éléments</h4>
                  <p className="text-[11px] text-[var(--muted)] mb-3">
                    Activez ou désactivez les couches d'informations selon vos besoins d'analyse.
                  </p>

                  <div className="space-y-2.5">
                    {[
                      { key: "properties", label: "Marqueurs des biens immobiliers", desc: "Affiche les épingles de vos mandats" },
                      { key: "priceBadges", label: "Étiquettes de prix en Dirhams", desc: "Affiche le prix direct sur les marqueurs" },
                      { key: "zones", label: "Zones géographiques stratégiques", desc: "Contours et polygones d'analyse sectorielle" },
                      { key: "buildings3d", label: "Perspective 3D des bâtiments", desc: "Volume et hauteur du bâti urbain" },
                      { key: "labels", label: "Toponymie & Noms de rues", desc: "Repères officiels et voirie de Tanger" },
                    ].map((layer) => {
                      const isChecked = layerSettings[layer.key as keyof typeof layerSettings];
                      return (
                        <label
                          key={layer.key}
                          className="flex items-start gap-2.5 p-2 rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--border-subtle)] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleLayer(layer.key as any)}
                            className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-[var(--foreground)] block">{layer.label}</span>
                            <span className="text-[10px] text-[var(--muted)] block">{layer.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border)] space-y-1">
                  <span className="font-bold text-[11px] text-[var(--foreground)] block">Système Géodésique</span>
                  <p className="text-[10px] text-[var(--muted)]">
                    Coordonnées projetées WGS84 (EPSG:4326) • Calculs de surfaces géodésiques via Turf.js conformes aux
                    normes SIG marocaines.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
