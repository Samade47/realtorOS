"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  User,
  Building,
  Shield,
  Bell,
  Moon,
  Sun,
  Laptop,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<"profile" | "business" | "commissions" | "notifications">("business");
  const [savedNotice, setSavedNotice] = React.useState(false);

  const [businessSettings, setBusinessSettings] = React.useState({
    fullName: "Badr El Mansouri",
    email: "badr@realtoros.ma",
    phone: "+212 6 61 88 99 00",
    agencyName: "Détroit Immobilier & Conseil",
    legalStatus: "Auto-entrepreneur",
    activity: "Agences immobilières et administration de biens immobiliers",
    ice: "002941882000034",
    ifNumber: "51294812",
    patente: "50481290",
    cnssNumber: "984120938",
    city: "Tanger",
    currency: "MAD (Dirham Marocain)",
    defaultSaleCommission: "2.5",
    defaultRentalCommission: "100", // 1 month
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Save Notice */}
      {savedNotice && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] border border-[var(--success)] text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-semibold">Paramètres enregistrés et appliqués à l'ensemble du système !</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Paramètres & Configuration de l'Espace
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Configurez votre profil d'agent, identifiants légaux marocains (ICE, IF, Patente) et barèmes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs overflow-x-auto">
        {[
          { id: "business", label: "Statut Commercial & Légal (Maroc)", icon: Building },
          { id: "profile", label: "Profil de l'Agent", icon: User },
          { id: "commissions", label: "Barème des Commissions par défaut", icon: Shield },
          { id: "notifications", label: "Apparence & Thème", icon: Moon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] font-medium transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "business" && (
        <Card>
          <CardHeader>
            <CardTitle>Identité Commerciale & Fiscalité Marocaine</CardTitle>
            <CardDescription>
              Renseignez les données légales figurant sur vos mandats, compromis et factures d'honoraires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Enseigne / Nom Commercial de l'Agence"
                  value={businessSettings.agencyName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, agencyName: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Forme Juridique
                  </label>
                  <select
                    value={businessSettings.legalStatus}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, legalStatus: e.target.value })}
                    className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs"
                  >
                    <option value="Auto-entrepreneur">Auto-entrepreneur (Régime fiscal allégé 1%)</option>
                    <option value="SARL">SARL / SARL d'Associé Unique</option>
                    <option value="Personne Physique">Personne Physique au réel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Activité Professionnelle Enregistrée
                </label>
                <input
                  type="text"
                  value={businessSettings.activity}
                  readOnly
                  className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--muted)]"
                />
              </div>

              {/* Moroccan Identifiers */}
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 bg-[var(--background)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Identifiants Fiscaux & Réglementaires Officiels
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    label="N° ICE (Identifiant Commun de l'Entreprise)"
                    value={businessSettings.ice}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, ice: e.target.value })}
                  />
                  <Input
                    label="Identifiant Fiscal (IF)"
                    value={businessSettings.ifNumber}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, ifNumber: e.target.value })}
                  />
                  <Input
                    label="Numéro de Taxe Professionnelle (Patente)"
                    value={businessSettings.patente}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, patente: e.target.value })}
                  />
                  <Input
                    label="N° d'Affiliation CNSS"
                    value={businessSettings.cnssNumber}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, cnssNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Ville d'exercice principale"
                  value={businessSettings.city}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, city: e.target.value })}
                />
                <Input
                  label="Devise de compte"
                  value={businessSettings.currency}
                  readOnly
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" leftIcon={<Save size={14} />}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profil de l'Agent Immobilier</CardTitle>
            <CardDescription>Coordonnées professionnelles et accès.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom & Prénom"
                  value={businessSettings.fullName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, fullName: e.target.value })}
                />
                <Input
                  label="Adresse Email"
                  type="email"
                  value={businessSettings.email}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Téléphone Professionnel (WhatsApp)"
                  value={businessSettings.phone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" leftIcon={<Save size={14} />}>
                  Mettre à jour mon profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "commissions" && (
        <Card>
          <CardHeader>
            <CardTitle>Barèmes des Honoraires d'Agence par Défaut</CardTitle>
            <CardDescription>
              Ces taux pré-remplissent automatiquement vos nouveaux mandats et nouvelles transactions (toujours modifiables par affaire).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Taux de commission moyen sur les ventes (%)"
                  value={businessSettings.defaultSaleCommission}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, defaultSaleCommission: e.target.value })}
                />
                <Input
                  label="Honoraires sur les locations (% d'un mois de loyer)"
                  value={businessSettings.defaultRentalCommission}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, defaultRentalCommission: e.target.value })}
                />
              </div>

              <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted)]">
                💡 <strong>Usage courant au Maroc :</strong> La commission de vente est traditionnellement de 2.5% à la charge de chaque partie (soit 5% au total), ou de 2.5% forfaitaire partagée. Pour la location, l'usage à Tanger est d'un mois de loyer à la charge du locataire.
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" leftIcon={<Save size={14} />}>
                  Appliquer les barèmes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Thème & Apparence</CardTitle>
            <CardDescription>Basculez entre le mode clair et le mode sombre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "light", label: "Mode Clair", icon: Sun },
                { id: "dark", label: "Mode Sombre", icon: Moon },
                { id: "system", label: "Système automatique", icon: Laptop },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id as any)}
                  className={`p-4 rounded-[var(--radius)] border flex items-center gap-3 transition-all ${
                    theme === opt.id
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-bold"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <opt.icon size={18} />
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
