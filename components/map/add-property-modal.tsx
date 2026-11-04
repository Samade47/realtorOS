"use client";

import * as React from "react";
import {
  X,
  Building2,
  MapPin,
  Save,
  Plus,
  Home,
  Store,
  Trees,
  Briefcase,
  UserCheck,
  FileCheck,
  Sparkles,
  Camera,
  ChevronRight,
  Info,
} from "lucide-react";
import { MapProperty } from "@/lib/map/map-types";
import { reverseGeocodeTangier } from "@/lib/map/market-explorer-store";
import { DEMO_CONTACTS, DemoContact } from "@/lib/data/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: [number, number] | null; // [lng, lat]
  onSaveProperty: (propertyData: Partial<MapProperty>) => void;
}

const TANGIER_NEIGHBORHOOD_OPTIONS = [
  "Malabata",
  "Marshan",
  "Centre-ville",
  "California",
  "Iberia",
  "Vieille Montagne",
  "Achakkar / Cap Spartel",
  "Tanger City Center",
  "Boubana",
  "Tanja Balia",
  "Gzenaya",
  "Kasbah",
  "Autre secteur",
];

const PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
];

export function AddPropertyModal({
  isOpen,
  onClose,
  coordinates,
  onSaveProperty,
}: AddPropertyModalProps) {
  const [activeTab, setActiveTab] = React.useState<"basic" | "location" | "owner" | "legal" | "media">("basic");

  // Section A: Basic Info
  const [reference, setReference] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<any>("APARTMENT");
  const [transactionType, setTransactionType] = React.useState<"SALE" | "RENTAL">("SALE");
  const [price, setPrice] = React.useState("");
  const [surface, setSurface] = React.useState("");
  const [bedrooms, setBedrooms] = React.useState("3");
  const [bathrooms, setBathrooms] = React.useState("2");
  const [floor, setFloor] = React.useState("3");
  const [furnished, setFurnished] = React.useState<"furnished" | "unfurnished" | "optional">("unfurnished");
  const [condition, setCondition] = React.useState<"new" | "good" | "needs_work">("new");
  const [standing, setStanding] = React.useState<"economique" | "moyen_standing" | "haut_standing" | "luxe">("haut_standing");

  // Section B: Location
  const [neighborhood, setNeighborhood] = React.useState("Malabata");
  const [address, setAddress] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("90000");
  const [locationPrecision, setLocationPrecision] = React.useState<"exact" | "approximate">("exact");

  // Section C: Owner & Contact
  const [ownerMode, setOwnerMode] = React.useState<"existing" | "new">("existing");
  const [selectedOwnerId, setSelectedOwnerId] = React.useState("c-1");
  const [newOwnerFirstName, setNewOwnerFirstName] = React.useState("");
  const [newOwnerLastName, setNewOwnerLastName] = React.useState("");
  const [newOwnerPhone, setNewOwnerPhone] = React.useState("");
  const [newOwnerEmail, setNewOwnerEmail] = React.useState("");

  // Section D: Legal & Documentation
  const [legalStatus, setLegalStatus] = React.useState<"TITLED" | "UNTITLED" | "PENDING_VERIFICATION" | "VERIFIED">("TITLED");
  const [titreFoncier, setTitreFoncier] = React.useState("");

  // Section E: Additional Details & Media
  const [description, setDescription] = React.useState("");
  const [internalNotes, setInternalNotes] = React.useState("");
  const [mandateType, setMandateType] = React.useState<"exclusive" | "simple">("exclusive");
  const [photoUrl, setPhotoUrl] = React.useState(PHOTO_PRESETS[0]);

  // Form error states
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset and auto-reverse-geocode on open
  React.useEffect(() => {
    if (isOpen && coordinates) {
      const [lng, lat] = coordinates;
      const geo = reverseGeocodeTangier(lng, lat);

      const refNum = Math.floor(100 + Math.random() * 900);
      setReference(`TNG-2026-${refNum}`);
      setTitle(`Appartement standing vue mer — ${geo.neighborhood}`);
      setNeighborhood(geo.neighborhood);
      setAddress(geo.address);
      setPostalCode(geo.postalCode);
      setTitreFoncier(`TF ${Math.floor(200000 + Math.random() * 800000)}/06`);
      setPrice("2200000");
      setSurface("125");
      setDescription(`Très bel appartement situé dans le secteur prisé de ${geo.neighborhood}, offrant des prestations haut standing et une excellente exposition.`);
      setPhotoUrl(PHOTO_PRESETS[Math.floor(Math.random() * PHOTO_PRESETS.length)]);
      setActiveTab("basic");
      setErrors({});
    }
  }, [isOpen, coordinates]);

  if (!isOpen || !coordinates) return null;

  const [lng, lat] = coordinates;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Le titre est requis";
    if (!price || Number(price) <= 0) newErrors.price = "Prix valide requis";
    if (!surface || Number(surface) <= 0) newErrors.surface = "Superficie requise";
    if (ownerMode === "new") {
      if (!newOwnerFirstName.trim()) newErrors.newOwner = "Prénom requis";
      if (!newOwnerPhone.trim()) newErrors.newOwner = "Téléphone requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Determine owner details
    let ownerName = "Client Particulier";
    let ownerId = selectedOwnerId;
    let ownerPhone = "+212 6 00 00 00 00";
    let ownerEmail = "";

    if (ownerMode === "existing") {
      const existing = DEMO_CONTACTS.find((c) => c.id === selectedOwnerId);
      if (existing) {
        ownerName = existing.fullName;
        ownerPhone = existing.phone;
        ownerEmail = existing.email;
      }
    } else {
      ownerName = `${newOwnerFirstName.trim()} ${newOwnerLastName.trim()}`;
      ownerId = `c-new-${Date.now()}`;
      ownerPhone = newOwnerPhone.trim();
      ownerEmail = newOwnerEmail.trim();
    }

    const newProperty: Partial<MapProperty> = {
      id: `p-${Date.now()}`,
      reference: reference.trim(),
      title: title.trim(),
      propertyType,
      transactionType: [transactionType],
      price: parseFloat(price),
      surface: parseFloat(surface),
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 0,
      floor: parseInt(floor, 10) || 0,
      furnished,
      condition,
      standing,
      neighborhood,
      city: "Tanger",
      address: address.trim() || `${neighborhood}, Tanger`,
      legalStatus,
      titreFoncier: titreFoncier.trim(),
      status: "ACTIVE",
      ownerName,
      ownerId,
      ownerPhone,
      ownerEmail,
      mandateType,
      mandateExpiry: "2027-06-30",
      daysOnMarket: 1,
      description: description.trim(),
      notes: internalNotes.trim(),
      latitude: lat,
      longitude: lng,
      locationPrecision,
      photos: photoUrl.trim() ? [photoUrl.trim()] : undefined,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-[var(--foreground)]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white shadow-xs">
              <Plus size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Créer & Géoréférencer un Bien Immobilier</h3>
                <span className="font-mono text-[10px] bg-[var(--accent-subtle)] text-[var(--accent)] font-bold px-1.5 py-0.5 rounded">
                  {reference}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} className="text-emerald-500 shrink-0" />
                <span>
                  Coordonnées GPS Tanger : {lat.toFixed(6)}° N, {lng.toFixed(6)}° W
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Multi-Section Tabs Navigation */}
        <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--background)] text-center text-[11px] font-semibold">
          {[
            { id: "basic", label: "1. Caractéristiques" },
            { id: "location", label: "2. Emplacement" },
            { id: "owner", label: "3. Propriétaire" },
            { id: "legal", label: "4. Juridique" },
            { id: "media", label: "5. Médias & Mandat" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--surface)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === "basic" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="font-bold block mb-1">
                  Titre du mandat / bien <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Demeure de prestige Marshan avec vue sur le Détroit..."
                  className={errors.title ? "border-rose-500" : ""}
                  required
                />
                {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Typologie</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                  >
                    <option value="APARTMENT">Appartement</option>
                    <option value="VILLA">Villa</option>
                    <option value="HOUSE">Maison / Riad</option>
                    <option value="COMMERCIAL">Local Commercial</option>
                    <option value="LAND">Terrain</option>
                    <option value="OFFICE">Plateau Bureau</option>
                    <option value="DUPLEX">Duplex</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Transaction</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setTransactionType("SALE")}
                      className={`h-8 rounded font-semibold border transition-colors ${
                        transactionType === "SALE"
                          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                          : "border-[var(--border)] hover:bg-[var(--border-subtle)]"
                      }`}
                    >
                      Vente
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType("RENTAL")}
                      className={`h-8 rounded font-semibold border transition-colors ${
                        transactionType === "RENTAL"
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-[var(--border)] hover:bg-[var(--border-subtle)]"
                      }`}
                    >
                      Location
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">
                    Prix demandé (MAD) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 2400000"
                    className={errors.price ? "border-rose-500" : ""}
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">
                    Superficie (m²) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    placeholder="Ex: 140"
                    className={errors.surface ? "border-rose-500" : ""}
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Standing</label>
                  <select
                    value={standing}
                    onChange={(e) => setStanding(e.target.value as any)}
                    className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                  >
                    <option value="luxe">Grand Luxe</option>
                    <option value="haut_standing">Haut standing</option>
                    <option value="moyen_standing">Moyen standing</option>
                    <option value="economique">Économique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Chambres</label>
                  <Input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Salles de bain</label>
                  <Input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Étage</label>
                  <Input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Ameublement</label>
                  <select
                    value={furnished}
                    onChange={(e) => setFurnished(e.target.value as any)}
                    className="w-full h-8 px-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-[11px]"
                  >
                    <option value="unfurnished">Non meublé</option>
                    <option value="furnished">Meublé</option>
                    <option value="optional">Optionnel</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & REVERSE GEOCODING */}
          {activeTab === "location" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[var(--accent)] mb-1">
                  <Sparkles size={13} />
                  <span>Résolution automatique par géolocalisation</span>
                </div>
                <p className="text-[11px] text-[var(--foreground)]">
                  Le quartier de Tanger a été automatiquement déduit à partir du point cliqué sur la carte.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Quartier de Tanger</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                  >
                    {TANGIER_NEIGHBORHOOD_OPTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Code Postal / Ville</label>
                  <Input value={`${postalCode} Tanger, Maroc`} disabled className="h-8 bg-[var(--background)]/50" />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Adresse précise / Résidence</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Résidence Corniche Bay, Bd Mohammed VI..."
                  className="h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Latitude</label>
                  <Input value={lat.toFixed(6)} disabled className="h-8 font-mono bg-[var(--background)]/50" />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Longitude</label>
                  <Input value={lng.toFixed(6)} disabled className="h-8 font-mono bg-[var(--background)]/50" />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
                  Précision de l'emplacement (Confidentialité)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationPrecision("exact")}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-left transition-colors ${
                      locationPrecision === "exact"
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                        : "border-[var(--border)] hover:bg-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="font-semibold text-xs">Emplacement Exact</div>
                    <div className="text-[10px] text-[var(--muted)] font-normal">
                      Coordonnées GPS précises visibles pour l'agent
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationPrecision("approximate")}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-left transition-colors ${
                      locationPrecision === "approximate"
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                        : "border-[var(--border)] hover:bg-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="font-semibold text-xs">Emplacement Approximatif</div>
                    <div className="text-[10px] text-[var(--muted)] font-normal">
                      Périmètre flouté pour diffusions externes
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OWNER & CONTACT */}
          {activeTab === "owner" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                <button
                  type="button"
                  onClick={() => setOwnerMode("existing")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    ownerMode === "existing"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Contact existant du CRM
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerMode("new")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    ownerMode === "new"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  + Nouveau propriétaire
                </button>
              </div>

              {ownerMode === "existing" ? (
                <div className="space-y-2">
                  <label className="font-bold block mb-1">Sélectionner le propriétaire (CRM)</label>
                  <select
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="w-full h-9 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                  >
                    {DEMO_CONTACTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} • {c.contactType} • {c.phone}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Le bien sera automatiquement rattaché à ce dossier client sans créer de doublon.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">Prénom</label>
                      <Input
                        value={newOwnerFirstName}
                        onChange={(e) => setNewOwnerFirstName(e.target.value)}
                        placeholder="Ex: Tariq"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Nom de famille</label>
                      <Input
                        value={newOwnerLastName}
                        onChange={(e) => setNewOwnerLastName(e.target.value)}
                        placeholder="Ex: Bennani"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">Téléphone portable</label>
                      <Input
                        value={newOwnerPhone}
                        onChange={(e) => setNewOwnerPhone(e.target.value)}
                        placeholder="+212 6 XX XX XX XX"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Email</label>
                      <Input
                        type="email"
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                        placeholder="proprietaire@gmail.com"
                        className="h-8"
                      />
                    </div>
                  </div>
                  {errors.newOwner && <p className="text-[10px] text-rose-500">{errors.newOwner}</p>}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEGAL & DOCUMENTATION */}
          {activeTab === "legal" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="font-bold block mb-1">Statut juridique foncier</label>
                <select
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value as any)}
                  className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                >
                  <option value="TITLED">Titre Foncier (Conservation Foncière de Tanger)</option>
                  <option value="VERIFIED">Juridiquement vérifié par Notaire</option>
                  <option value="UNTITLED">Melkia / Acte Adoulaire</option>
                  <option value="PENDING_VERIFICATION">Vérification en cours</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Numéro de Titre Foncier (TF)</label>
                <Input
                  value={titreFoncier}
                  onChange={(e) => setTitreFoncier(e.target.value)}
                  placeholder="Ex: TF 345678/06"
                  className="h-8 font-mono"
                />
              </div>

              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--border-subtle)] border border-[var(--border)] text-xs">
                <span className="font-semibold block mb-0.5 text-[var(--foreground)]">Sécurité légale</span>
                <p className="text-[11px] text-[var(--muted)]">
                  L'inscription du numéro de réquisition ou du Titre Foncier permet la conformité avec l'ANCFCC
                  de Tanger.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA & MANDATE */}
          {activeTab === "media" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="font-bold block mb-1">Photo principale (URL)</label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-[11px]"
                />
                <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                  {PHOTO_PRESETS.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Preset"
                      onClick={() => setPhotoUrl(p)}
                      className={`h-12 w-16 object-cover rounded cursor-pointer border-2 transition-transform hover:scale-105 shrink-0 ${
                        photoUrl === p ? "border-[var(--accent)]" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Type de mandat</label>
                  <select
                    value={mandateType}
                    onChange={(e) => setMandateType(e.target.value as any)}
                    className="w-full h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--foreground)]"
                  >
                    <option value="exclusive">Mandat Exclusif (Recommandé)</option>
                    <option value="simple">Mandat Simple</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Date d'expiration mandat</label>
                  <Input type="date" defaultValue="2027-06-30" className="h-8" />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description publique</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Notes internes (Privé agent)</label>
                <Input
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ex: Clés disponibles à l'agence. Commission négociable à 2.5%."
                  className="h-8"
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/70 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[11px] text-[var(--muted)]"
          >
            Annuler
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== "media" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tabs: ("basic" | "location" | "owner" | "legal" | "media")[] = [
                    "basic",
                    "location",
                    "owner",
                    "legal",
                    "media",
                  ];
                  const currentIdx = tabs.indexOf(activeTab);
                  if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                }}
                className="gap-1 text-xs"
              >
                <span>Suivant</span>
                <ChevronRight size={14} />
              </Button>
            ) : null}

            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-4"
            >
              <Save size={14} />
              Enregistrer & Épingler sur la Carte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
