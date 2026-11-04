"use client";

import * as React from "react";
import { X, Building2, MapPin, Save, Plus } from "lucide-react";
import { MapProperty } from "@/lib/map/map-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function AddPropertyModal({
  isOpen,
  onClose,
  coordinates,
  onSaveProperty,
}: AddPropertyModalProps) {
  const [title, setTitle] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<any>("APARTMENT");
  const [transactionType, setTransactionType] = React.useState<"SALE" | "RENTAL">("SALE");
  const [price, setPrice] = React.useState("");
  const [surface, setSurface] = React.useState("");
  const [bedrooms, setBedrooms] = React.useState("2");
  const [bathrooms, setBathrooms] = React.useState("2");
  const [neighborhood, setNeighborhood] = React.useState("Malabata");
  const [address, setAddress] = React.useState("");
  const [titreFoncier, setTitreFoncier] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setPrice("");
      setSurface("");
      setAddress("");
      setDescription("");
      setTitreFoncier(`TF ${Math.floor(100000 + Math.random() * 900000)}/06`);
      setPhotoUrl(
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
      );
    }
  }, [isOpen]);

  if (!isOpen || !coordinates) return null;

  const [lng, lat] = coordinates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const parsedPrice = parseFloat(price);
    const parsedSurface = surface ? parseFloat(surface) : 100;
    const refNum = Math.floor(10 + Math.random() * 90);

    const newProperty: Partial<MapProperty> = {
      id: `p-${Date.now()}`,
      reference: `TNG-2026-0${refNum}`,
      title: title.trim(),
      propertyType,
      transactionType: [transactionType],
      price: parsedPrice,
      surface: parsedSurface,
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 0,
      neighborhood,
      city: "Tanger",
      address: address.trim() || `${neighborhood}, Tanger`,
      legalStatus: "TITLED",
      titreFoncier: titreFoncier.trim(),
      status: "ACTIVE",
      ownerName: "Client Particulier",
      ownerId: "c-1",
      mandateType: "exclusive",
      mandateExpiry: "2027-04-30",
      daysOnMarket: 1,
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      locationPrecision: "exact",
      photos: photoUrl.trim() ? [photoUrl.trim()] : undefined,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Ajouter un bien immobilier à cet emplacement</h3>
              <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-emerald-500" />
                <span>GPS : {lat.toFixed(6)}° N, {lng.toFixed(6)}° W</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          <div>
            <label className="font-semibold block mb-1">Titre de l'annonce <span className="text-rose-500">*</span></label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Appartement de standing avec vue mer dégagée"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Type de bien</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)] outline-none"
              >
                <option value="APARTMENT">Appartement</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="DUPLEX">Duplex</option>
                <option value="COMMERCIAL">Commercial / Bureau</option>
                <option value="LAND">Terrain</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Transaction</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)] outline-none"
              >
                <option value="SALE">Vente</option>
                <option value="RENTAL">Location</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Prix (MAD) <span className="text-rose-500">*</span></label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 1850000"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Surface (m²)</label>
              <Input
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ex: 120"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Chambres</label>
              <Input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="Ex: 3"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Salles de bain</label>
              <Input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Quartier (Tanger)</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs text-[var(--foreground)] outline-none"
              >
                {TANGIER_NEIGHBORHOOD_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Adresse / Résidence</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Résidence Cap Malabata"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Titre Foncier (Conservation Foncière Tanger)</label>
            <Input
              value={titreFoncier}
              onChange={(e) => setTitreFoncier(e.target.value)}
              placeholder="Ex: TF 145892/06"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description / Points forts</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-2 text-xs text-[var(--foreground)] outline-none"
              placeholder="Vue mer, terrasse, finitions marbre, parking sous-sol..."
            />
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button size="sm" variant="default" type="submit" leftIcon={<Save size={13} />}>
              Épingler et enregistrer le bien
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
