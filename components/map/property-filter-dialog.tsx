"use client";

import * as React from "react";
import {
  Filter,
  X,
  RotateCcw,
  Check,
  Building2,
  Home,
  Store,
  Trees,
  Briefcase,
  Bookmark,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  MapProperty,
  StrategicZone,
  PropertyFilterState,
  DEFAULT_PROPERTY_FILTER_STATE,
} from "@/lib/map/map-types";
import {
  matchesPropertyFilters,
  loadSavedFilterPresets,
  saveFilterPreset,
  deleteFilterPreset,
  SavedFilterPreset,
} from "@/lib/map/market-explorer-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PropertyFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilterState;
  onApplyFilters: (filters: PropertyFilterState) => void;
  properties: MapProperty[];
  zones: StrategicZone[];
}

const PROPERTY_TYPE_OPTIONS = [
  { id: "APARTMENT", label: "Appartement", icon: Building2 },
  { id: "VILLA", label: "Villa de luxe", icon: Home },
  { id: "HOUSE", label: "Maison / Riad", icon: Home },
  { id: "COMMERCIAL", label: "Local commercial", icon: Store },
  { id: "LAND", label: "Terrain constructible", icon: Trees },
  { id: "OFFICE", label: "Plateau bureau", icon: Briefcase },
  { id: "DUPLEX", label: "Duplex", icon: Building2 },
];

const STATUS_OPTIONS = [
  { id: "ACTIVE", label: "Disponible", color: "bg-emerald-500" },
  { id: "UNDER_NEGOTIATION", label: "En négociation", color: "bg-amber-500" },
  { id: "RESERVED", label: "Réservé / Compromis", color: "bg-blue-500" },
  { id: "SOLD", label: "Vendu", color: "bg-slate-400" },
  { id: "RENTED", label: "Loué", color: "bg-purple-500" },
];

const LEGAL_STATUS_OPTIONS = [
  { id: "TITLED", label: "Titre Foncier (TF)" },
  { id: "VERIFIED", label: "Juridiquement vérifié" },
  { id: "UNTITLED", label: "Melkia / Non titré" },
  { id: "PENDING_VERIFICATION", label: "Vérification en cours" },
];

export function PropertyFilterDialog({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  properties,
  zones,
}: PropertyFilterDialogProps) {
  const [draft, setDraft] = React.useState<PropertyFilterState>(filters);
  const [savedPresets, setSavedPresets] = React.useState<SavedFilterPreset[]>([]);
  const [presetNameInput, setPresetNameInput] = React.useState("");
  const [showSavePreset, setShowSavePreset] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(filters);
      setSavedPresets(loadSavedFilterPresets());
      setShowSavePreset(false);
    }
  }, [isOpen, filters]);

  // Compute live match count preview
  const liveMatchCount = React.useMemo(() => {
    return properties.filter((p) => matchesPropertyFilters(p, draft, zones)).length;
  }, [properties, draft, zones]);

  if (!isOpen) return null;

  const togglePropertyType = (typeId: string) => {
    setDraft((prev) => {
      const exists = prev.propertyTypes.includes(typeId);
      return {
        ...prev,
        propertyTypes: exists
          ? prev.propertyTypes.filter((t) => t !== typeId)
          : [...prev.propertyTypes, typeId],
      };
    });
  };

  const toggleStatus = (statusId: string) => {
    setDraft((prev) => {
      const exists = prev.statuses.includes(statusId);
      return {
        ...prev,
        statuses: exists
          ? prev.statuses.filter((s) => s !== statusId)
          : [...prev.statuses, statusId],
      };
    });
  };

  const toggleLegalStatus = (legalId: string) => {
    setDraft((prev) => {
      const exists = prev.legalStatuses.includes(legalId);
      return {
        ...prev,
        legalStatuses: exists
          ? prev.legalStatuses.filter((l) => l !== legalId)
          : [...prev.legalStatuses, legalId],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_PROPERTY_FILTER_STATE);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetNameInput.trim()) return;
    const updated = saveFilterPreset(presetNameInput.trim(), draft);
    setSavedPresets(updated);
    setPresetNameInput("");
    setShowSavePreset(false);
  };

  const handleDeletePreset = (id: string) => {
    const updated = deleteFilterPreset(id);
    setSavedPresets(updated);
  };

  const handleLoadPreset = (preset: SavedFilterPreset) => {
    setDraft(preset.filter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs text-[var(--foreground)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] shadow-xs">
              <Filter size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Filtres Géospatiaux Avancés</h3>
              <p className="text-[11px] text-[var(--muted)]">
                Affinez votre portefeuille selon la localisation, la typologie et le statut
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-[var(--border)]">
          {/* Section: Presets & Logic */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[11px] text-[var(--muted)]">Opérateur logique :</span>
              <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5 bg-[var(--background)]">
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, logicalOperator: "AND" }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    draft.logicalOperator === "AND"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  ET (Toutes)
                </button>
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, logicalOperator: "OR" }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    draft.logicalOperator === "OR"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  OU (Au moins une)
                </button>
              </div>
            </div>

            {/* Saved Presets */}
            {savedPresets.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[var(--muted)] font-medium">Favoris :</span>
                {savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 px-2 py-1 bg-[var(--border-subtle)] rounded-full text-[10px]"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(preset)}
                      className="font-medium hover:text-[var(--accent)]"
                    >
                      {preset.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-[var(--muted)] hover:text-rose-500 ml-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1: Property Types */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)]">
                Typologie du bien
              </label>
              {draft.propertyTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, propertyTypes: [] }))}
                  className="text-[10px] text-[var(--accent)] hover:underline"
                >
                  Tous sélectionner
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PROPERTY_TYPE_OPTIONS.map((type) => {
                const isSelected = draft.propertyTypes.includes(type.id);
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => togglePropertyType(type.id)}
                    className={`flex items-center gap-2 p-2 rounded-[var(--radius-md)] border text-left transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)] shadow-xs"
                        : "border-[var(--border)] hover:bg-[var(--border-subtle)] text-[var(--foreground)]"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                    <span className="truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Transaction Type */}
          <div className="pt-3 space-y-2">
            <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
              Type de transaction
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "ALL", label: "Toutes" },
                { id: "SALE", label: "Vente" },
                { id: "RENTAL", label: "Location" },
                { id: "BOTH", label: "Mixte" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, transactionType: t.id as any }))}
                  className={`py-1.5 px-2 rounded-[var(--radius-md)] border text-center font-medium transition-all ${
                    draft.transactionType === t.id
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white font-bold"
                      : "border-[var(--border)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Price and Surface Ranges */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                Budget (MAD)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={draft.minPrice ?? ""}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="h-8 text-xs"
                />
                <span className="text-[var(--muted)]">à</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={draft.maxPrice ?? ""}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {[
                  { label: "< 1M", max: 1000000 },
                  { label: "1M - 3M", min: 1000000, max: 3000000 },
                  { label: "3M - 8M", min: 3000000, max: 8000000 },
                  { label: "> 8M", min: 8000000 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        minPrice: preset.min ?? null,
                        maxPrice: preset.max ?? null,
                      }))
                    }
                    className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Surface */}
            <div className="space-y-2">
              <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                Superficie habitable (m²)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min m²"
                  value={draft.minSurface ?? ""}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, minSurface: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="h-8 text-xs"
                />
                <span className="text-[var(--muted)]">à</span>
                <Input
                  type="number"
                  placeholder="Max m²"
                  value={draft.maxSurface ?? ""}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, maxSurface: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {[
                  { label: "< 80m²", max: 80 },
                  { label: "80 - 150m²", min: 80, max: 150 },
                  { label: "150 - 300m²", min: 150, max: 300 },
                  { label: "> 300m²", min: 300 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        minSurface: preset.min ?? null,
                        maxSurface: preset.max ?? null,
                      }))
                    }
                    className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[10px] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Location & Strategic Zones */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                Quartier de Tanger
              </label>
              <Input
                placeholder="Ex: Malabata, Marshan, Iberia..."
                value={draft.neighborhood ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, neighborhood: e.target.value || null }))
                }
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                Zone stratégique tracée
              </label>
              <select
                value={draft.strategicZoneId ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, strategicZoneId: e.target.value || null }))
                }
                className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)] outline-none"
              >
                <option value="">Toutes les zones géographiques</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.propertyIds.length} biens)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Property Statuses */}
          <div className="pt-3 space-y-2">
            <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
              Disponibilité & Statut
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((st) => {
                const isSelected = draft.statuses.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStatus(st.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-bold"
                        : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${st.color}`}></span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Legal Status */}
          <div className="pt-3 space-y-2">
            <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
              Statut juridique & Foncier
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LEGAL_STATUS_OPTIONS.map((leg) => {
                const isSelected = draft.legalStatuses.includes(leg.id);
                return (
                  <button
                    key={leg.id}
                    type="button"
                    onClick={() => toggleLegalStatus(leg.id)}
                    className={`px-2.5 py-1 rounded-[var(--radius-sm)] border text-[11px] transition-colors ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-bold"
                        : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                    }`}
                  >
                    {leg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[var(--accent)]">
              {liveMatchCount} / {properties.length} biens correspondants
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-[11px] h-7 gap-1 text-[var(--muted)] hover:text-rose-500"
            >
              <RotateCcw size={12} />
              Réinitialiser
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!showSavePreset ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                className="h-8 text-[11px] gap-1.5 border-[var(--border)]"
              >
                <Bookmark size={13} />
                Sauvegarder ce filtre
              </Button>
            ) : (
              <form onSubmit={handleSavePreset} className="flex items-center gap-1.5">
                <Input
                  type="text"
                  placeholder="Nom du filtre..."
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  className="h-8 text-xs w-36"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-8 px-2 text-[11px]">
                  OK
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavePreset(false)}
                  className="h-8 px-1.5 text-[11px]"
                >
                  Annuler
                </Button>
              </form>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 px-4 font-bold text-xs bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
            >
              Appliquer ({liveMatchCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
