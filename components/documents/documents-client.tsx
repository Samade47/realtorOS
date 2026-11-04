"use client";

import * as React from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Calendar,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";

interface DemoDoc {
  id: string;
  name: string;
  category: "MANDAT" | "TITRE_FONCIER" | "NOTAIRE" | "FISCAL" | "CNSS" | "PIECE_IDENTITE";
  size: string;
  date: string;
  relatedEntity: string;
  verified: boolean;
}

const DEMO_DOCS: DemoDoc[] = [
  {
    id: "doc-1",
    name: "Mandat_Exclusif_Vente_Malabata_Berrada.pdf",
    category: "MANDAT",
    size: "1.4 Mo",
    date: "2026-09-01",
    relatedEntity: "Bien TNG-2026-042",
    verified: true,
  },
  {
    id: "doc-2",
    name: "Certificat_Propriete_TF_145892_06_Conservation.pdf",
    category: "TITRE_FONCIER",
    size: "2.1 Mo",
    date: "2026-09-05",
    relatedEntity: "Malabata Baie de Tanger",
    verified: true,
  },
  {
    id: "doc-3",
    name: "Compromis_Vente_Duplex_California_Etude_Filali.pdf",
    category: "NOTAIRE",
    size: "3.2 Mo",
    date: "2026-10-24",
    relatedEntity: "TRX-2026-015 (Me Filali)",
    verified: true,
  },
  {
    id: "doc-4",
    name: "Attestation_Inscription_AutoEntrepreneur_RNVE.pdf",
    category: "FISCAL",
    size: "850 Ko",
    date: "2026-01-10",
    relatedEntity: "Statut Auto-Entrepreneur DGI",
    verified: true,
  },
  {
    id: "doc-5",
    name: "Recu_Paiement_Cotisation_AMO_T3_2026.pdf",
    category: "CNSS",
    size: "620 Ko",
    date: "2026-09-30",
    relatedEntity: "CNSS N° 984120938",
    verified: true,
  },
  {
    id: "doc-6",
    name: "Copie_CIN_Legalisee_Amine_Tazi.pdf",
    category: "PIECE_IDENTITE",
    size: "1.1 Mo",
    date: "2026-10-18",
    relatedEntity: "Client Acquéreur",
    verified: true,
  },
];

export function DocumentsClient() {
  const [docs, setDocs] = React.useState<DemoDoc[]>(DEMO_DOCS);
  const [search, setSearch] = React.useState("");
  const [selectedCat, setSelectedCat] = React.useState<string>("ALL");
  const [uploadNotice, setUploadNotice] = React.useState<string | null>(null);

  const filtered = docs.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.relatedEntity.toLowerCase().includes(search.toLowerCase());

    const matchCat = selectedCat === "ALL" || d.category === selectedCat;

    return matchSearch && matchCat;
  });

  const getCategoryLabel = (cat: DemoDoc["category"]) => {
    switch (cat) {
      case "MANDAT":
        return { label: "Mandat d'Agence", variant: "default" as const };
      case "TITRE_FONCIER":
        return { label: "Conservation Foncière", variant: "success" as const };
      case "NOTAIRE":
        return { label: "Compromis Notarié", variant: "warning" as const };
      case "FISCAL":
        return { label: "DGI / Fiscal", variant: "info" as const };
      case "CNSS":
        return { label: "CNSS / AMO", variant: "outline" as const };
      default:
        return { label: "Identité", variant: "muted" as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload notice */}
      {uploadNotice && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] border border-[var(--success)] text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{uploadNotice}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Coffre-fort Numérique des Documents
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Archivage sécurisé des mandats légaux, titres fonciers, compromis notariés et pièces d'identité
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const f = e.target.files[0];
                  setDocs([
                    {
                      id: `doc-${Date.now()}`,
                      name: f.name,
                      category: "MANDAT",
                      size: `${(f.size / (1024 * 1024)).toFixed(1)} Mo`,
                      date: new Date().toISOString().split("T")[0],
                      relatedEntity: "Dossier en cours",
                      verified: true,
                    },
                    ...docs,
                  ]);
                  setUploadNotice(`Document "${f.name}" archivé avec succès.`);
                  setTimeout(() => setUploadNotice(null), 4000);
                }
              }}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity">
              <Upload size={14} />
              Téléverser un document
            </span>
          </label>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par nom de fichier, référence…"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:col-span-2">
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-xs">
            <span className="text-[var(--muted)] px-2 font-medium">Catégorie :</span>
            {[
              { label: "Tous", val: "ALL" },
              { label: "Mandats", val: "MANDAT" },
              { label: "Titres Fonciers", val: "TITRE_FONCIER" },
              { label: "Notaire", val: "NOTAIRE" },
              { label: "Fiscalité DGI", val: "FISCAL" },
              { label: "CNSS", val: "CNSS" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setSelectedCat(tab.val)}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors shrink-0 ${
                  selectedCat === tab.val
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

      {/* Documents List Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle>Documents Légaux & Administratifs Disponibles</CardTitle>
          <CardDescription>
            Conforme aux normes de tenue des dossiers de transaction immobilière au Maroc
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border)] p-0">
          {filtered.map((doc) => {
            const cat = getCategoryLabel(doc.category);

            return (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--border-subtle)] transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--foreground)] truncate">{doc.name}</p>
                    <p className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Ajouté le {doc.date}</span>
                      <span>•</span>
                      <span className="font-medium text-[var(--foreground)]">{doc.relatedEntity}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <Badge variant={cat.variant}>{cat.label}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert(`Téléchargement de la pièce : ${doc.name}`);
                    }}
                    leftIcon={<Download size={13} />}
                  >
                    Ouvrir
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
