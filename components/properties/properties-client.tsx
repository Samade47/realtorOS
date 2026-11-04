"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Key,
  Home,
  ShieldCheck,
  Maximize2,
  Bed,
  Bath,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { DEMO_PROPERTIES, DemoProperty } from "@/lib/data/demo-data";
import { formatMAD } from "@/lib/utils";

export function PropertiesClient() {
  const [properties, setProperties] = React.useState<DemoProperty[]>(DEMO_PROPERTIES);
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const [selectedTransaction, setSelectedTransaction] = React.useState<string>("ALL");

  const filteredProperties = React.useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(search.toLowerCase());

      const matchesType = selectedType === "ALL" || p.propertyType === selectedType;
      const matchesTrans =
        selectedTransaction === "ALL" ||
        (selectedTransaction === "SALE" && p.transactionType.includes("SALE")) ||
        (selectedTransaction === "RENTAL" && p.transactionType.includes("RENTAL"));

      return matchesSearch && matchesType && matchesTrans;
    });
  }, [properties, search, selectedType, selectedTransaction]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Disponible</Badge>;
      case "UNDER_NEGOTIATION":
        return <Badge variant="warning">Offre en cours</Badge>;
      case "RESERVED":
        return <Badge variant="info">Compromis signé</Badge>;
      case "SOLD":
        return <Badge variant="muted">Vendu</Badge>;
      case "RENTED":
        return <Badge variant="muted">Loué</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  const getLegalStatusBadge = (status: string) => {
    switch (status) {
      case "TITLED":
        return <Badge variant="outline">Titre Foncier (TF)</Badge>;
      case "VERIFIED":
        return <Badge variant="success">Juridiquement vérifié</Badge>;
      case "UNTITLED":
        return <Badge variant="warning">Melkia / Non titré</Badge>;
      default:
        return <Badge variant="muted">Vérification en cours</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Portefeuille de Biens Immobiliers
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {filteredProperties.length} biens sous mandat à Tanger • Ventes & Locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/map">
            <Button size="sm" variant="outline" leftIcon={<MapPin size={14} className="text-[var(--accent)]" />}>
              Vue Carte Interactive
            </Button>
          </Link>
          <Link href="/dashboard/properties/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              Ajouter un bien
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par référence, quartier, titre…"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:col-span-2">
          {/* Transaction Type Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            <span className="text-[var(--muted)] px-2 font-medium">Contrat :</span>
            {[
              { label: "Tous", val: "ALL" },
              { label: "Ventes", val: "SALE" },
              { label: "Locations", val: "RENTAL" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setSelectedTransaction(tab.val)}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors ${
                  selectedTransaction === tab.val
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Property Category Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            <span className="text-[var(--muted)] px-2 font-medium">Type :</span>
            {[
              { label: "Tous", val: "ALL" },
              { label: "Appartements", val: "APARTMENT" },
              { label: "Villas", val: "VILLA" },
              { label: "Studios", val: "STUDIO" },
              { label: "Bureaux", val: "COMMERCIAL" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setSelectedType(tab.val)}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors ${
                  selectedType === tab.val
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProperties.map((prop) => {
          const isExpiringSoon = prop.mandateExpiry <= "2026-12-15";

          return (
            <Card key={prop.id} className="overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all border-[var(--border)]">
              <div>
                {/* Header card with Property Reference & Badges */}
                <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      {prop.reference}
                    </span>
                    <Badge variant={prop.transactionType.includes("SALE") ? "default" : "info"}>
                      {prop.transactionType.includes("SALE") ? "Vente" : "Location"}
                    </Badge>
                  </div>
                  {getStatusBadge(prop.status)}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-[var(--accent)] shrink-0" />
                      {prop.neighborhood}, {prop.city} • {prop.address}
                    </p>
                  </div>

                  {/* Big Price */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs text-[var(--muted)] block">
                        {prop.transactionType.includes("RENTAL") ? "Loyer mensuel" : "Prix demandé"}
                      </span>
                      <span className="text-xl font-bold text-[var(--foreground)]">
                        {formatMAD(prop.price)}
                        {prop.transactionType.includes("RENTAL") && (
                          <span className="text-xs font-normal text-[var(--muted)]">/mois</span>
                        )}
                      </span>
                    </div>
                    {getLegalStatusBadge(prop.legalStatus)}
                  </div>

                  {/* Specs Pill Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] text-xs text-[var(--foreground)] text-center">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Surface</span>
                      <span className="font-semibold">{prop.surface} m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Chambres</span>
                      <span className="font-semibold">{prop.bedrooms} ch</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Salles d'eau</span>
                      <span className="font-semibold">{prop.bathrooms} sdb</span>
                    </div>
                  </div>

                  {/* Titre Foncier info */}
                  {prop.titreFoncier && (
                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 truncate">
                      <ShieldCheck size={13} className="text-[var(--success)] shrink-0" />
                      <span>{prop.titreFoncier}</span>
                    </div>
                  )}

                  {/* Mandate Expiry Alert Banner */}
                  {isExpiringSoon && (
                    <div className="rounded-[var(--radius-sm)] bg-[var(--warning-subtle)] border border-[var(--warning)]/30 p-2 text-[11px] text-[var(--warning)] flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>
                        Mandat expire le {new Date(prop.mandateExpiry).toLocaleDateString("fr-MA")} (
                        {prop.mandateType === "exclusive" ? "Exclusif" : "Simple"})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--muted)]">
                  Proprio : <span className="font-medium text-[var(--foreground)]">{prop.ownerName}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Link href={`/dashboard/transactions/new?propertyId=${prop.id}`}>
                    <Button variant="default" size="sm">
                      Créer offre
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
