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
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--surface)]/95 backdrop-blur-md p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg">
        {/* Location Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--background)] rounded-[var(--radius-md)] border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors w-44 sm:w-64">
            <Search size={14} className="text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Rechercher à Tanger (Malabata, Marshan...)"
              className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-xl overflow-hidden py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                Quartiers & Repères de Tanger
              </div>
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--border-subtle)] transition-colors flex flex-col gap-0.5 text-xs"
                >
                  <span className="font-semibold text-[var(--foreground)]">{loc.title}</span>
                  <span className="text-[11px] text-[var(--muted)]">{loc.subtitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[var(--border)] mx-1" />

        {/* Tool: Select / Pan */}
        <button
          type="button"
          onClick={() => onSelectMode("select")}
          title="Sélectionner / Naviguer (V)"
          className={`p-2 rounded-[var(--radius-md)] text-xs font-medium transition-all ${
            drawingMode === "select"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <MousePointer size={15} />
        </button>

        {/* Tool: Add Property Pin */}
        <button
          type="button"
          onClick={() => onSelectMode("add_property")}
          title="Ajouter un bien sur la carte"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-all ${
            drawingMode === "add_property"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Plus size={14} className="text-emerald-500" />
          <span className="hidden md:inline">Placer un bien</span>
        </button>

        <div className="h-5 w-px bg-[var(--border)] mx-1" />

        {/* Tool: Draw Polygon */}
        <button
          type="button"
          onClick={() => onSelectMode("draw_polygon")}
          title="Dessiner une zone polygonale"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all ${
            drawingMode === "draw_polygon"
              ? "bg-[var(--accent)] text-white shadow-xs"
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
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all ${
            drawingMode === "draw_rectangle"
              ? "bg-[var(--accent)] text-white shadow-xs"
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
          title="Dessiner un périmètre circulaire"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all ${
            drawingMode === "draw_radius"
              ? "bg-[var(--accent)] text-white shadow-xs"
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
          title="Mesurer une distance"
          className={`p-2 rounded-[var(--radius-md)] text-xs font-medium transition-all ${
            drawingMode === "measure"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Ruler size={15} />
        </button>

        {/* Drawing Active Cancel/Status */}
        {drawingMode !== "select" && (
          <div className="flex items-center gap-1 pl-1">
            <Badge variant="warning" className="text-[10px] animate-pulse">
              {drawingMode === "add_property"
                ? "Cliquez sur la carte"
                : drawingMode === "draw_polygon"
                ? `${activeDrawingVerticesCount} points`
                : "Traçage en cours"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelDrawing}
              className="h-6 px-1.5 text-[11px] text-[var(--muted)] hover:text-rose-500"
            >
              Annuler
            </Button>
          </div>
        )}
      </div>

      {/* Right section: Map Controls (Style, 2D/3D, Fullscreen) */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--surface)]/95 backdrop-blur-md p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg">
        {/* Style Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <Layers size={14} className="text-[var(--accent)]" />
            <span className="hidden sm:inline">{currentStyleMeta.name.split(" ")[0]}</span>
            <ChevronDown size={12} className="text-[var(--muted)]" />
          </button>

          {isStyleMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-60 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-xl overflow-hidden py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                Fonds de carte vectoriels
              </div>
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    onChangeMapStyle(style.id);
                    setIsStyleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-[var(--border-subtle)] transition-colors ${
                    activeMapStyle === style.id ? "bg-[var(--accent-subtle)] font-bold text-[var(--accent)]" : "text-[var(--foreground)]"
                  }`}
                >
                  <div>
                    <span className="block">{style.name}</span>
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
          title={is3dMode ? "Passer en vue 2D zénithale" : "Activer la perspective 3D avec relief"}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-colors ${
            is3dMode
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
          }`}
        >
          <Box size={14} />
          <span>{is3dMode ? "3D" : "2D"}</span>
        </button>

        {/* Reset Camera / North */}
        <button
          type="button"
          onClick={onResetBearing}
          title="Réinitialiser l'orientation vers le Nord"
          className="p-2 rounded-[var(--radius-md)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          <Compass size={15} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          className="p-2 rounded-[var(--radius-md)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>
    </div>
  );
}
