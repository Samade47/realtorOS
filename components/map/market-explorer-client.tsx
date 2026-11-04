"use client";

import * as React from "react";
import * as turf from "@turf/turf";
import {
  MapProperty,
  StrategicZone,
  DrawingMode,
  MapStyleId,
  LocationSearchResult,
} from "@/lib/map/map-types";
import {
  INITIAL_MAP_PROPERTIES,
  INITIAL_STRATEGIC_ZONES,
  DEFAULT_WORKSPACE_SETTINGS,
  loadSavedProperties,
  savePropertiesToStorage,
  loadSavedZones,
  saveZonesToStorage,
  loadSavedWorkspaceSettings,
  saveWorkspaceSettingsToStorage,
  findPropertiesInPolygon,
  synchronizeZonesWithProperties,
} from "@/lib/map/market-explorer-store";
import { MapCanvas } from "@/components/map/map-canvas";
import { TopToolbar } from "@/components/map/top-toolbar";
import { LeftPanel } from "@/components/map/left-panel";
import { RightPanel } from "@/components/map/right-panel";
import { AddPropertyModal } from "@/components/map/add-property-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Compass, AlertCircle, CheckCircle2 } from "lucide-react";

export function MarketExplorerClient() {
  // Load workspace state from storage / defaults
  const [properties, setProperties] = React.useState<MapProperty[]>(() => loadSavedProperties());
  const [zones, setZones] = React.useState<StrategicZone[]>(() => loadSavedZones());
  const [workspaceSettings, setWorkspaceSettings] = React.useState(() => loadSavedWorkspaceSettings());

  // UI & Panels state
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true);
  const [selectedProperty, setSelectedProperty] = React.useState<MapProperty | null>(null);
  const [selectedZone, setSelectedZone] = React.useState<StrategicZone | null>(null);
  const [draftZone, setDraftZone] = React.useState<Partial<StrategicZone> | null>(null);

  // Drawing & Map Modes
  const [drawingMode, setDrawingMode] = React.useState<DrawingMode>("select");
  const [activeDrawingVerticesCount, setActiveDrawingVerticesCount] = React.useState(0);
  const [activeMapStyle, setActiveMapStyle] = React.useState<MapStyleId>(workspaceSettings.mapStyle);
  const [is3dMode, setIs3dMode] = React.useState(workspaceSettings.pitch > 10);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [cursorCoordinates, setCursorCoordinates] = React.useState<[number, number] | null>(null);

  // Add Property placement modal state
  const [addPropertyModalOpen, setAddPropertyModalOpen] = React.useState(false);
  const [clickedMapCoordinates, setClickedMapCoordinates] = React.useState<[number, number] | null>(null);

  // Move existing property state
  const [propertyToMove, setPropertyToMove] = React.useState<MapProperty | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Camera navigation target
  const [flyToTarget, setFlyToTarget] = React.useState<{
    center?: [number, number];
    zoom?: number;
    bounds?: [number, number, number, number];
    timestamp: number;
  } | null>(null);

  // Layer settings
  const [layerSettings, setLayerSettings] = React.useState(workspaceSettings.layers);

  // Save changes to localStorage
  React.useEffect(() => {
    savePropertiesToStorage(properties);
  }, [properties]);

  React.useEffect(() => {
    saveZonesToStorage(zones);
  }, [zones]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compute matching properties for selected or draft zone
  const matchingPropertiesInZone = React.useMemo(() => {
    const targetZone = selectedZone || draftZone;
    if (!targetZone || !targetZone.geometry) return [];
    return findPropertiesInPolygon(properties, targetZone.geometry as GeoJSON.Polygon);
  }, [selectedZone, draftZone, properties]);

  // Handlers for Map selections
  const handleSelectProperty = (property: MapProperty) => {
    setSelectedZone(null);
    setDraftZone(null);
    setSelectedProperty(property);
    if (property.longitude !== undefined && property.latitude !== undefined) {
      setFlyToTarget({
        center: [property.longitude, property.latitude],
        zoom: 16,
        timestamp: Date.now(),
      });
    }
  };

  const handleSelectZone = (zone: StrategicZone) => {
    setSelectedProperty(null);
    setDraftZone(null);
    setSelectedZone(zone);
    try {
      const bbox = turf.bbox(zone.geometry) as [number, number, number, number];
      setFlyToTarget({
        bounds: bbox,
        timestamp: Date.now(),
      });
    } catch {
      // ignore
    }
  };

  // Toggle Zone visibility
  const handleToggleZoneVisibility = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isVisible: !z.isVisible } : z))
    );
  };

  // Delete Zone
  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (selectedZone?.id === zoneId) setSelectedZone(null);
    triggerToast("Zone stratégique supprimée.");
  };

  // Finish Drawing a Zone (Polygon, Rectangle, Circle)
  const handleFinishDrawZone = (geometry: GeoJSON.Polygon, areaM2: number) => {
    const insideProps = findPropertiesInPolygon(properties, geometry);
    const newDraft: Partial<StrategicZone> = {
      name: `Secteur Stratégique #${zones.length + 1}`,
      category: "haut_standing",
      geometry,
      areaM2,
      color: "#2563eb",
      isVisible: true,
      tags: ["Prospection"],
      propertyIds: insideProps.map((p) => p.id),
    };

    setDraftZone(newDraft);
    setSelectedProperty(null);
    setSelectedZone(null);
    setDrawingMode("select");
    triggerToast(`Périmètre délimité (${insideProps.length} biens identifiés). Donnez un nom à votre zone.`);
  };

  // Save Strategic Zone
  const handleSaveZone = (zoneData: Partial<StrategicZone>) => {
    if (selectedZone) {
      // Edit existing zone
      const updated = zones.map((z) =>
        z.id === selectedZone.id ? { ...z, ...zoneData, updatedAt: new Date().toISOString() } : z
      );
      setZones(updated);
      setSelectedZone({ ...selectedZone, ...zoneData });
      triggerToast(`Zone "${zoneData.name}" mise à jour.`);
    } else if (draftZone && draftZone.geometry) {
      // Create new zone
      const newZone: StrategicZone = {
        id: `zone-${Date.now()}`,
        name: zoneData.name || "Nouvelle zone",
        category: zoneData.category || "haut_standing",
        description: zoneData.description || "",
        geometry: draftZone.geometry as GeoJSON.Polygon,
        areaM2: draftZone.areaM2 || 0,
        color: zoneData.color || "#2563eb",
        isVisible: true,
        tags: zoneData.tags || [],
        notes: zoneData.notes || "",
        propertyIds: draftZone.propertyIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setZones([newZone, ...zones]);
      setDraftZone(null);
      setSelectedZone(newZone);
      triggerToast(`Zone "${newZone.name}" enregistrée avec succès.`);
    }
  };

  // Export GeoJSON
  const handleExportZoneGeoJSON = (zone: StrategicZone) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            type: "Feature",
            properties: {
              name: zone.name,
              category: zone.category,
              areaM2: zone.areaM2,
              notes: zone.notes,
            },
            geometry: zone.geometry,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${zone.name.replace(/\s+/g, "_")}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Fichier GeoJSON exporté.");
  };

  // Map Click when Add Property mode is active
  const handleMapClickAddProperty = (coords: [number, number]) => {
    if (propertyToMove) {
      // Moving existing property coordinates
      const [lng, lat] = coords;
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyToMove.id ? { ...p, latitude: lat, longitude: lng } : p))
      );
      triggerToast(`Coordonnées du bien ${propertyToMove.reference} mises à jour.`);
      setPropertyToMove(null);
      setDrawingMode("select");
    } else {
      // Adding new property
      setClickedMapCoordinates(coords);
      setAddPropertyModalOpen(true);
      setDrawingMode("select");
    }
  };

  // Save new property from map modal
  const handleSavePropertyFromMap = (newPropData: Partial<MapProperty>) => {
    const newProp = newPropData as MapProperty;
    const updatedProps = [newProp, ...properties];
    setProperties(updatedProps);

    // Synchronize zones
    const syncedZones = synchronizeZonesWithProperties(zones, updatedProps);
    setZones(syncedZones);

    setSelectedProperty(newProp);
    triggerToast(`Nouveau bien "${newProp.title}" épinglé sur la carte.`);
  };

  // Start Move Property Mode
  const handleStartMoveProperty = (prop: MapProperty) => {
    setPropertyToMove(prop);
    setDrawingMode("add_property");
    triggerToast(`Cliquez sur la carte pour repositionner le bien ${prop.reference}.`);
  };

  // Toggle Layer
  const handleToggleLayer = (layerKey: "properties" | "zones" | "priceBadges" | "labels" | "buildings3d") => {
    const updated = {
      ...layerSettings,
      [layerKey]: !layerSettings[layerKey],
    };
    setLayerSettings(updated);
    saveWorkspaceSettingsToStorage({
      ...workspaceSettings,
      layers: updated,
    });
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[var(--background)] flex flex-col select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Top Toolbar */}
      <TopToolbar
        drawingMode={drawingMode}
        onSelectMode={(mode) => {
          setPropertyToMove(null);
          setDrawingMode(mode);
        }}
        activeMapStyle={activeMapStyle}
        onChangeMapStyle={(style) => {
          setActiveMapStyle(style);
          saveWorkspaceSettingsToStorage({ ...workspaceSettings, mapStyle: style });
        }}
        is3dMode={is3dMode}
        onToggle3d={() => setIs3dMode(!is3dMode)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onResetBearing={() => {
          setFlyToTarget({
            center: [-5.813, 35.759],
            zoom: 12.8,
            timestamp: Date.now(),
          });
          triggerToast("Orientation et centrage réinitialisés sur Tanger.");
        }}
        onSearchResultSelect={(loc) => {
          setFlyToTarget({
            center: loc.coordinates,
            zoom: loc.zoom || 15,
            timestamp: Date.now(),
          });
          triggerToast(`Navigation vers ${loc.title}...`);
        }}
        activeDrawingVerticesCount={activeDrawingVerticesCount}
        onCancelDrawing={() => {
          setDrawingMode("select");
          setPropertyToMove(null);
        }}
      />

      {/* Map WebGL Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapCanvas
          properties={properties}
          zones={zones}
          selectedProperty={selectedProperty}
          selectedZone={selectedZone}
          drawingMode={drawingMode}
          activeMapStyle={activeMapStyle}
          is3dMode={is3dMode}
          layerSettings={layerSettings}
          flyToTarget={flyToTarget}
          onSelectProperty={handleSelectProperty}
          onSelectZone={handleSelectZone}
          onFinishDrawZone={handleFinishDrawZone}
          onMapClickAddProperty={handleMapClickAddProperty}
          onCursorMove={setCursorCoordinates}
          onUpdateDrawingVerticesCount={setActiveDrawingVerticesCount}
        />
      </div>

      {/* Collapsible Left Panel (Properties, Zones, Layers) */}
      <LeftPanel
        isOpen={leftPanelOpen}
        onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
        properties={properties}
        zones={zones}
        selectedPropertyId={selectedProperty?.id}
        selectedZoneId={selectedZone?.id}
        onSelectProperty={handleSelectProperty}
        onSelectZone={handleSelectZone}
        onToggleZoneVisibility={handleToggleZoneVisibility}
        onDeleteZone={handleDeleteZone}
        onZoomToZone={(zone) => {
          handleSelectZone(zone);
          triggerToast(`Centrage sur la zone ${zone.name}`);
        }}
        onStartDrawZone={() => {
          setDrawingMode("draw_polygon");
          triggerToast("Mode tracé activé. Cliquez sur la carte pour poser les sommets.");
        }}
        onPlacePropertyOnMap={handleStartMoveProperty}
        layerSettings={layerSettings}
        onToggleLayer={handleToggleLayer}
      />

      {/* Collapsible Right Contextual Panel (Property Details or Zone Details) */}
      <RightPanel
        selectedProperty={selectedProperty}
        selectedZone={selectedZone}
        isDrawingZoneActive={drawingMode.startsWith("draw_")}
        draftZone={draftZone}
        matchingPropertiesInZone={matchingPropertiesInZone}
        onClose={() => {
          setSelectedProperty(null);
          setSelectedZone(null);
          setDraftZone(null);
        }}
        onZoomToProperty={(prop) => {
          handleSelectProperty(prop);
          triggerToast(`Centrage sur ${prop.title}`);
        }}
        onZoomToZone={(zone) => {
          handleSelectZone(zone);
          triggerToast(`Centrage sur ${zone.name}`);
        }}
        onSaveZone={handleSaveZone}
        onDeleteZone={handleDeleteZone}
        onExportZoneGeoJSON={handleExportZoneGeoJSON}
        onStartMovePropertyLocation={handleStartMoveProperty}
      />

      {/* Modal: Add Property directly on Map */}
      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => {
          setAddPropertyModalOpen(false);
          setClickedMapCoordinates(null);
        }}
        coordinates={clickedMapCoordinates}
        onSaveProperty={handleSavePropertyFromMap}
      />

      {/* Bottom Status & Coordinates Bar */}
      <div className="absolute bottom-2 left-3 right-3 z-10 pointer-events-none flex items-center justify-between text-[11px] text-[var(--muted)]">
        <div className="pointer-events-auto flex items-center gap-2 bg-[var(--surface)]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[var(--border)] shadow-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[var(--foreground)]">Tanger, Maroc</span>
          <span>•</span>
          {cursorCoordinates ? (
            <span className="font-mono">
              {cursorCoordinates[1].toFixed(5)}° N, {cursorCoordinates[0].toFixed(5)}° W
            </span>
          ) : (
            <span className="font-mono">35.7741° N, -5.8130° W</span>
          )}
        </div>

        {/* Active Tool Help Pill */}
        {drawingMode !== "select" && (
          <div className="pointer-events-auto bg-black/80 text-white px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1.5 animate-in fade-in">
            <Compass size={13} className="text-amber-400" />
            <span>
              {drawingMode === "add_property"
                ? "Cliquez à l'endroit désiré sur la carte pour épingler le bien"
                : drawingMode === "draw_polygon"
                ? "Cliquez pour ajouter des sommets. Double-cliquez pour clore le polygone"
                : drawingMode === "draw_rectangle"
                ? "Cliquez deux coins opposés pour tracer le rectangle"
                : drawingMode === "draw_radius"
                ? "Cliquez le centre puis déplacez pour définir le rayon"
                : "Cliquez deux points pour mesurer la distance"}
            </span>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-2 bg-[var(--surface)]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[var(--border)] shadow-sm">
          <span>{is3dMode ? "Perspective 3D (45°)" : "Vue 2D Zénithale"}</span>
          <span>•</span>
          <span>EPSG:4326</span>
        </div>
      </div>
    </div>
  );
}
