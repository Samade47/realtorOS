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
  calculatePerimeterMeters,
  formatArea,
  formatDistance,
} from "@/lib/map/market-explorer-store";
import { formatMAD } from "@/lib/utils";
import {
  AlertTriangle,
  RefreshCw,
  Loader2,
  Building2,
  Home,
  Store,
  Trees,
  Briefcase,
  MapPin,
  Check,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  highlightSurroundingCircle?: { center: [number, number]; radiusMeters: number } | null;
  editingZoneGeometry?: GeoJSON.Polygon | null;
  onSelectProperty: (property: MapProperty) => void;
  onSelectZone: (zone: StrategicZone) => void;
  onFinishDrawZone: (geometry: GeoJSON.Polygon, areaM2: number) => void;
  onUpdateEditingZoneGeometry?: (geometry: GeoJSON.Polygon) => void;
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
  highlightSurroundingCircle,
  editingZoneGeometry,
  onSelectProperty,
  onSelectZone,
  onFinishDrawZone,
  onUpdateEditingZoneGeometry,
  onMapClickAddProperty,
  onUpdatePropertyCoordinates,
  onCursorMove,
  onUpdateDrawingVerticesCount,
}: MapCanvasProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<maplibregl.Map | null>(null);
  const markersRef = React.useRef<maplibregl.Marker[]>([]);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // State for rendering lifecycle & diagnostics
  const [webGLSupported, setWebGLSupported] = React.useState<boolean>(true);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = React.useState<boolean>(true);
  const [reloadKey, setReloadKey] = React.useState<number>(0);
  const [currentZoom, setCurrentZoom] = React.useState<number>(12.8);

  // Drawing in progress state
  const [drawingPoints, setDrawingPoints] = React.useState<[number, number][]>([]);
  const [dragStartPoint, setDragStartPoint] = React.useState<[number, number] | null>(null);
  const [currentMousePos, setCurrentMousePos] = React.useState<[number, number] | null>(null);
  const [measureResult, setMeasureResult] = React.useState<MeasureResult | null>(null);

  // Hovered tooltip state (with 150ms debounce)
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

      // Zone Labels
      if (!map.getLayer("strategic-zones-labels")) {
        map.addLayer({
          id: "strategic-zones-labels",
          type: "symbol",
          source: "strategic-zones-source",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-anchor": "center",
            "text-font": ["Noto Sans Bold", "Open Sans Bold"],
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#000000",
            "text-halo-width": 1.5,
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
          "fill-opacity": 0.22,
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
          "line-width": 2.5,
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
          "circle-radius": 6,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#2563eb",
          "circle-stroke-width": 2.5,
        },
      });
    }

    // Surrounding Buffer Source & Layer (500m radius highlight)
    if (!map.getSource("surrounding-radius-source")) {
      map.addSource("surrounding-radius-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "surrounding-radius-fill",
        type: "fill",
        source: "surrounding-radius-source",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "surrounding-radius-line",
        type: "line",
        source: "surrounding-radius-source",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
          "line-dasharray": [3, 2],
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

  // Sync Surrounding 500m Radius Buffer
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("surrounding-radius-source") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (highlightSurroundingCircle) {
      const circlePoly = createCirclePolygon(
        highlightSurroundingCircle.center,
        highlightSurroundingCircle.radiusMeters
      );
      source.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: circlePoly }],
      });
    } else {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [highlightSurroundingCircle]);

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
      // 2. Explicitly configure worker URL
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

      // Zoom listener for smart clustering
      map.on("zoom", () => {
        setCurrentZoom(map.getZoom());
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

  // DOM Markers & Clustering for Properties
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!layerSettings.properties) return;

    const geocodedProperties = properties.filter(
      (p) => p.latitude !== undefined && p.longitude !== undefined
    );

    // Smart Clustering: when zoom < 13.5, group close properties
    const shouldCluster = currentZoom < 13.5;

    if (shouldCluster) {
      // Group properties by spatial proximity
      const clusters: { center: [number, number]; props: MapProperty[]; bounds: [number, number, number, number] }[] = [];
      const thresholdKm = currentZoom < 12 ? 1.5 : 0.8;

      geocodedProperties.forEach((prop) => {
        const pt = turf.point([prop.longitude!, prop.latitude!]);
        let placed = false;

        for (const cl of clusters) {
          const clPt = turf.point(cl.center);
          const d = turf.distance(pt, clPt, { units: "kilometers" });
          if (d < thresholdKm) {
            cl.props.push(prop);
            // Recompute center
            const avgLng = cl.props.reduce((acc, p) => acc + p.longitude!, 0) / cl.props.length;
            const avgLat = cl.props.reduce((acc, p) => acc + p.latitude!, 0) / cl.props.length;
            cl.center = [avgLng, avgLat];
            placed = true;
            break;
          }
        }

        if (!placed) {
          clusters.push({
            center: [prop.longitude!, prop.latitude!],
            props: [prop],
            bounds: [prop.longitude!, prop.latitude!, prop.longitude!, prop.latitude!],
          });
        }
      });

      clusters.forEach((cl) => {
        if (cl.props.length > 1) {
          // Render Cluster Bubble
          const el = document.createElement("div");
          el.className =
            "realtor-map-cluster cursor-pointer transform transition-transform hover:scale-110 active:scale-95 z-20";
          el.innerHTML = `
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-lg border-2 border-white ring-2 ring-blue-500/40">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${cl.props.length} biens</span>
            </div>
          `;

          el.addEventListener("click", () => {
            const bbox = turf.bbox(
              turf.featureCollection(cl.props.map((p) => turf.point([p.longitude!, p.latitude!])))
            ) as [number, number, number, number];
            map.fitBounds(bbox, { padding: 80, maxZoom: 16, duration: 900 });
          });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(cl.center).addTo(map);
          markersRef.current.push(marker);
        } else {
          // Render Single Property
          renderSinglePropertyMarker(map, cl.props[0]);
        }
      });
    } else {
      // High zoom: render all individual rich property markers
      geocodedProperties.forEach((prop) => {
        renderSinglePropertyMarker(map, prop);
      });
    }

    function renderSinglePropertyMarker(mapInstance: maplibregl.Map, prop: MapProperty) {
      const isSelected = selectedProperty?.id === prop.id;

      const el = document.createElement("div");
      el.className = `realtor-map-marker transition-all duration-200 cursor-pointer ${
        isSelected ? "z-40 scale-115 ring-4 ring-blue-500/50 rounded-full" : "z-10 hover:scale-105"
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
        prop.status === "ACTIVE" || prop.status === "NEW"
          ? "border-emerald-500 text-emerald-950 dark:text-emerald-100"
          : prop.status === "UNDER_NEGOTIATION"
          ? "border-amber-500 text-amber-950 dark:text-amber-100"
          : prop.status === "RESERVED"
          ? "border-blue-500 text-blue-950 dark:text-blue-100"
          : "border-slate-400 text-slate-800 dark:text-slate-200";

      // Icon symbol based on category
      const typeGlyph =
        prop.propertyType === "VILLA"
          ? "🏰"
          : prop.propertyType === "COMMERCIAL" || prop.propertyType === "OFFICE"
          ? "🏢"
          : prop.propertyType === "LAND"
          ? "🌲"
          : "🏠";

      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-xl border-2 ${statusBorder} font-bold text-[11px] leading-none whitespace-nowrap">
          <span class="text-xs leading-none">${typeGlyph}</span>
          <span class="inline-block w-2 h-2 rounded-full ${isRental ? "bg-purple-600" : "bg-blue-600"}"></span>
          ${layerSettings.priceBadges ? `<span class="tracking-tight">${priceLabel}</span>` : ""}
        </div>
      `;

      // Click handler
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectProperty(prop);
      });

      // Hover tooltip handlers with 150ms debounce
      el.addEventListener("mouseenter", () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setHoveredProperty({
            property: prop,
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }, 150);
      });

      el.addEventListener("mouseleave", () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredProperty(null);
        }, 80);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([prop.longitude!, prop.latitude!])
        .addTo(mapInstance);

      markersRef.current.push(marker);
    }
  }, [
    properties,
    selectedProperty,
    currentZoom,
    layerSettings.properties,
    layerSettings.priceBadges,
    onSelectProperty,
  ]);

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
  }, [
    drawingMode,
    drawingPoints,
    dragStartPoint,
    onMapClickAddProperty,
    onFinishDrawZone,
    onUpdateDrawingVerticesCount,
  ]);

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

      {/* Premium Floating Hover Card (150ms Debounced) */}
      {hoveredProperty && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-3 shadow-2xl text-xs w-64 flex flex-col gap-2 animate-in fade-in zoom-in-95"
          style={{ left: `${hoveredProperty.x}px`, top: `${hoveredProperty.y}px` }}
        >
          {hoveredProperty.property.photos && hoveredProperty.property.photos[0] && (
            <div className="relative w-full h-28 rounded-[var(--radius-md)] overflow-hidden shadow-xs bg-slate-100 dark:bg-slate-800">
              <img
                src={hoveredProperty.property.photos[0]}
                alt={hoveredProperty.property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-black/75 text-white font-mono text-[9px] font-bold">
                  {hoveredProperty.property.reference}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <Badge
                  variant={hoveredProperty.property.status === "ACTIVE" ? "success" : "muted"}
                  className="text-[9px] shadow-sm"
                >
                  {hoveredProperty.property.status === "ACTIVE" ? "Disponible" : hoveredProperty.property.status}
                </Badge>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-sm text-[var(--foreground)]">
                {formatMAD(hoveredProperty.property.price)}
              </span>
              <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                {hoveredProperty.property.transactionType.includes("RENTAL") ? "Location" : "Vente"}
              </span>
            </div>
            <h5 className="font-bold text-xs text-[var(--foreground)] truncate mt-1">
              {hoveredProperty.property.title}
            </h5>
            <p className="text-[11px] text-[var(--muted)] truncate mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="text-emerald-500 shrink-0" />
              <span>{hoveredProperty.property.neighborhood}</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]/70 text-[10px] text-[var(--muted)]">
            <span>{hoveredProperty.property.surface} m²</span>
            <span>•</span>
            <span>{hoveredProperty.property.bedrooms || 0} chambres</span>
            <span>•</span>
            <span>{hoveredProperty.property.bathrooms || 0} sdb</span>
          </div>
        </div>
      )}

      {/* Live Measurement Floating Pill */}
      {measureResult && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/85 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2.5">
          <span>Distance mesurée : {measureResult.distanceMeters.toLocaleString("fr-MA")} mètres</span>
          <button
            type="button"
            onClick={() => setMeasureResult(null)}
            className="text-slate-400 hover:text-white font-bold ml-1"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
