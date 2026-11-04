"use client";

import * as React from "react";
import {
  MousePointer,
  Plus,
  Square,
  Circle,
  Ruler,
  Layers,
  Box,
  Maximize2,
  Minimize2,
  Search,
  Check,
  ChevronDown,
  Pentagon,
  RotateCcw,
  Compass,
  Filter,
  CheckCircle2,
  Undo2,
} from "lucide-react";
import { DrawingMode, MapStyleId, LocationSearchResult } from "@/lib/map/map-types";
import { MAP_STYLES, TANGIER_LOCATION_INDEX } from "@/lib/map/market-explorer-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopToolbarProps {
  drawingMode: DrawingMode;
  onSelectMode: (mode: DrawingMode) => void;
  activeMapStyle: MapStyleId;
  onChangeMapStyle: (styleId: MapStyleId) => void;
  is3dMode: boolean;
  onToggle3d: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetBearing: () => void;
  onSearchResultSelect: (result: LocationSearchResult) => void;
  activeDrawingVerticesCount?: number;
  onCancelDrawing?: () => void;
  onFinishPolygonDrawing?: () => void;
  onOpenAdvancedFilters?: () => void;
  activeFilterCount?: number;
}

export function TopToolbar({
  drawingMode,
  onSelectMode,
  activeMapStyle,
  onChangeMapStyle,
  is3dMode,
  onToggle3d,
  isFullscreen,
  onToggleFullscreen,
  onResetBearing,
  onSearchResultSelect,
  activeDrawingVerticesCount = 0,
  onCancelDrawing,
  onFinishPolygonDrawing,
  onOpenAdvancedFilters,
  activeFilterCount = 0,
}: TopToolbarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = React.useState(false);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return TANGIER_LOCATION_INDEX.filter(
      (loc) => loc.title.toLowerCase().includes(q) || loc.subtitle.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    onSearchResultSelect(loc);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const currentStyleMeta = MAP_STYLES.find((s) => s.id === activeMapStyle) || MAP_STYLES[0];

  return (
    <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2">
      {/* Left section: Search & Drawing Modes */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--surface)]/95 backdrop-blur-md p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg text-xs">
        {/* Location Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--background)] rounded-[var(--radius-md)] border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors w-40 sm:w-56">
            <Search size={13} className="text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Rechercher à Tanger..."
              className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-68 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                Quartiers & Repères de Tanger
              </div>
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--border-subtle)] transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-[var(--foreground)]">{loc.title}</span>
                  <span className="text-[11px] text-[var(--muted)]">{loc.subtitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[var(--border)] mx-0.5" />

        {/* Tool: Select / Pan */}
        <button
          type="button"
          onClick={() => onSelectMode("select")}
          title="Sélectionner / Naviguer (V)"
          className={`p-2 rounded-[var(--radius-md)] transition-all ${
            drawingMode === "select"
              ? "bg-[var(--accent)] text-white shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <MousePointer size={14} />
        </button>

        {/* Tool: Add Property Pin */}
        <button
          type="button"
          onClick={() => onSelectMode("add_property")}
          title="Placer un nouveau bien directement sur la carte"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] font-bold transition-all ${
            drawingMode === "add_property"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Plus size={14} className={drawingMode === "add_property" ? "text-white" : "text-emerald-500"} />
          <span className="hidden md:inline">+ Placer un bien</span>
        </button>

        <div className="h-5 w-px bg-[var(--border)] mx-0.5" />

        {/* Tool: Draw Polygon */}
        <button
          type="button"
          onClick={() => onSelectMode("draw_polygon")}
          title="Dessiner une zone polygonale personnalisée"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-all ${
            drawingMode === "draw_polygon"
              ? "bg-[var(--accent)] text-white shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Pentagon size={14} />
          <span className="hidden md:inline">Polygone</span>
        </button>

        {/* Tool: Draw Rectangle */}
        <button
          type="button"
          onClick={() => onSelectMode("draw_rectangle")}
          title="Dessiner une zone rectangulaire"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-all ${
            drawingMode === "draw_rectangle"
              ? "bg-[var(--accent)] text-white shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Square size={14} />
          <span className="hidden lg:inline">Rectangle</span>
        </button>

        {/* Tool: Draw Radius */}
        <button
          type="button"
          onClick={() => onSelectMode("draw_radius")}
          title="Délimiter un périmètre circulaire / rayon"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-all ${
            drawingMode === "draw_radius"
              ? "bg-[var(--accent)] text-white shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Circle size={14} />
          <span className="hidden lg:inline">Rayon</span>
        </button>

        {/* Tool: Measure Distance */}
        <button
          type="button"
          onClick={() => onSelectMode("measure")}
          title="Mesurer une distance géodésique sur le terrain"
          className={`p-2 rounded-[var(--radius-md)] transition-all ${
            drawingMode === "measure"
              ? "bg-[var(--accent)] text-white shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Ruler size={14} />
        </button>

        {/* Active Drawing Actions (Vertices count, Terminer, Annuler) */}
        {drawingMode !== "select" && (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--border)]">
            <Badge variant="warning" className="text-[10px] animate-pulse">
              {drawingMode === "add_property"
                ? "Cliquez sur la carte"
                : drawingMode === "draw_polygon"
                ? `${activeDrawingVerticesCount} sommets`
                : "Tracé en cours"}
            </Badge>

            {drawingMode === "draw_polygon" && activeDrawingVerticesCount >= 3 && onFinishPolygonDrawing && (
              <Button
                size="sm"
                variant="outline"
                onClick={onFinishPolygonDrawing}
                className="h-6 px-2 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 border-0"
              >
                <CheckCircle2 size={11} className="mr-1" />
                Terminer
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelDrawing}
              className="h-6 px-1.5 text-[10px] text-[var(--muted)] hover:text-rose-500"
            >
              Annuler
            </Button>
          </div>
        )}
      </div>

      {/* Right section: Filters, Style, 2D/3D, Fullscreen */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--surface)]/95 backdrop-blur-md p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg text-xs">
        {/* Advanced Filters Trigger */}
        {onOpenAdvancedFilters && (
          <button
            type="button"
            onClick={onOpenAdvancedFilters}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] font-medium transition-colors ${
              activeFilterCount > 0
                ? "bg-[var(--accent)] text-white font-bold"
                : "text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
            }`}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filtres</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[var(--accent)] text-[10px] font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        <div className="h-5 w-px bg-[var(--border)] mx-0.5" />

        {/* Style Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] font-medium text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <Layers size={13} className="text-[var(--accent)]" />
            <span className="hidden md:inline">{currentStyleMeta.name.split(" ")[0]}</span>
            <ChevronDown size={12} className="text-[var(--muted)]" />
          </button>

          {isStyleMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                Fonds de carte vectoriels & satellite
              </div>
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    onChangeMapStyle(style.id);
                    setIsStyleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--border-subtle)] transition-colors ${
                    activeMapStyle === style.id
                      ? "bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{style.name}</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">{style.description}</span>
                  </div>
                  {activeMapStyle === style.id && <Check size={14} className="text-[var(--accent)] shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2D / 3D Perspective Toggle */}
        <button
          type="button"
          onClick={onToggle3d}
          title={is3dMode ? "Passer en vue 2D zénithale" : "Activer la perspective 3D avec relief urbain"}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] font-bold transition-colors ${
            is3dMode
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Box size={13} />
          <span>{is3dMode ? "3D" : "2D"}</span>
        </button>

        {/* Reset North / Bearing */}
        <button
          type="button"
          onClick={onResetBearing}
          title="Réinitialiser l'orientation vers le Nord et centrer Tanger"
          className="p-2 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          <Compass size={14} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          className="p-2 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );
}
