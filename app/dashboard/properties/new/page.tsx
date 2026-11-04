"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Save, Building } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    propertyType: "APARTMENT",
    transactionType: "SALE",
    price: "",
    surface: "",
    bedrooms: "3",
    bathrooms: "2",
    neighborhood: "Malabata",
    city: "Tanger",
    address: "",
    titreFoncier: "",
    legalStatus: "TITLED",
    mandateType: "exclusive",
    ownerName: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/properties");
      }, 1200);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/properties">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Retour aux biens
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Bien Immobilier au Portefeuille</CardTitle>
          <CardDescription>
            Enregistrez les caractéristiques, le statut légal (Titre Foncier / Conservation) et les termes du mandat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-subtle)] text-[var(--success)]">
                <Check size={24} />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Bien enregistré et ajouté au portefeuille !
              </h3>
              <p className="text-xs text-[var(--muted)]">Redirection vers l'inventaire…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title & Classification */}
              <div className="space-y-4">
                <Input
                  label="Intitulé de l'annonce ou désignation du bien *"
                  required
                  placeholder="Ex: Appartement haut standing avec vue sur baie de Tanger"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Type de bien *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="APARTMENT">Appartement</option>
                      <option value="VILLA">Villa</option>
                      <option value="STUDIO">Studio</option>
                      <option value="DUPLEX">Duplex</option>
                      <option value="COMMERCIAL">Plateau bureau / Commercial</option>
                      <option value="LAND">Terrain titré</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Type d'opération *
                    </label>
                    <select
                      value={formData.transactionType}
                      onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="SALE">Vente</option>
                      <option value="RENTAL">Location longue durée</option>
                    </select>
                  </div>

                  <Input
                    label="Prix demandé (MAD) *"
                    required
                    placeholder="Ex: 1850000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              {/* Location & Surface */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Quartier à Tanger *
                  </label>
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    <option value="Malabata">Malabata</option>
                    <option value="Marshan">Marshan</option>
                    <option value="California">California</option>
                    <option value="Centre-ville">Centre-ville (Bd Pasteur)</option>
                    <option value="Iberia">Iberia</option>
                    <option value="Tanja Balia">Tanja Balia</option>
                    <option value="Val Fleuri">Val Fleuri</option>
                    <option value="Médina">Médina / Kasbah</option>
                  </select>
                </div>

                <Input
                  label="Surface habitable (m²) *"
                  required
                  placeholder="Ex: 125"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                />

                <Input
                  label="Adresse exacte / Résidence"
                  placeholder="Résidence Cap Malabata, Étage 5"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Legal Documentation Section */}
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 bg-[var(--background)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Conformité Juridique Marocaine & Foncier
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Statut Juridique Foncier
                    </label>
                    <select
                      value={formData.legalStatus}
                      onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="TITLED">Titré (Titre Foncier à la Conservation Foncière)</option>
                      <option value="UNTITLED">Melkia / Acte adoulaire / Non titré</option>
                      <option value="PENDING_VERIFICATION">Vérification en cours auprès du notaire</option>
                    </select>
                  </div>

                  <Input
                    label="Numéro de Titre Foncier (TF)"
                    placeholder="Ex: TF 145892/06 Tanger"
                    value={formData.titreFoncier}
                    onChange={(e) => setFormData({ ...formData, titreFoncier: e.target.value })}
                  />
                </div>
              </div>

              {/* Mandate & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom du Propriétaire vendeur/bailleur *"
                  required
                  placeholder="Ex: Laila Berrada"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Type de Mandat d'Agence
                  </label>
                  <select
                    value={formData.mandateType}
                    onChange={(e) => setFormData({ ...formData, mandateType: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    <option value="exclusive">Mandat Exclusif (Recommandé)</option>
                    <option value="simple">Mandat Simple (Sans exclusivité)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Description détaillée & atouts du bien
                </label>
                <textarea
                  rows={3}
                  placeholder="Vue panoramique, double façade, place de parking sous-sol titrée, cuisine équipée…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Link href="/dashboard/properties">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
                  Enregistrer le bien
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
