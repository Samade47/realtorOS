"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Building,
  DollarSign,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DEMO_CONTACTS, DemoContact } from "@/lib/data/demo-data";
import { formatMAD, getInitials, getStatusColor } from "@/lib/utils";

export function ContactsClient() {
  const [contacts, setContacts] = React.useState<DemoContact[]>(DEMO_CONTACTS);
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedContact, setSelectedContact] = React.useState<DemoContact | null>(contacts[0]);

  const filteredContacts = React.useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesType = selectedType === "ALL" || c.contactType === selectedType;
      const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contacts, search, selectedType, selectedStatus]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "BUYER":
        return { label: "Acheteur", variant: "info" as const };
      case "SELLER":
        return { label: "Vendeur", variant: "warning" as const };
      case "TENANT":
        return { label: "Locataire", variant: "default" as const };
      case "LANDLORD":
        return { label: "Bailleur", variant: "success" as const };
      case "INVESTOR":
        return { label: "Investisseur", variant: "danger" as const };
      case "AGENCY":
        return { label: "Agence Partenaire", variant: "muted" as const };
      case "NOTARY":
        return { label: "Notaire", variant: "outline" as const };
      default:
        return { label: type, variant: "muted" as const };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="info">Nouveau</Badge>;
      case "QUALIFIED":
        return <Badge variant="success">Qualifié</Badge>;
      case "ACTIVE":
        return <Badge variant="default">En recherche active</Badge>;
      case "NEGOTIATION":
        return <Badge variant="warning">En négociation</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Gestion des Contacts (CRM)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {filteredContacts.length} contacts qualifiés • Acheteurs, Vendeurs & Notaires à Tanger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/contacts/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              Nouveau contact
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par nom, téléphone, ville, notes…"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:col-span-2">
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            <span className="text-[var(--muted)] px-2 font-medium">Type :</span>
            {[
              { label: "Tous", val: "ALL" },
              { label: "Acheteurs", val: "BUYER" },
              { label: "Vendeurs", val: "SELLER" },
              { label: "Investisseurs", val: "INVESTOR" },
              { label: "Locataires", val: "TENANT" },
              { label: "Notaires", val: "NOTARY" },
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

      {/* 2-Column Layout: Contacts List on Left, Selected Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Contact Cards List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredContacts.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--muted)]">
              Aucun contact trouvé pour cette recherche.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const typeInfo = getTypeLabel(contact.contactType);
              const isSelected = selectedContact?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)]/40 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar size="md">
                        <AvatarFallback>{getInitials(contact.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {contact.fullName}
                          </h3>
                          <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                        </div>
                        <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                          <MapPin size={11} />
                          {contact.city} • Score Lead :{" "}
                          <span className="font-semibold text-[var(--foreground)]">
                            {contact.leadScore}/100
                          </span>
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(contact.status)}
                  </div>

                  {/* Contact tags & budget snippet */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]/60">
                    <span className="text-[var(--muted)] flex items-center gap-1 truncate">
                      {contact.budget ? (
                        <span className="font-semibold text-[var(--foreground)]">
                          Budget : {formatMAD(contact.budget)}
                        </span>
                      ) : (
                        <span>Source : {contact.leadSource}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] shrink-0">
                      Tél : {contact.phone}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Contact Profile Drawer */}
        <div className="lg:col-span-7">
          {selectedContact ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-4 border-b border-[var(--border)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <Avatar size="lg">
                      <AvatarFallback className="text-base">
                        {getInitials(selectedContact.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{selectedContact.fullName}</CardTitle>
                        <Badge variant={getTypeLabel(selectedContact.contactType).variant}>
                          {getTypeLabel(selectedContact.contactType).label}
                        </Badge>
                      </div>
                      <CardDescription className="mt-0.5">
                        Ajouté le {new Date(selectedContact.createdAt).toLocaleDateString("fr-MA")} •{" "}
                        Source : {selectedContact.leadSource}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${selectedContact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm" leftIcon={<MessageSquare size={13} />}>
                        WhatsApp
                      </Button>
                    </a>
                    <a href={`tel:${selectedContact.phone}`}>
                      <Button variant="default" size="sm" leftIcon={<Phone size={13} />}>
                        Appeler
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Contact Coordinates */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-2.5 bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Téléphone direct</span>
                    <span className="font-semibold text-[var(--foreground)]">{selectedContact.phone}</span>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-2.5 bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Email</span>
                    <span className="font-semibold text-[var(--foreground)] truncate block">
                      {selectedContact.email}
                    </span>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-2.5 bg-[var(--background)]">
                    <span className="text-[var(--muted)] block">Ville & Secteur</span>
                    <span className="font-semibold text-[var(--foreground)]">{selectedContact.city}</span>
                  </div>
                </div>

                {/* Qualification Criteria */}
                {selectedContact.contactType === "BUYER" || selectedContact.contactType === "INVESTOR" ? (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 bg-[var(--surface)] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Critères de recherche acquéreur
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[var(--muted)] block">Budget Maximal</span>
                        <span className="text-base font-bold text-[var(--foreground)]">
                          {selectedContact.budget ? formatMAD(selectedContact.budget) : "Non précisé"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] block">Financement</span>
                        <span className="font-semibold capitalize text-[var(--foreground)]">
                          {selectedContact.financing === "cash" ? "Fonds propres (Comptant)" : "Crédit bancaire"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] block">Exigence Juridique</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {selectedContact.titledRequired ? "Titre Foncier Obligatoire (Conservation)" : "Indifférent"}
                        </span>
                      </div>
                    </div>

                    {selectedContact.preferredNeighborhoods && (
                      <div className="pt-2 border-t border-[var(--border)] text-xs">
                        <span className="text-[var(--muted)] block mb-1">Quartiers ciblés à Tanger :</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedContact.preferredNeighborhoods.map((n) => (
                            <Badge key={n} variant="muted">
                              📍 {n}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Notes & Context */}
                {selectedContact.notes && (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3.5 bg-[var(--border-subtle)] text-xs">
                    <span className="font-bold text-[var(--foreground)] block mb-1">Notes de qualification :</span>
                    <p className="text-[var(--muted)] leading-relaxed">{selectedContact.notes}</p>
                  </div>
                )}

                {/* Tags */}
                {selectedContact.tags && selectedContact.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[var(--muted)] mr-1">Tags :</span>
                    {selectedContact.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] text-xs">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/transactions/new?clientId=${selectedContact.id}`}>
                      <Button variant="default" size="sm" leftIcon={<DollarSign size={13} />}>
                        Créer une transaction
                      </Button>
                    </Link>
                    <Link href={`/dashboard/calendar?new=task&contactId=${selectedContact.id}`}>
                      <Button variant="outline" size="sm">
                        Planifier un rappel
                      </Button>
                    </Link>
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">
                    Réf : {selectedContact.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] p-12 text-center text-xs text-[var(--muted)]">
              Sélectionnez un contact pour afficher sa fiche complète.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
