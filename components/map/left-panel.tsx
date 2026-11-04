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
  SlidersHorizontal,
  Home,
  Store,
  Trees,
  Briefcase,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import {
  MapProperty,
  StrategicZone,
  ZoneCategory,
  ZONE_CATEGORIES,
  ZoneCategoryMeta,
  ZonePriority,
  MapStyleId,
} from "@/lib/map/map-types";
import { formatArea, MAP_STYLES } from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  activeMapStyle: MapStyleId;
  onChangeMapStyle: (styleId: MapStyleId) => void;
  layerSettings: {
    properties: boolean;
    zones: boolean;
    priceBadges: boolean;
    labels: boolean;
    buildings3d: boolean;
  };
  onToggleLayer: (layerName: "properties" | "zones" | "priceBadges" | "labels" | "buildings3d") => void;
  onOpenAdvancedFilters?: () => void;
  activeFilterCount?: number;
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
  activeMapStyle,
  onChangeMapStyle,
  layerSettings,
  onToggleLayer,
  onOpenAdvancedFilters,
  activeFilterCount = 0,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"properties" | "zones" | "layers">("properties");

  // Property list filters
  const [propertySearch, setPropertySearch] = React.useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = React.useState<string>("ALL");
  const [locationStatusFilter, setLocationStatusFilter] = React.useState<"ALL" | "LOCATED" | "UNLOCATED">("ALL");

  // Zone list filters & sorting
  const [zoneSearch, setZoneSearch] = React.useState("");
  const [zoneCategoryFilter, setZoneCategoryFilter] = React.useState<string>("ALL");
  const [zoneSortBy, setZoneSortBy] = React.useState<"name" | "area" | "properties" | "priority">("area");

  // Filtered Properties
  const filteredProperties = React.useMemo(() => {
    return properties.filter((prop) => {
      const q = propertySearch.toLowerCase();
      const matchesSearch =
        !q ||
        prop.title.toLowerCase().includes(q) ||
        prop.reference.toLowerCase().includes(q) ||
        prop.neighborhood.toLowerCase().includes(q);

      const matchesType = propertyTypeFilter === "ALL" || prop.propertyType === propertyTypeFilter;
      const matchesLocation =
        locationStatusFilter === "ALL" ||
        (locationStatusFilter === "LOCATED" && prop.latitude !== undefined) ||
        (locationStatusFilter === "UNLOCATED" && prop.latitude === undefined);

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [properties, propertySearch, propertyTypeFilter, locationStatusFilter]);

  // Filtered & Sorted Strategic Zones
  const filteredZones = React.useMemo(() => {
    let result = zones.filter((z) => {
      const q = zoneSearch.toLowerCase();
      const matchesSearch =
        !q ||
        z.name.toLowerCase().includes(q) ||
        (z.notes && z.notes.toLowerCase().includes(q)) ||
        z.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = zoneCategoryFilter === "ALL" || z.category === zoneCategoryFilter;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (zoneSortBy === "name") return a.name.localeCompare(b.name);
      if (zoneSortBy === "area") return (b.areaM2 || 0) - (a.areaM2 || 0);
      if (zoneSortBy === "properties") return (b.propertyIds?.length || 0) - (a.propertyIds?.length || 0);
      if (zoneSortBy === "priority") {
        const pOrder: Record<ZonePriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority || "medium"] || 2) - (pOrder[a.priority || "medium"] || 2);
      }
      return 0;
    });

    return result;
  }, [zones, zoneSearch, zoneCategoryFilter, zoneSortBy]);

  const locatedCount = properties.filter((p) => p.latitude !== undefined).length;

  return (
    <div
      className={`absolute top-18 bottom-12 left-3 z-20 flex transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 sm:w-96" : "w-10"
      }`}
    >
      {/* Container Card */}
      <div className="w-full h-full bg-[var(--surface)]/95 backdrop-blur-md rounded-[var(--radius-lg)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden text-xs text-[var(--foreground)]">
        {/* Panel Header */}
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white shadow-xs">
                <MapPin size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--foreground)]">Market Explorer Tanger</h3>
                <p className="text-[10px] text-[var(--muted)]">
                  {locatedCount} / {properties.length} biens sur la carte
                </p>
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
                <span>Couches</span>
              </button>
            </div>

            {/* TAB 1: PROPERTIES LIST */}
            {activeTab === "properties" && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2.5">
                {/* Search & Advanced Filter Button */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <Input
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      placeholder="Chercher référence, titre..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  {onOpenAdvancedFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenAdvancedFilters}
                      className="h-8 px-2 gap-1 relative border-[var(--border)] shrink-0"
                      title="Filtres avancés"
                    >
                      <SlidersHorizontal size={13} />
                      {activeFilterCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] absolute -top-1 -right-1"></span>
                      )}
                    </Button>
                  )}
                </div>

                {/* Quick Status Pill Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  {[
                    { id: "ALL", label: "Tous" },
                    { id: "LOCATED", label: `Sur la carte (${locatedCount})` },
                    { id: "UNLOCATED", label: `À placer (${properties.length - locatedCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLocationStatusFilter(f.id as any)}
                      className={`px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                        locationStatusFilter === f.id
                          ? "bg-[var(--accent)] text-white font-bold"
                          : "bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Scrollable Property Items */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {filteredProperties.length === 0 ? (
                    <div className="p-6 text-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
                      <p>Aucun bien ne correspond aux filtres.</p>
                    </div>
                  ) : (
                    filteredProperties.map((prop) => {
                      const isSelected = selectedPropertyId === prop.id;
                      const isLocated = prop.latitude !== undefined && prop.longitude !== undefined;

                      return (
                        <div
                          key={prop.id}
                          onClick={() => {
                            if (isLocated) {
                              onSelectProperty(prop);
                            }
                          }}
                          className={`flex items-start gap-2.5 p-2 rounded-[var(--radius-md)] border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]"
                              : "border-[var(--border)] hover:bg-[var(--border-subtle)] bg-[var(--background)]/40"
                          }`}
                        >
                          {prop.photos && prop.photos[0] ? (
                            <img
                              src={prop.photos[0]}
                              alt={prop.title}
                              className="w-14 h-14 object-cover rounded shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                              <Building2 size={18} className="text-slate-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[9px] font-bold text-[var(--muted)]">
                                {prop.reference}
                              </span>
                              <span className="font-extrabold text-xs text-[var(--foreground)]">
                                {formatMAD(prop.price)}
                              </span>
                            </div>

                            <h5 className="font-bold text-[11px] truncate text-[var(--foreground)] mt-0.5">
                              {prop.title}
                            </h5>

                            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-1">
                              <span className="truncate">
                                {prop.neighborhood} • {prop.surface} m²
                              </span>
                              {isLocated ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                                  <MapPin size={10} /> Carte
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlacePropertyOnMap(prop);
                                  }}
                                  className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline shrink-0"
                                >
                                  <MapPinOff size={10} /> + Placer
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

            {/* TAB 2: STRATEGIC ZONES LIST */}
            {activeTab === "zones" && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2.5">
                {/* Search & Actions */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <Input
                      value={zoneSearch}
                      onChange={(e) => setZoneSearch(e.target.value)}
                      placeholder="Filtrer les zones..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={onStartDrawZone}
                    className="h-8 px-2.5 gap-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-bold text-xs shrink-0"
                  >
                    <Plus size={13} />
                    <span>Tracer</span>
                  </Button>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-1">
                  <span>Trier par :</span>
                  <select
                    value={zoneSortBy}
                    onChange={(e) => setZoneSortBy(e.target.value as any)}
                    className="bg-transparent font-semibold text-[var(--foreground)] outline-none cursor-pointer"
                  >
                    <option value="area">Superficie (m²)</option>
                    <option value="properties">Nombre de biens</option>
                    <option value="priority">Priorité stratégique</option>
                    <option value="name">Nom alphabétique</option>
                  </select>
                </div>

                {/* Scrollable Zones List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {filteredZones.length === 0 ? (
                    <div className="p-6 text-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
                      <p>Aucune zone stratégique enregistrée.</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onStartDrawZone}
                        className="mt-2 text-xs"
                      >
                        Tracer votre première zone
                      </Button>
                    </div>
                  ) : (
                    filteredZones.map((zone) => {
                      const isSelected = selectedZoneId === zone.id;
                      const priorityColor =
                        zone.priority === "critical"
                          ? "bg-rose-500"
                          : zone.priority === "high"
                          ? "bg-amber-500"
                          : "bg-blue-500";

                      return (
                        <div
                          key={zone.id}
                          onClick={() => {
                            onSelectZone(zone);
                            onZoomToZone(zone);
                          }}
                          className={`p-2.5 rounded-[var(--radius-md)] border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]"
                              : "border-[var(--border)] hover:bg-[var(--border-subtle)] bg-[var(--background)]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: zone.color }}
                              />
                              <h5 className="font-bold text-xs truncate text-[var(--foreground)]">{zone.name}</h5>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleZoneVisibility(zone.id);
                                }}
                                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                                title={zone.isVisible ? "Masquer la zone" : "Afficher la zone"}
                              >
                                {zone.isVisible ? <Eye size={13} /> : <EyeOff size={13} className="text-slate-400" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mt-1.5 pt-1.5 border-t border-[var(--border)]/50">
                            <span className="font-mono">{formatArea(zone.areaM2)}</span>
                            <span className="font-semibold text-[var(--accent)]">
                              {zone.propertyIds?.length || 0} biens inclus
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: LAYERS & MAP STYLES */}
            {activeTab === "layers" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Layers Visibility Toggles */}
                <div className="space-y-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                    Visibilité des couches cartographiques
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { key: "properties", label: "Biens immobiliers géolocalisés" },
                      { key: "zones", label: "Zones stratégiques tracées" },
                      { key: "priceBadges", label: "Badges de prix sur les marqueurs" },
                      { key: "labels", label: "Noms des rues & repères urbains" },
                      { key: "buildings3d", label: "Extrusion 3D des bâtiments" },
                    ].map((layer) => {
                      const isChecked = layerSettings[layer.key as keyof typeof layerSettings];
                      return (
                        <label
                          key={layer.key}
                          className="flex items-center justify-between p-2 rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--border-subtle)] cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-xs">{layer.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleLayer(layer.key as any)}
                            className="rounded accent-[var(--accent)]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Map Styles Selector */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                    Style cartographique actif
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {MAP_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => onChangeMapStyle(style.id)}
                        className={`p-2 rounded-[var(--radius-md)] border text-left transition-all ${
                          activeMapStyle === style.id
                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)] font-bold text-[var(--accent)]"
                            : "border-[var(--border)] hover:bg-[var(--border-subtle)] text-[var(--foreground)]"
                        }`}
                      >
                        <div className="text-xs truncate">{style.name.split(" ")[0]}</div>
                        <div className="text-[10px] text-[var(--muted)] font-normal truncate">
                          {style.description.slice(0, 32)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
