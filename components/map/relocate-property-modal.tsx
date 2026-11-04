"use client";

import * as React from "react";
import * as turf from "@turf/turf";
import { MapPin, Navigation, ArrowRight, ShieldCheck, Check, X, AlertCircle } from "lucide-react";
import { MapProperty, PropertyLocationHistory } from "@/lib/map/map-types";
import { formatDistance, recordLocationChange } from "@/lib/map/market-explorer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RelocatePropertyModalProps {
  isOpen: boolean;
  property: MapProperty | null;
  newCoordinates: [number, number] | null; // [lng, lat]
  onConfirm: (propertyId: string, newCoords: [number, number], precision: "exact" | "approximate", reason: string) => void;
  onCancel: () => void;
}

export function RelocatePropertyModal({
  isOpen,
  property,
  newCoordinates,
  onConfirm,
  onCancel,
}: RelocatePropertyModalProps) {
  const [reason, setReason] = React.useState("Précision cadastrale et vérification sur plan");
  const [precision, setPrecision] = React.useState<"exact" | "approximate">("exact");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !property || !newCoordinates) return null;

  const prevLng = property.longitude ?? newCoordinates[0];
  const prevLat = property.latitude ?? newCoordinates[1];
  const [nextLng, nextLat] = newCoordinates;

  const distanceMeters = Math.round(
    turf.distance(turf.point([prevLng, prevLat]), turf.point([nextLng, nextLat]), {
      units: "kilometers",
    }) * 1000
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const historyEntry: PropertyLocationHistory = {
      id: `loc-hist-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyRef: property.reference,
      previousLatitude: prevLat,
      previousLongitude: prevLng,
      newLatitude: nextLat,
      newLongitude: nextLng,
      distanceMeters,
      reason,
      changedBy: "Agent Immobilier (Session actuelle)",
      createdAt: new Date().toISOString(),
    };

    recordLocationChange(historyEntry);

    // Call server API asynchronously
    fetch("/api/properties/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(historyEntry),
    }).catch((err) => console.warn("API location log sync error:", err));

    onConfirm(property.id, [nextLng, nextLat], precision, reason);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden text-xs text-[var(--foreground)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-[var(--radius-md)]">
              <Navigation size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Confirmer le déplacement du bien</h3>
              <p className="text-[11px] text-[var(--muted)]">
                {property.reference} • {property.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Old Coords */}
            <div className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                Emplacement Actuel
              </span>
              <p className="font-mono text-[11px] font-semibold text-[var(--foreground)]">
                {prevLat.toFixed(6)}° N
              </p>
              <p className="font-mono text-[11px] font-semibold text-[var(--foreground)]">
                {prevLng.toFixed(6)}° W
              </p>
            </div>

            {/* New Coords */}
            <div className="p-3 rounded-[var(--radius-md)] border-2 border-emerald-500/40 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <Check size={11} />
                Nouvel Emplacement
              </span>
              <p className="font-mono text-[11px] font-bold text-[var(--foreground)]">
                {nextLat.toFixed(6)}° N
              </p>
              <p className="font-mono text-[11px] font-bold text-[var(--foreground)]">
                {nextLng.toFixed(6)}° W
              </p>
            </div>
          </div>

          {/* Distance Shift Banner */}
          <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--accent-subtle)] border border-[var(--accent)]/30 flex items-center justify-between text-xs">
            <span className="text-[var(--foreground)] font-medium">Déplacement géodésique :</span>
            <span className="font-bold text-[var(--accent)] font-mono">{formatDistance(distanceMeters)}</span>
          </div>

          {/* Precision Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-[11px] text-[var(--muted)] uppercase tracking-wider block">
              Précision géographique
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrecision("exact")}
                className={`p-2 rounded-[var(--radius-md)] border text-left transition-colors ${
                  precision === "exact"
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                }`}
              >
                <div className="font-semibold text-xs">Exacte (Cadastre)</div>
                <div className="text-[10px] text-[var(--muted)] font-normal">
                  Coordonnées GPS réelles du bien
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPrecision("approximate")}
                className={`p-2 rounded-[var(--radius-md)] border text-left transition-colors ${
                  precision === "approximate"
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                }`}
              >
                <div className="font-semibold text-xs">Approximative</div>
                <div className="text-[10px] text-[var(--muted)] font-normal">
                  Périmètre flou pour préservation de la vie privée
                </div>
              </button>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-[11px] text-[var(--muted)] uppercase tracking-wider block">
              Motif du déplacement (Audit trail)
            </label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Correction suite à visite sur place..."
              className="h-8 text-xs"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
            >
              <Check size={14} />
              Confirmer le repositionnement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
