"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "Tanger",
    contactType: "BUYER",
    budget: "",
    leadSource: "Annonce en ligne",
    financing: "cash",
    titledRequired: true,
    preferredNeighborhood: "Malabata",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/contacts");
      }, 1200);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Retour aux contacts
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau Contact / Lead</CardTitle>
          <CardDescription>
            Enregistrez un nouvel acquéreur, vendeur, bailleur ou notaire partenaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-subtle)] text-[var(--success)]">
                <Check size={24} />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Contact enregistré avec succès !
              </h3>
              <p className="text-xs text-[var(--muted)]">Redirection vers le carnet de contacts…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Type de contact *
                  </label>
                  <select
                    value={formData.contactType}
                    onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    <option value="BUYER">Acheteur (Acquéreur)</option>
                    <option value="SELLER">Vendeur (Propriétaire)</option>
                    <option value="INVESTOR">Investisseur</option>
                    <option value="TENANT">Locataire</option>
                    <option value="LANDLORD">Bailleur</option>
                    <option value="AGENCY">Agence Partenaire</option>
                    <option value="NOTARY">Notaire</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Source du prospect
                  </label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                  >
                    <option value="Annonce en ligne">Portail / Annonce en ligne</option>
                    <option value="Bouche à oreille">Bouche à oreille / Recommandation</option>
                    <option value="Panneau">Panneau sur bien</option>
                    <option value="Réseau pro">Réseau pro / Agence partenaire</option>
                    <option value="Réseaux sociaux">Facebook / Instagram Ads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  required
                  placeholder="Ex: Amine"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Nom *"
                  required
                  placeholder="Ex: Tazi"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Téléphone principal *"
                  required
                  placeholder="+212 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Numéro WhatsApp"
                  placeholder="+212 6 XX XX XX XX"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
                <Input
                  label="Adresse Email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Buyer Qualification Section */}
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 bg-[var(--background)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Qualification du besoin à Tanger
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Budget Estimé (MAD)"
                    placeholder="Ex: 1850000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Secteur privilégié
                    </label>
                    <select
                      value={formData.preferredNeighborhood}
                      onChange={(e) => setFormData({ ...formData, preferredNeighborhood: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="Malabata">Malabata / Baie de Tanger</option>
                      <option value="Marshan">Marshan / Vieille Montagne</option>
                      <option value="California">California</option>
                      <option value="Centre-ville">Centre-ville / Bd Pasteur</option>
                      <option value="Iberia">Iberia / Place de la Kasbah</option>
                      <option value="Tanja Balia">Tanja Balia</option>
                      <option value="Val Fleuri">Val Fleuri</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                      Mode de paiement
                    </label>
                    <select
                      value={formData.financing}
                      onChange={(e) => setFormData({ ...formData, financing: e.target.value })}
                      className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    >
                      <option value="cash">Fonds propres (Comptant)</option>
                      <option value="bank">Crédit bancaire marocain</option>
                      <option value="mre">Financement MRE / Devises</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Notes particulières & contexte
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Précisez ses critères : étage élevé, vue mer, ascenseur, garage titré, date butoir…"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Link href="/dashboard/contacts">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
                  Enregistrer le contact
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
