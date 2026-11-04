"use client";

import * as React from "react";
import * as turf from "@turf/turf";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapProperty,
  StrategicZone,
  DrawingMode,
  MapStyleId,
  MeasureResult,
} from "@/lib/map/map-types";
import {
  MAP_STYLES,
  createCirclePolygon,
  createRectanglePolygon,
  calculateGeometryArea,
  formatArea,
} from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Utility to check WebGL availability
function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          (canvas as any).getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface FlyToTarget {
  center?: [number, number];
  zoom?: number;
  bounds?: [number, number, number, number];
  timestamp: number;
}

interface MapCanvasProps {
  properties: MapProperty[];
  zones: StrategicZone[];
  selectedProperty: MapProperty | null;
  selectedZone: StrategicZone | null;
  drawingMode: DrawingMode;
  activeMapStyle: MapStyleId;
  is3dMode: boolean;
  layerSettings: {
    properties: boolean;
    zones: boolean;
    priceBadges: boolean;
    labels: boolean;
    buildings3d: boolean;
  };
  flyToTarget?: FlyToTarget | null;
  onSelectProperty: (property: MapProperty) => void;
  onSelectZone: (zone: StrategicZone) => void;
  onFinishDrawZone: (geometry: GeoJSON.Polygon, areaM2: number) => void;
  onMapClickAddProperty: (coordinates: [number, number]) => void;
  onUpdatePropertyCoordinates?: (propertyId: string, coordinates: [number, number]) => void;
  onCursorMove?: (coordinates: [number, number] | null) => void;
  onUpdateDrawingVerticesCount?: (count: number) => void;
}

export function MapCanvas({
  properties,
  zones,
  selectedProperty,
  selectedZone,
  drawingMode,
  activeMapStyle,
  is3dMode,
  layerSettings,
  flyToTarget,
  onSelectProperty,
  onSelectZone,
  onFinishDrawZone,
  onMapClickAddProperty,
  onUpdatePropertyCoordinates,
  onCursorMove,
  onUpdateDrawingVerticesCount,
}: MapCanvasProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<maplibregl.Map | null>(null);
  const markersRef = React.useRef<maplibregl.Marker[]>([]);

  // State for rendering lifecycle & diagnostics
  const [webGLSupported, setWebGLSupported] = React.useState<boolean>(true);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = React.useState<boolean>(true);
  const [reloadKey, setReloadKey] = React.useState<number>(0);

  // Drawing in progress state
  const [drawingPoints, setDrawingPoints] = React.useState<[number, number][]>([]);
  const [dragStartPoint, setDragStartPoint] = React.useState<[number, number] | null>(null);
  const [currentMousePos, setCurrentMousePos] = React.useState<[number, number] | null>(null);
  const [measureResult, setMeasureResult] = React.useState<MeasureResult | null>(null);

  // Hovered tooltip state
  const [hoveredProperty, setHoveredProperty] = React.useState<{
    property: MapProperty;
    x: number;
    y: number;
  } | null>(null);

  // Setup Strategic Zone Sources & Layers
  const setupZoneLayers = React.useCallback(
    (map: maplibregl.Map) => {
      if (!map.isStyleLoaded()) return;

      if (!map.getSource("strategic-zones-source")) {
        map.addSource("strategic-zones-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
      }

      if (!map.getLayer("strategic-zones-fill")) {
        map.addLayer({
          id: "strategic-zones-fill",
          type: "fill",
          source: "strategic-zones-source",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.22,
          },
        });

        // Click on strategic zone
        map.on("click", "strategic-zones-fill", (e: any) => {
          if (drawingMode !== "select") return;
          if (e.features && e.features[0]) {
            const zoneId = e.features[0].properties.id;
            const clickedZone = zones.find((z) => z.id === zoneId);
            if (clickedZone) onSelectZone(clickedZone);
          }
        });

        map.on("mouseenter", "strategic-zones-fill", () => {
          if (drawingMode === "select") map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "strategic-zones-fill", () => {
          if (drawingMode === "select") map.getCanvas().style.cursor = "";
        });
      }

      if (!map.getLayer("strategic-zones-stroke")) {
        map.addLayer({
          id: "strategic-zones-stroke",
          type: "line",
          source: "strategic-zones-source",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2.5,
            "line-opacity": 0.9,
          },
        });
      }
    },
    [drawingMode, zones, onSelectZone]
  );

  // Setup Active Drawing Sources & Layers
  const setupDrawingLayers = React.useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    if (!map.getSource("drawing-source")) {
      map.addSource("drawing-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }

    if (!map.getLayer("drawing-fill")) {
      map.addLayer({
        id: "drawing-fill",
        type: "fill",
        source: "drawing-source",
        paint: {
          "fill-color": "#2563eb",
          "fill-opacity": 0.18,
        },
      });
    }

    if (!map.getLayer("drawing-line")) {
      map.addLayer({
        id: "drawing-line",
        type: "line",
        source: "drawing-source",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    }

    if (!map.getLayer("drawing-points")) {
      map.addLayer({
        id: "drawing-points",
        type: "circle",
        source: "drawing-source",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 5,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#2563eb",
          "circle-stroke-width": 2,
        },
      });
    }
  }, []);

  // Sync Strategic Zones GeoJSON with Map
  const updateZonesGeoJSON = React.useCallback(
    (map: maplibregl.Map) => {
      if (!map || !map.isStyleLoaded()) return;
      const source = map.getSource("strategic-zones-source") as maplibregl.GeoJSONSource | undefined;
      if (!source) return;

      const visibleZones = zones.filter((z) => z.isVisible && layerSettings.zones);
      const featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: visibleZones.map((zone) => ({
          type: "Feature",
          properties: {
            id: zone.id,
            name: zone.name,
            color: zone.color,
            category: zone.category,
            areaM2: zone.areaM2,
            isSelected: selectedZone?.id === zone.id,
          },
          geometry: zone.geometry,
        })),
      };

      source.setData(featureCollection);
    },
    [zones, selectedZone, layerSettings.zones]
  );

  // Toggle 3D buildings if layer exists in current style
  const update3DBuildings = React.useCallback((map: maplibregl.Map, enabled: boolean) => {
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer("building-3d")) {
      map.setLayoutProperty("building-3d", "visibility", enabled ? "visible" : "none");
    }
  }, []);

  // Initialize MapLibre GL instance
  React.useEffect(() => {
    let isCancelled = false;

    // 1. WebGL validation
    const hasWebGL = isWebGLSupported();
    setWebGLSupported(hasWebGL);
    if (!hasWebGL) {
      setIsMapLoading(false);
      return;
    }

    if (!mapContainerRef.current) return;

    // Clean up any existing instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    setIsMapLoading(true);
    setMapError(null);

    try {
      // 2. Explicitly configure worker URL to prevent 404
      const workerUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/maplibre-gl-worker.mjs`
          : "/maplibre-gl-worker.mjs";
      maplibregl.setWorkerUrl(workerUrl);

      const currentStyle = MAP_STYLES.find((s) => s.id === activeMapStyle) || MAP_STYLES[0];

      // 3. Initialize map centered on Tangier (-5.813, 35.759)
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: currentStyle.styleUrl,
        center: [-5.813, 35.759],
        zoom: 12.8,
        pitch: is3dMode ? 45 : 0,
        bearing: -10,
        attributionControl: false,
      });

      // Controls
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

      // Error event handling
      map.on("error", (e) => {
        console.warn("MapLibre runtime notification:", e);
        if (e?.error?.message && e.error.message.includes("WebGL")) {
          setMapError("Erreur d'initialisation du contexte graphique WebGL.");
        }
      });

      // Map loaded successfully
      map.on("load", () => {
        if (isCancelled) return;
        mapInstanceRef.current = map;
        setIsMapLoading(false);
        map.resize();

        setupZoneLayers(map);
        setupDrawingLayers(map);
        updateZonesGeoJSON(map);
        update3DBuildings(map, is3dMode && layerSettings.buildings3d);
      });

      // Live cursor coordinates tracking
      map.on("mousemove", (e) => {
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setCurrentMousePos(coords);
        onCursorMove?.(coords);
      });

      map.getContainer().addEventListener("mouseleave", () => {
        onCursorMove?.(null);
      });
    } catch (err: any) {
      console.error("Map initialization exception:", err);
      setMapError(err?.message || "Impossible d'initialiser le moteur cartographique.");
      setIsMapLoading(false);
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reloadKey]);

  // Robust container resizing using ResizeObserver
  React.useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });

    observer.observe(container);

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  // Update Map Style when changed
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const styleMeta = MAP_STYLES.find((s) => s.id === activeMapStyle) || MAP_STYLES[0];
    map.setStyle(styleMeta.styleUrl);

    map.once("style.load", () => {
      map.resize();
      setupZoneLayers(map);
      setupDrawingLayers(map);
      updateZonesGeoJSON(map);
      update3DBuildings(map, is3dMode && layerSettings.buildings3d);
    });
  }, [activeMapStyle, setupZoneLayers, setupDrawingLayers, updateZonesGeoJSON, update3DBuildings, is3dMode, layerSettings.buildings3d]);

  // Update Pitch & 3D Buildings when 2D/3D mode toggled
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({
      pitch: is3dMode ? 45 : 0,
      duration: 500,
    });
    update3DBuildings(map, is3dMode && layerSettings.buildings3d);
  }, [is3dMode, layerSettings.buildings3d, update3DBuildings]);

  // Sync Strategic Zones data updates
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) updateZonesGeoJSON(map);
  }, [zones, selectedZone, layerSettings.zones, updateZonesGeoJSON]);

  // Fly-to Camera Navigation Handler
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToTarget) return;

    if (flyToTarget.bounds) {
      map.fitBounds(flyToTarget.bounds, { padding: 60, maxZoom: 16, duration: 1100 });
    } else if (flyToTarget.center) {
      map.flyTo({
        center: flyToTarget.center,
        zoom: flyToTarget.zoom ?? 15,
        duration: 1200,
        essential: true,
      });
    }
  }, [flyToTarget]);

  // DOM Markers for Properties
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!layerSettings.properties) return;

    properties.forEach((prop) => {
      if (prop.latitude === undefined || prop.longitude === undefined) return;

      const isSelected = selectedProperty?.id === prop.id;

      // Custom marker DOM container
      const el = document.createElement("div");
      el.className = `realtor-map-marker transition-transform duration-200 cursor-pointer ${
        isSelected ? "z-30 scale-110" : "z-10 hover:scale-105"
      }`;

      // Abbreviate price
      let priceLabel = formatMAD(prop.price);
      if (prop.price >= 1000000) {
        priceLabel = `${(prop.price / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
      } else if (prop.price >= 1000) {
        priceLabel = `${Math.round(prop.price / 1000)}k`;
      }

      // Color tag per property type & status
      const isRental = prop.transactionType.includes("RENTAL");
      const statusBorder =
        prop.status === "ACTIVE"
          ? "border-emerald-500 text-emerald-950 dark:text-emerald-100"
          : prop.status === "UNDER_NEGOTIATION"
          ? "border-amber-500 text-amber-950 dark:text-amber-100"
          : "border-slate-400 text-slate-800 dark:text-slate-200";

      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-zinc-900 shadow-md border-2 ${statusBorder} font-bold text-[11px] leading-none whitespace-nowrap">
          <span class="inline-block w-2 h-2 rounded-full ${
            isRental ? "bg-purple-600" : "bg-blue-600"
          }"></span>
          ${layerSettings.priceBadges ? `<span>${priceLabel}</span>` : ""}
        </div>
      `;

      // Click handler
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectProperty(prop);
      });

      // Hover tooltip handlers
      el.addEventListener("mouseenter", () => {
        const rect = el.getBoundingClientRect();
        setHoveredProperty({
          property: prop,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      });

      el.addEventListener("mouseleave", () => {
        setHoveredProperty(null);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([prop.longitude, prop.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [properties, selectedProperty, layerSettings.properties, layerSettings.priceBadges, onSelectProperty]);

  // Update Cursor when drawingMode changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawingMode === "add_property" || drawingMode.startsWith("draw_") || drawingMode === "measure") {
      map.getCanvas().style.cursor = "crosshair";
    } else {
      map.getCanvas().style.cursor = "";
    }
  }, [drawingMode]);

  // Reset drawing states when mode changes
  React.useEffect(() => {
    setDrawingPoints([]);
    setDragStartPoint(null);
    setMeasureResult(null);
    onUpdateDrawingVerticesCount?.(0);

    const map = mapInstanceRef.current;
    if (map && map.getSource("drawing-source")) {
      const src = map.getSource("drawing-source") as maplibregl.GeoJSONSource;
      src.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [drawingMode, onUpdateDrawingVerticesCount]);

  // Map Click Handler for Drawing and Adding Properties
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const clickCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      // 1. ADD PROPERTY MODE
      if (drawingMode === "add_property") {
        onMapClickAddProperty(clickCoords);
        return;
      }

      // 2. DRAW POLYGON MODE
      if (drawingMode === "draw_polygon") {
        const newPoints = [...drawingPoints, clickCoords];
        setDrawingPoints(newPoints);
        onUpdateDrawingVerticesCount?.(newPoints.length);
        updateDrawingPreview(map, newPoints, false);
        return;
      }

      // 3. DRAW RECTANGLE MODE
      if (drawingMode === "draw_rectangle") {
        if (!dragStartPoint) {
          setDragStartPoint(clickCoords);
        } else {
          const rect = createRectanglePolygon(dragStartPoint, clickCoords);
          const areaM2 = calculateGeometryArea(rect);
          onFinishDrawZone(rect, areaM2);
          setDragStartPoint(null);
        }
        return;
      }

      // 4. DRAW RADIUS MODE
      if (drawingMode === "draw_radius") {
        if (!dragStartPoint) {
          setDragStartPoint(clickCoords);
        } else {
          const p1 = turf.point(dragStartPoint);
          const p2 = turf.point(clickCoords);
          const radiusKm = turf.distance(p1, p2, { units: "kilometers" });
          const circle = createCirclePolygon(dragStartPoint, radiusKm * 1000);
          const areaM2 = calculateGeometryArea(circle);
          onFinishDrawZone(circle, areaM2);
          setDragStartPoint(null);
        }
        return;
      }

      // 5. MEASURE DISTANCE MODE
      if (drawingMode === "measure") {
        if (!dragStartPoint) {
          setDragStartPoint(clickCoords);
        } else {
          const p1 = turf.point(dragStartPoint);
          const p2 = turf.point(clickCoords);
          const distKm = turf.distance(p1, p2, { units: "kilometers" });
          setMeasureResult({
            distanceMeters: Math.round(distKm * 1000),
            points: [dragStartPoint, clickCoords],
          });
          setDragStartPoint(null);
        }
      }
    };

    const handleMapDblClick = (e: maplibregl.MapMouseEvent) => {
      if (drawingMode === "draw_polygon" && drawingPoints.length >= 3) {
        e.preventDefault();
        const closedRing = [...drawingPoints, drawingPoints[0]];
        const polyGeo: GeoJSON.Polygon = {
          type: "Polygon",
          coordinates: [closedRing],
        };
        const areaM2 = calculateGeometryArea(polyGeo);
        onFinishDrawZone(polyGeo, areaM2);
        setDrawingPoints([]);
        onUpdateDrawingVerticesCount?.(0);
      }
    };

    map.on("click", handleMapClick);
    map.on("dblclick", handleMapDblClick);

    return () => {
      map.off("click", handleMapClick);
      map.off("dblclick", handleMapDblClick);
    };
  }, [drawingMode, drawingPoints, dragStartPoint, onMapClickAddProperty, onFinishDrawZone, onUpdateDrawingVerticesCount]);

  // Live mouse-move feedback for active rectangle or circle
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !dragStartPoint || !currentMousePos) return;

    if (drawingMode === "draw_rectangle") {
      const rect = createRectanglePolygon(dragStartPoint, currentMousePos);
      const source = map.getSource("drawing-source") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: rect }],
        });
      }
    } else if (drawingMode === "draw_radius") {
      const p1 = turf.point(dragStartPoint);
      const p2 = turf.point(currentMousePos);
      const radiusKm = turf.distance(p1, p2, { units: "kilometers" });
      const circle = createCirclePolygon(dragStartPoint, radiusKm * 1000);
      const source = map.getSource("drawing-source") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: circle }],
        });
      }
    }
  }, [drawingMode, dragStartPoint, currentMousePos]);

  // Helper to update active polygon preview
  const updateDrawingPreview = (map: maplibregl.Map, points: [number, number][], isClosed: boolean) => {
    const source = map.getSource("drawing-source") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const features: any[] = [];

    // Vertices
    points.forEach((pt) => {
      features.push({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: pt },
      });
    });

    // Edges or Polygon preview
    if (points.length >= 2) {
      if (isClosed || points.length >= 3) {
        const ring = isClosed ? points : [...points, points[0]];
        features.push({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [ring] },
        });
      } else {
        features.push({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: points },
        });
      }
    }

    source.setData({ type: "FeatureCollection", features });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900">
      {/* MapLibre WebGL container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Discreet Map Loading Indicator */}
      {isMapLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-xl text-xs font-semibold">
            <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
            <span>Chargement des tuiles cartographiques de Tanger...</span>
          </div>
        </div>
      )}

      {/* WebGL Not Supported Error Fallback */}
      {!webGLSupported && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col items-center gap-4 text-white">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Accélération WebGL Requise</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Votre navigateur ou votre carte graphique n'a pas pu activer le rendu WebGL. Veuillez activer
                l'accélération matérielle dans les paramètres de votre navigateur pour afficher la carte
                géospatiale interactive de Tanger.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const supported = isWebGLSupported();
                setWebGLSupported(supported);
                if (supported) setReloadKey((k) => k + 1);
              }}
              className="gap-2 text-xs border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw size={14} />
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {/* Map Error Banner with Retry */}
      {mapError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4 animate-in fade-in">
          <div className="p-4 rounded-lg bg-red-950/90 text-red-100 border border-red-800 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erreur de rendu cartographique</p>
                <p className="text-red-300 text-[11px] mt-0.5">{mapError}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMapError(null);
                setReloadKey((k) => k + 1);
              }}
              className="shrink-0 h-7 text-[11px] gap-1 bg-red-800 hover:bg-red-700 text-white border-0"
            >
              <RefreshCw size={12} />
              Recharger
            </Button>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredProperty && (
        <div
          className="fixed z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-2.5 shadow-2xl text-xs w-52 flex flex-col gap-1.5"
          style={{ left: `${hoveredProperty.x}px`, top: `${hoveredProperty.y}px` }}
        >
          {hoveredProperty.property.photos && hoveredProperty.property.photos[0] && (
            <img
              src={hoveredProperty.property.photos[0]}
              alt={hoveredProperty.property.title}
              className="w-full h-20 object-cover rounded-[var(--radius-xs)]"
            />
          )}
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[var(--muted)] font-bold">
                {hoveredProperty.property.reference}
              </span>
              <span className="font-bold text-[var(--accent)]">
                {formatMAD(hoveredProperty.property.price)}
              </span>
            </div>
            <h5 className="font-bold text-[11px] text-[var(--foreground)] truncate mt-0.5">
              {hoveredProperty.property.title}
            </h5>
            <p className="text-[10px] text-[var(--muted)] truncate">
              {hoveredProperty.property.neighborhood} • {hoveredProperty.property.surface} m²
            </p>
          </div>
        </div>
      )}

      {/* Live Measurement Floating Pill */}
      {measureResult && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/85 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl border border-white/20 backdrop-blur-md flex items-center gap-2">
          <span>Distance mesurée : {measureResult.distanceMeters.toLocaleString("fr-MA")} mètres</span>
          <button
            type="button"
            onClick={() => setMeasureResult(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
