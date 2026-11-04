"use client";

import * as React from "react";
import * as turf from "@turf/turf";
import {
  MapProperty,
  StrategicZone,
  DrawingMode,
  MapStyleId,
  LocationSearchResult,
  PropertyFilterState,
  DEFAULT_PROPERTY_FILTER_STATE,
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
  validatePolygonGeometry,
  matchesPropertyFilters,
} from "@/lib/map/market-explorer-store";
import { MapCanvas } from "@/components/map/map-canvas";
import { TopToolbar } from "@/components/map/top-toolbar";
import { LeftPanel } from "@/components/map/left-panel";
import { RightPanel } from "@/components/map/right-panel";
import { AddPropertyModal } from "@/components/map/add-property-modal";
import { RelocatePropertyModal } from "@/components/map/relocate-property-modal";
import { PropertyFilterDialog } from "@/components/map/property-filter-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Compass, AlertCircle, CheckCircle2 } from "lucide-react";

export function MarketExplorerClient() {
  // 1. Core State (Properties, Zones, Workspace Settings)
  const [properties, setProperties] = React.useState<MapProperty[]>(() => loadSavedProperties());
  const [zones, setZones] = React.useState<StrategicZone[]>(() => loadSavedZones());
  const [workspaceSettings, setWorkspaceSettings] = React.useState(() => loadSavedWorkspaceSettings());

  // 2. UI & Selection State
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true);
  const [selectedProperty, setSelectedProperty] = React.useState<MapProperty | null>(null);
  const [selectedZone, setSelectedZone] = React.useState<StrategicZone | null>(null);
  const [draftZone, setDraftZone] = React.useState<Partial<StrategicZone> | null>(null);

  // 3. Drawing & Map Modes
  const [drawingMode, setDrawingMode] = React.useState<DrawingMode>("select");
  const [activeDrawingVerticesCount, setActiveDrawingVerticesCount] = React.useState(0);
  const [activeMapStyle, setActiveMapStyle] = React.useState<MapStyleId>(workspaceSettings.mapStyle);
  const [is3dMode, setIs3dMode] = React.useState(workspaceSettings.pitch > 10);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [cursorCoordinates, setCursorCoordinates] = React.useState<[number, number] | null>(null);

  // 4. Advanced Property Filters
  const [filters, setFilters] = React.useState<PropertyFilterState>(DEFAULT_PROPERTY_FILTER_STATE);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);

  // 5. Add Property Modal
  const [addPropertyModalOpen, setAddPropertyModalOpen] = React.useState(false);
  const [clickedMapCoordinates, setClickedMapCoordinates] = React.useState<[number, number] | null>(null);

  // 6. Relocate Property Modal
  const [propertyToRelocate, setPropertyToRelocate] = React.useState<MapProperty | null>(null);
  const [relocateModalOpen, setRelocateModalOpen] = React.useState(false);
  const [proposedCoordinates, setProposedCoordinates] = React.useState<[number, number] | null>(null);

  // 7. Surrounding Radius Highlight
  const [surroundingRadius, setSurroundingRadius] = React.useState<{
    center: [number, number];
    radiusMeters: number;
  } | null>(null);

  // 8. Notification Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // 9. Camera Navigation Target
  const [flyToTarget, setFlyToTarget] = React.useState<{
    center?: [number, number];
    zoom?: number;
    bounds?: [number, number, number, number];
    timestamp: number;
  } | null>(null);

  // 10. Layer settings
  const [layerSettings, setLayerSettings] = React.useState(workspaceSettings.layers);

  // Persistence to localStorage
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

  // Compute active filter criteria count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.transactionType !== "ALL") count++;
    if (filters.minPrice !== null || filters.maxPrice !== null) count++;
    if (filters.minSurface !== null || filters.maxSurface !== null) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.neighborhood) count++;
    if (filters.strategicZoneId) count++;
    if (filters.legalStatuses.length > 0) count++;
    return count;
  }, [filters]);

  // Compute filtered properties list
  const visibleProperties = React.useMemo(() => {
    return properties.filter((p) => matchesPropertyFilters(p, filters, zones));
  }, [properties, filters, zones]);

  // Handlers for Map selections
  const handleSelectProperty = (property: MapProperty) => {
    setSelectedZone(null);
    setDraftZone(null);
    setSelectedProperty(property);
    setSurroundingRadius(null);

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
    setSurroundingRadius(null);

    try {
      const bbox = turf.bbox(zone.geometry) as [number, number, number, number];
      setFlyToTarget({
        bounds: bbox,
        timestamp: Date.now(),
      });
    } catch {
      // fallback
    }
  };

  // Toggle Zone visibility
  const handleToggleZoneVisibility = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isVisible: !z.isVisible } : z))
    );
  };

  // Delete Zone without deleting properties
  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (selectedZone?.id === zoneId) setSelectedZone(null);

    // Call server API asynchronously
    fetch(`/api/zones?id=${zoneId}`, { method: "DELETE" }).catch(() => {});
    triggerToast("Zone stratégique supprimée. Vos biens immobiliers sont préservés.");
  };

  // Duplicate Zone
  const handleDuplicateZone = (zone: StrategicZone) => {
    const duplicated: StrategicZone = {
      ...zone,
      id: `zone-${Date.now()}`,
      name: `${zone.name} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setZones([duplicated, ...zones]);
    setSelectedZone(duplicated);
    triggerToast(`Zone "${duplicated.name}" dupliquée.`);
  };

  // Finish Drawing a Zone (Polygon, Rectangle, Circle)
  const handleFinishDrawZone = (geometry: GeoJSON.Polygon, areaM2: number) => {
    const validation = validatePolygonGeometry(geometry);
    if (!validation.valid) {
      triggerToast(`Tracé invalide : ${validation.error}`);
      return;
    }

    const insideProps = findPropertiesInPolygon(properties, geometry);
    const newDraft: Partial<StrategicZone> = {
      name: `Secteur Stratégique #${zones.length + 1}`,
      category: "haut_standing",
      priority: "high",
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
    triggerToast(
      `Périmètre délimité (${insideProps.length} biens identifiés). Renseignez les détails stratégiques.`
    );
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

      // Call API
      fetch("/api/zones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedZone.id, ...zoneData }),
      }).catch(() => {});

      triggerToast(`Zone "${zoneData.name}" mise à jour avec succès.`);
    } else if (draftZone && draftZone.geometry) {
      // Create new zone
      const newZone: StrategicZone = {
        id: `zone-${Date.now()}`,
        name: zoneData.name || "Nouvelle zone stratégique",
        category: zoneData.category || "haut_standing",
        priority: zoneData.priority || "high",
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

      // Call API
      fetch("/api/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newZone),
      }).catch(() => {});

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
              priority: zone.priority,
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
    if (propertyToRelocate) {
      // Propose new relocation coordinates
      setProposedCoordinates(coords);
      setRelocateModalOpen(true);
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

    // Automatically recalculate all affected strategic zones
    const syncedZones = synchronizeZonesWithProperties(zones, updatedProps);
    setZones(syncedZones);

    setSelectedProperty(newProp);
    if (newProp.longitude && newProp.latitude) {
      setFlyToTarget({
        center: [newProp.longitude, newProp.latitude],
        zoom: 16.5,
        timestamp: Date.now(),
      });
    }

    triggerToast(`Nouveau bien "${newProp.title}" épinglé sur la carte de Tanger.`);
  };

  // Start Move Property Mode
  const handleStartMoveProperty = (prop: MapProperty) => {
    setPropertyToRelocate(prop);
    setDrawingMode("add_property");
    triggerToast(`Cliquez sur la carte à l'endroit désiré pour repositionner le bien ${prop.reference}.`);
  };

  // Confirm Relocation
  const handleConfirmRelocation = (
    propertyId: string,
    newCoords: [number, number],
    precision: "exact" | "approximate",
    reason: string
  ) => {
    const [lng, lat] = newCoords;
    const updated = properties.map((p) =>
      p.id === propertyId ? { ...p, latitude: lat, longitude: lng, locationPrecision: precision } : p
    );
    setProperties(updated);

    // Recalculate zones
    const syncedZones = synchronizeZonesWithProperties(zones, updated);
    setZones(syncedZones);

    // Update selected property
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty({ ...selectedProperty, latitude: lat, longitude: lng, locationPrecision: precision });
    }

    setRelocateModalOpen(false);
    setPropertyToRelocate(null);
    setProposedCoordinates(null);

    setFlyToTarget({
      center: [lng, lat],
      zoom: 16.5,
      timestamp: Date.now(),
    });

    triggerToast(`Emplacement du bien mis à jour avec audit (${reason}).`);
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
          setPropertyToRelocate(null);
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
          setPropertyToRelocate(null);
        }}
        onFinishPolygonDrawing={() => {
          // Triggers map canvas double-click behavior
        }}
        onOpenAdvancedFilters={() => setIsFilterDialogOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Map WebGL Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapCanvas
          properties={visibleProperties}
          zones={zones}
          selectedProperty={selectedProperty}
          selectedZone={selectedZone}
          drawingMode={drawingMode}
          activeMapStyle={activeMapStyle}
          is3dMode={is3dMode}
          layerSettings={layerSettings}
          flyToTarget={flyToTarget}
          highlightSurroundingCircle={surroundingRadius}
          onSelectProperty={handleSelectProperty}
          onSelectZone={handleSelectZone}
          onFinishDrawZone={handleFinishDrawZone}
          onMapClickAddProperty={handleMapClickAddProperty}
          onCursorMove={setCursorCoordinates}
          onUpdateDrawingVerticesCount={setActiveDrawingVerticesCount}
        />
      </div>

      {/* Collapsible Left Panel */}
      <LeftPanel
        isOpen={leftPanelOpen}
        onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
        properties={visibleProperties}
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
          triggerToast("Mode tracé activé. Posez les sommets sur la carte.");
        }}
        onPlacePropertyOnMap={handleStartMoveProperty}
        activeMapStyle={activeMapStyle}
        onChangeMapStyle={(style) => {
          setActiveMapStyle(style);
          saveWorkspaceSettingsToStorage({ ...workspaceSettings, mapStyle: style });
        }}
        layerSettings={layerSettings}
        onToggleLayer={handleToggleLayer}
        onOpenAdvancedFilters={() => setIsFilterDialogOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Collapsible Right Contextual Panel */}
      <RightPanel
        selectedProperty={selectedProperty}
        selectedZone={selectedZone}
        isDrawingZoneActive={drawingMode.startsWith("draw_")}
        draftZone={draftZone}
        allZones={zones}
        properties={properties}
        onClose={() => {
          setSelectedProperty(null);
          setSelectedZone(null);
          setDraftZone(null);
          setSurroundingRadius(null);
        }}
        onZoomToProperty={(prop) => {
          handleSelectProperty(prop);
          triggerToast(`Centrage sur ${prop.title}`);
        }}
        onZoomToZone={(zone) => {
          handleSelectZone(zone);
          triggerToast(`Centrage sur ${zone.name}`);
        }}
        onSelectProperty={handleSelectProperty}
        onSelectZone={handleSelectZone}
        onSaveZone={handleSaveZone}
        onDeleteZone={handleDeleteZone}
        onDuplicateZone={handleDuplicateZone}
        onExportZoneGeoJSON={handleExportZoneGeoJSON}
        onStartMovePropertyLocation={handleStartMoveProperty}
        onHighlightSurroundingRadius={(center, radius) => {
          setSurroundingRadius({ center, radiusMeters: radius });
          triggerToast(`Rayon de ${radius} mètres affiché.`);
        }}
        onStartEditZoneVertices={(zone) => {
          triggerToast(`Modification des contours de ${zone.name}`);
        }}
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

      {/* Modal: Relocate Property Confirmation & History */}
      <RelocatePropertyModal
        isOpen={relocateModalOpen}
        property={propertyToRelocate}
        newCoordinates={proposedCoordinates}
        onConfirm={handleConfirmRelocation}
        onCancel={() => {
          setRelocateModalOpen(false);
          setPropertyToRelocate(null);
          setProposedCoordinates(null);
        }}
      />

      {/* Dialog: Advanced Property Filters */}
      <PropertyFilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          triggerToast("Filtres cartographiques appliqués.");
        }}
        properties={properties}
        zones={zones}
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
            <span className="font-mono">35.7590° N, -5.8130° W</span>
          )}
        </div>

        {/* Active Tool Help Pill */}
        {drawingMode !== "select" && (
          <div className="pointer-events-auto bg-black/85 text-white px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1.5 animate-in fade-in">
            <Compass size={13} className="text-amber-400" />
            <span>
              {drawingMode === "add_property"
                ? propertyToRelocate
                  ? "Cliquez sur la carte pour choisir le nouvel emplacement du bien"
                  : "Cliquez à l'endroit désiré sur la carte pour épingler le bien"
                : drawingMode === "draw_polygon"
                ? "Cliquez pour poser les sommets. Double-cliquez pour clore le polygone"
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
