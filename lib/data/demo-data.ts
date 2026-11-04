// Demo Data for RealtorOS Morocco (Tangier workspace)
// Clearly designated as realistic demonstration data

export interface DemoContact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  contactType: "BUYER" | "SELLER" | "TENANT" | "LANDLORD" | "INVESTOR" | "AGENCY" | "NOTARY";
  leadSource: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "ACTIVE" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";
  leadScore: number;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastInteraction?: string;
  // Qualification
  budget?: number;
  propertyType?: string[];
  preferredNeighborhoods?: string[];
  titledRequired?: boolean;
  financing?: "cash" | "bank" | "both";
  intendedUse?: "residence" | "investment";
}

export interface DemoProperty {
  id: string;
  reference: string;
  title: string;
  propertyType: "APARTMENT" | "VILLA" | "STUDIO" | "DUPLEX" | "COMMERCIAL" | "LAND";
  transactionType: ("SALE" | "RENTAL")[];
  price: number;
  neighborhood: string;
  city: string;
  address: string;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  furnished: "furnished" | "unfurnished" | "optional";
  condition: "new" | "good" | "needs_work";
  legalStatus: "TITLED" | "UNTITLED" | "PENDING_VERIFICATION" | "VERIFIED";
  titreFoncier?: string;
  status: "NEW" | "ACTIVE" | "RESERVED" | "UNDER_NEGOTIATION" | "SOLD" | "RENTED";
  ownerName: string;
  ownerId: string;
  mandateType: "exclusive" | "simple";
  mandateExpiry: string;
  daysOnMarket: number;
  description: string;
}

export interface DemoTransaction {
  id: string;
  reference: string;
  type: "SALE" | "RENTAL";
  propertyTitle: string;
  propertyId: string;
  propertyRef: string;
  clientName: string;
  clientId: string;
  sellerName: string;
  sellerId: string;
  agencyName?: string;
  value: number;
  agreedCommission: number;
  commissionRate: number;
  commissionPayer: "buyer" | "seller" | "both" | "agency";
  agentShare: number;
  agencyShare: number;
  status: "LEAD" | "QUALIFIED" | "VISIT_SCHEDULED" | "OFFER_SUBMITTED" | "NEGOTIATION" | "AGREEMENT" | "CONTRACT_SIGNED" | "COMPLETED";
  stageName: string;
  contractDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface DemoCommission {
  id: string;
  transactionId: string;
  transactionRef: string;
  propertyTitle: string;
  type: "SALE" | "RENTAL";
  totalAgreed: number;
  totalEarned: number;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  status: "EXPECTED" | "INVOICED" | "PARTIAL" | "COLLECTED" | "OVERDUE";
  dueDate: string;
  payments: {
    id: string;
    amount: number;
    date: string;
    method: "transfer" | "cash" | "cheque";
    payer: string;
    ref?: string;
  }[];
}

export interface DemoExpense {
  id: string;
  date: string;
  category: "FUEL" | "ADVERTISING" | "PHONE" | "SOFTWARE" | "PHOTOGRAPHY" | "OFFICE" | "CNSS_AMO" | "OTHER";
  description: string;
  amount: number;
  supplier: string;
  paymentMethod: "cash" | "transfer" | "card";
  deductible: boolean;
}

export interface DemoTask {
  id: string;
  title: string;
  type: "FOLLOW_UP" | "PROPERTY_VISIT" | "MEETING" | "COMMISSION" | "TAX" | "CNSS" | "MANDATE";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  relatedContact?: string;
  relatedProperty?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_CONTACTS: DemoContact[] = [
  {
    id: "c-1",
    firstName: "Amine",
    lastName: "Tazi",
    fullName: "Amine Tazi",
    phone: "+212 6 61 23 45 67",
    whatsapp: "+212 6 61 23 45 67",
    email: "amine.tazi@gmail.com",
    city: "Tanger",
    contactType: "BUYER",
    leadSource: "Annonce en ligne",
    status: "QUALIFIED",
    leadScore: 88,
    tags: ["MRE", "Comptant", "Urgent"],
    createdAt: "2026-10-15T10:00:00Z",
    lastInteraction: "2026-11-02T14:30:00Z",
    budget: 1850000,
    propertyType: ["APARTMENT", "DUPLEX"],
    preferredNeighborhoods: ["Malabata", "Iberia", "Centre-ville"],
    titledRequired: true,
    financing: "cash",
    intendedUse: "residence",
    notes: "MRE résidant à Bruxelles, cherche un 3 chambres vue mer pour acquisition avant fin d'année.",
  },
  {
    id: "c-2",
    firstName: "Laila",
    lastName: "Berrada",
    fullName: "Laila Berrada",
    phone: "+212 6 62 98 76 54",
    whatsapp: "+212 6 62 98 76 54",
    email: "laila.berrada@yahoo.fr",
    city: "Tanger",
    contactType: "SELLER",
    leadSource: "Bouche à oreille",
    status: "ACTIVE",
    leadScore: 92,
    tags: ["Propriétaire", "Mandat Exclusif", "Titre Foncier"],
    createdAt: "2026-09-20T11:00:00Z",
    lastInteraction: "2026-11-01T16:00:00Z",
    notes: "Propriétaire villa Marshan avec vue sur le détroit. Mandat exclusif en cours.",
  },
  {
    id: "c-3",
    firstName: "Karim",
    lastName: "El Idrissi",
    fullName: "Karim El Idrissi",
    phone: "+212 6 63 11 22 33",
    whatsapp: "+212 6 63 11 22 33",
    email: "k.elidrissi@outlook.com",
    city: "Tanger",
    contactType: "INVESTOR",
    leadSource: "Réseau pro",
    status: "NEGOTIATION",
    leadScore: 95,
    tags: ["Investisseur", "Locatif", "Multi-biens"],
    createdAt: "2026-08-10T09:00:00Z",
    lastInteraction: "2026-11-03T11:15:00Z",
    budget: 3500000,
    propertyType: ["APARTMENT", "COMMERCIAL"],
    preferredNeighborhoods: ["Centre-ville", "California"],
    financing: "cash",
    intendedUse: "investment",
    notes: "Cherche rendement brut > 8% sur Tanger. Prêt à signer pour studio ou plateau bureau.",
  },
  {
    id: "c-4",
    firstName: "Nadia",
    lastName: "Chraibi",
    fullName: "Nadia Chraibi",
    phone: "+212 6 64 55 44 33",
    whatsapp: "+212 6 64 55 44 33",
    email: "nadia.chraibi@gmail.com",
    city: "Tanger",
    contactType: "TENANT",
    leadSource: "Site web",
    status: "ACTIVE",
    leadScore: 78,
    tags: ["Expat", "Location longue durée"],
    createdAt: "2026-10-28T14:00:00Z",
    lastInteraction: "2026-11-02T10:00:00Z",
    budget: 12000,
    propertyType: ["APARTMENT"],
    preferredNeighborhoods: ["Malabata", "Centre-ville"],
    notes: "Cadre chez Renault Melloussa, emménagement prévu le 1er décembre.",
  },
  {
    id: "c-5",
    firstName: "Me Hassan",
    lastName: "Filali",
    fullName: "Me Hassan Filali",
    phone: "+212 5 39 94 12 34",
    whatsapp: "+212 6 60 00 11 22",
    email: "etude.filali.notaire@gmail.com",
    city: "Tanger",
    contactType: "NOTARY",
    leadSource: "Partenaire",
    status: "ACTIVE",
    leadScore: 99,
    tags: ["Notaire", "Partenaire clé"],
    createdAt: "2026-01-15T09:00:00Z",
    lastInteraction: "2026-10-30T15:00:00Z",
    notes: "Notaire attitré pour les compromis et actes définitifs à Tanger (Boulevard Pasteur).",
  },
  {
    id: "c-6",
    firstName: "Rachid",
    lastName: "Mansouri",
    fullName: "Rachid Mansouri",
    phone: "+212 6 65 77 88 99",
    whatsapp: "+212 6 65 77 88 99",
    email: "r.mansouri@tangier-immo.ma",
    city: "Tanger",
    contactType: "AGENCY",
    leadSource: "Partenariat inter-agence",
    status: "ACTIVE",
    leadScore: 85,
    tags: ["Inter-cabinet", "Partage 50/50"],
    createdAt: "2026-04-12T10:00:00Z",
    lastInteraction: "2026-11-01T17:30:00Z",
    notes: "Agence partenaire Tanger Immo Prestige. Partage d'honoraires 50/50 sur mandats croisés.",
  },
  {
    id: "c-7",
    firstName: "Youssef",
    lastName: "Alami",
    fullName: "Youssef Alami",
    phone: "+212 6 68 33 44 55",
    whatsapp: "+212 6 68 33 44 55",
    email: "youssef.alami88@gmail.com",
    city: "Tanger",
    contactType: "BUYER",
    leadSource: "Panneau",
    status: "NEW",
    leadScore: 65,
    tags: ["Crédit bancaire"],
    createdAt: "2026-11-03T08:30:00Z",
    budget: 950000,
    propertyType: ["APARTMENT"],
    preferredNeighborhoods: ["Tanja Balia", "Val Fleuri"],
    titledRequired: true,
    financing: "bank",
    notes: "Appel suite au panneau Tanja Balia. Pré-accord bancaire en cours chez Attijariwafa.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "p-1",
    reference: "TNG-2026-042",
    title: "Appartement standing avec terrasse vue mer — Malabata",
    propertyType: "APARTMENT",
    transactionType: ["SALE"],
    price: 1850000,
    neighborhood: "Malabata",
    city: "Tanger",
    address: "Résidence Cap Malabata, Étage 5",
    surface: 125,
    bedrooms: 3,
    bathrooms: 2,
    floor: 5,
    furnished: "unfurnished",
    condition: "good",
    legalStatus: "TITLED",
    titreFoncier: "TF 145892/06 (Conservation Foncière Tanger)",
    status: "UNDER_NEGOTIATION",
    ownerName: "Laila Berrada",
    ownerId: "c-2",
    mandateType: "exclusive",
    mandateExpiry: "2026-11-28", // Expires soon!
    daysOnMarket: 45,
    description: "Superbe appartement traversant avec terrasse de 22m² offrant une vue panoramique sur la baie de Tanger.",
  },
  {
    id: "p-2",
    reference: "TNG-2026-039",
    title: "Villa de charme avec jardin et piscine — Marshan",
    propertyType: "VILLA",
    transactionType: ["SALE"],
    price: 4200000,
    neighborhood: "Marshan",
    city: "Tanger",
    address: "Quartier Marshan, proximité Palais Mendoub",
    surface: 380,
    bedrooms: 5,
    bathrooms: 4,
    furnished: "unfurnished",
    condition: "good",
    legalStatus: "TITLED",
    titreFoncier: "TF 098412/06",
    status: "ACTIVE",
    ownerName: "Laila Berrada",
    ownerId: "c-2",
    mandateType: "simple",
    mandateExpiry: "2027-02-15",
    daysOnMarket: 72,
    description: "Demeure d'architecte dans l'un des quartiers les plus recherchés de Tanger. Calme absolu.",
  },
  {
    id: "p-3",
    reference: "TNG-2026-051",
    title: "Studio moderne entièrement meublé — Centre-ville",
    propertyType: "STUDIO",
    transactionType: ["RENTAL"],
    price: 6500,
    neighborhood: "Centre-ville",
    city: "Tanger",
    address: "Boulevard Pasteur, Résidence Cervantes",
    surface: 48,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    furnished: "furnished",
    condition: "new",
    legalStatus: "VERIFIED",
    titreFoncier: "TF 167332/06",
    status: "ACTIVE",
    ownerName: "Karim El Idrissi",
    ownerId: "c-3",
    mandateType: "exclusive",
    mandateExpiry: "2027-05-01",
    daysOnMarket: 14,
    description: "Idéal pour consultant ou cadre. Prestations haut de gamme, fibre optique, climatisation réversible.",
  },
  {
    id: "p-4",
    reference: "TNG-2026-035",
    title: "Duplex contemporain avec solarium — California",
    propertyType: "DUPLEX",
    transactionType: ["SALE"],
    price: 2900000,
    neighborhood: "California",
    city: "Tanger",
    address: "Colline de California, Résidence Les Oliviers",
    surface: 210,
    bedrooms: 4,
    bathrooms: 3,
    floor: 4,
    furnished: "optional",
    condition: "new",
    legalStatus: "TITLED",
    titreFoncier: "TF 201449/06",
    status: "RESERVED",
    ownerName: "Driss Tber",
    ownerId: "c-8",
    mandateType: "exclusive",
    mandateExpiry: "2026-12-31",
    daysOnMarket: 30,
    description: "Emplacement prestigieux, double salon, suite parentale avec dressing et terrasse privative.",
  },
  {
    id: "p-5",
    reference: "TNG-2026-028",
    title: "Plateau de bureaux aménagé 140m² — Iberia",
    propertyType: "COMMERCIAL",
    transactionType: ["RENTAL", "SALE"],
    price: 18000, // Rental: 18k / Sale: 2.4M
    neighborhood: "Iberia",
    city: "Tanger",
    address: "Place de la Kasbah / Iberia",
    surface: 140,
    bedrooms: 0,
    bathrooms: 2,
    floor: 2,
    furnished: "unfurnished",
    condition: "good",
    legalStatus: "TITLED",
    titreFoncier: "TF 112044/06",
    status: "ACTIVE",
    ownerName: "Société Foncière Détroit",
    ownerId: "c-9",
    mandateType: "simple",
    mandateExpiry: "2027-01-10",
    daysOnMarket: 85,
    description: "Parfait pour cabinet d'avocat, notaire, agence digitale ou bureau d'architecture.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: "tx-1",
    reference: "TRX-2026-018",
    type: "SALE",
    propertyTitle: "Appartement Malabata vue mer (125m²)",
    propertyId: "p-1",
    propertyRef: "TNG-2026-042",
    clientName: "Amine Tazi",
    clientId: "c-1",
    sellerName: "Laila Berrada",
    sellerId: "c-2",
    value: 1850000,
    agreedCommission: 46250, // 2.5%
    commissionRate: 0.025,
    commissionPayer: "both", // 1.25% seller + 1.25% buyer
    agentShare: 46250,
    agencyShare: 0,
    status: "NEGOTIATION",
    stageName: "Négociation du compromis",
    contractDate: "2026-11-15",
    notes: "Offre acceptée verbalement à 1 850 000 MAD. Rendez-vous chez Me Filali le 12 novembre.",
  },
  {
    id: "tx-2",
    reference: "TRX-2026-017",
    type: "RENTAL",
    propertyTitle: "Studio moderne meublé Boulevard Pasteur",
    propertyId: "p-3",
    propertyRef: "TNG-2026-051",
    clientName: "Nadia Chraibi",
    clientId: "c-4",
    sellerName: "Karim El Idrissi",
    sellerId: "c-3",
    value: 6500, // Monthly
    agreedCommission: 6500, // 1 month
    commissionRate: 1.0,
    commissionPayer: "buyer", // 1 month by tenant
    agentShare: 6500,
    agencyShare: 0,
    status: "OFFER_SUBMITTED",
    stageName: "Validation du dossier locataire",
    contractDate: "2026-11-10",
    notes: "Fiches de paie Renault transmises et vérifiées. En attente de validation par le propriétaire.",
  },
  {
    id: "tx-3",
    reference: "TRX-2026-015",
    type: "SALE",
    propertyTitle: "Duplex avec solarium California",
    propertyId: "p-4",
    propertyRef: "TNG-2026-035",
    clientName: "Karim El Idrissi",
    clientId: "c-3",
    sellerName: "Driss Tber",
    sellerId: "c-8",
    value: 2900000,
    agreedCommission: 72500, // 2.5%
    commissionRate: 0.025,
    commissionPayer: "both",
    agentShare: 72500,
    agencyShare: 0,
    status: "CONTRACT_SIGNED",
    stageName: "Compromis signé chez le notaire",
    contractDate: "2026-10-24",
    completionDate: "2026-11-30",
    notes: "Compromis signé chez Me Filali avec dépôt de garantie de 290 000 MAD séquestré.",
  },
  {
    id: "tx-4",
    reference: "TRX-2026-012",
    type: "SALE",
    propertyTitle: "Appartement 3 ch Iberia Tanger",
    propertyId: "p-6",
    propertyRef: "TNG-2026-019",
    clientName: "Mehdi Benjelloun",
    clientId: "c-10",
    sellerName: "Fatima Zahraoui",
    sellerId: "c-11",
    agencyName: "Tanger Immo Prestige",
    value: 1400000,
    agreedCommission: 35000, // Total 2.5% = 35 000 MAD
    commissionRate: 0.025,
    commissionPayer: "agency",
    agentShare: 17500, // 50% inter-cabinet
    agencyShare: 17500,
    status: "COMPLETED",
    stageName: "Acte authentique signé & commission perçue",
    contractDate: "2026-09-15",
    completionDate: "2026-10-18",
    notes: "Partage 50/50 avec Tanger Immo Prestige. Acte définitif conclu.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMMISSIONS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_COMMISSIONS: DemoCommission[] = [
  {
    id: "com-1",
    transactionId: "tx-4",
    transactionRef: "TRX-2026-012",
    propertyTitle: "Appartement 3 ch Iberia Tanger",
    type: "SALE",
    totalAgreed: 17500, // Agent's net share
    totalEarned: 17500,
    totalInvoiced: 17500,
    totalCollected: 17500,
    totalOutstanding: 0,
    status: "COLLECTED",
    dueDate: "2026-10-20",
    payments: [
      {
        id: "pay-1",
        amount: 17500,
        date: "2026-10-22",
        method: "transfer",
        payer: "Tanger Immo Prestige SARL",
        ref: "VIR-99412-BMCE",
      },
    ],
  },
  {
    id: "com-2",
    transactionId: "tx-3",
    transactionRef: "TRX-2026-015",
    propertyTitle: "Duplex avec solarium California",
    type: "SALE",
    totalAgreed: 72500,
    totalEarned: 72500,
    totalInvoiced: 72500,
    totalCollected: 36250, // 50% deposit received
    totalOutstanding: 36250,
    status: "PARTIAL",
    dueDate: "2026-11-30",
    payments: [
      {
        id: "pay-2",
        amount: 36250,
        date: "2026-10-25",
        method: "cheque",
        payer: "Karim El Idrissi (Acheteur)",
        ref: "CHQ-88123-ATW",
      },
    ],
  },
  {
    id: "com-3",
    transactionId: "tx-1",
    transactionRef: "TRX-2026-018",
    propertyTitle: "Appartement Malabata vue mer",
    type: "SALE",
    totalAgreed: 46250,
    totalEarned: 0, // In negotiation
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 46250,
    status: "EXPECTED",
    dueDate: "2026-12-15",
    payments: [],
  },
  {
    id: "com-4",
    transactionId: "tx-2",
    transactionRef: "TRX-2026-017",
    propertyTitle: "Studio moderne Boulevard Pasteur",
    type: "RENTAL",
    totalAgreed: 6500,
    totalEarned: 0,
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 6500,
    status: "EXPECTED",
    dueDate: "2026-11-15",
    payments: [],
  },
  {
    id: "com-5",
    transactionId: "tx-prev-1",
    transactionRef: "TRX-2026-009",
    propertyTitle: "Appartement Val Fleuri Tanger",
    type: "SALE",
    totalAgreed: 25000,
    totalEarned: 25000,
    totalInvoiced: 25000,
    totalCollected: 15000,
    totalOutstanding: 10000,
    status: "OVERDUE", // Overdue by 14 days
    dueDate: "2026-10-20",
    payments: [
      {
        id: "pay-3",
        amount: 15000,
        date: "2026-10-18",
        method: "cash",
        payer: "Samir Kadiri",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSES (Real Moroccan agent operating costs)
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_EXPENSES: DemoExpense[] = [
  {
    id: "exp-1",
    date: "2026-11-01",
    category: "FUEL",
    description: "Carburant Total Tanger Malabata (Visites clients)",
    amount: 650,
    supplier: "TotalEnergies Malabata",
    paymentMethod: "card",
    deductible: false,
  },
  {
    id: "exp-2",
    date: "2026-10-28",
    category: "ADVERTISING",
    description: "Campagne sponsorisée Instagram/Facebook (Villa Marshan)",
    amount: 1200,
    supplier: "Meta Platforms",
    paymentMethod: "card",
    deductible: false,
  },
  {
    id: "exp-3",
    date: "2026-10-25",
    category: "PHONE",
    description: "Forfait professionnel Maroc Telecom 50Go + Appels illimités",
    amount: 380,
    supplier: "Maroc Telecom",
    paymentMethod: "transfer",
    deductible: false,
  },
  {
    id: "exp-4",
    date: "2026-10-15",
    category: "PHOTOGRAPHY",
    description: "Shooting photo pro + visite virtuelle 3D (Duplex California)",
    amount: 1500,
    supplier: "Studio Tanger Visuals",
    paymentMethod: "cash",
    deductible: false,
  },
  {
    id: "exp-5",
    date: "2026-10-01",
    category: "SOFTWARE",
    description: "Abonnement Canva Pro + Suite bureautique",
    amount: 220,
    supplier: "Canva / Microsoft",
    paymentMethod: "card",
    deductible: false,
  },
  {
    id: "exp-6",
    date: "2026-09-30",
    category: "CNSS_AMO",
    description: "Cotisation trimestrielle AMO / TNS (T3 2026)",
    amount: 600,
    supplier: "CNSS Maroc",
    paymentMethod: "transfer",
    deductible: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TASKS & PRIORITIES
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_TASKS: DemoTask[] = [
  {
    id: "t-1",
    title: "Relancer Samir Kadiri pour le solde de commission (10 000 MAD)",
    type: "COMMISSION",
    priority: "URGENT",
    dueDate: "2026-11-03", // Today!
    dueTime: "11:00",
    completed: false,
    relatedContact: "Samir Kadiri",
    description: "Solde convenu de 10k MAD en attente depuis le 20 octobre. Rappeler fermement mais courtoisement.",
  },
  {
    id: "t-2",
    title: "Visite Appartement Malabata avec Amine Tazi",
    type: "PROPERTY_VISIT",
    priority: "HIGH",
    dueDate: "2026-11-03", // Today!
    dueTime: "15:30",
    completed: false,
    relatedContact: "Amine Tazi",
    relatedProperty: "TNG-2026-042 (Malabata)",
    description: "Deuxième visite avec sa conjointe pour validation définitive des finitions.",
  },
  {
    id: "t-3",
    title: "Préparer le dossier pour l'étude notariale Me Filali",
    type: "MEETING",
    priority: "HIGH",
    dueDate: "2026-11-04",
    dueTime: "10:00",
    completed: false,
    relatedContact: "Me Hassan Filali",
    description: "Transmettre copie du TF 201449/06 et CIN des deux parties pour le compromis.",
  },
  {
    id: "t-4",
    title: "Renouvellement du Mandat exclusif Résidence Cap Malabata",
    type: "MANDATE",
    priority: "MEDIUM",
    dueDate: "2026-11-20",
    completed: false,
    relatedProperty: "TNG-2026-042",
    description: "Le mandat de Mme Berrada expire le 28 novembre. Proposer un avenant de 3 mois.",
  },
  {
    id: "t-5",
    title: "Déclaration fiscale T3 Auto-Entrepreneur (IR 1%)",
    type: "TAX",
    priority: "HIGH",
    dueDate: "2026-11-30",
    completed: false,
    description: "Déclarer le chiffre d'affaires encaissé au T3 sur le portail rnve.ma.",
  },
  {
    id: "t-6",
    title: "Rappeler Youssef Alami suite au contact panneau Tanja Balia",
    type: "FOLLOW_UP",
    priority: "MEDIUM",
    dueDate: "2026-11-03", // Today!
    dueTime: "17:00",
    completed: false,
    relatedContact: "Youssef Alami",
    description: "Qualifier son budget exact et vérifier si son pré-accord bancaire est validé.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL & TAX SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_FINANCIAL_SUMMARY = {
  // Cash & Commissions
  commissionsCollectedYTD: 218750, // MAD collected since Jan 1st
  commissionsExpected: 125250,    // Agreed in pipeline but not yet closed/paid
  commissionsPendingCollection: 46250, // Invoiced/partial awaiting final payment
  commissionsOverdue: 10000,      // Overdue payments
  totalExpensesYTD: 28450,        // Total operational expenses
  netProfitYTD: 190300,           // Collected - Expenses
  availableCash: 122500,          // Bank account estimated balance

  // Moroccan Tax (Auto-entrepreneur Services 1%)
  turnoverCeilingMAD: 500000,
  turnoverCollectedYTD: 218750,
  turnoverCeilingRemaining: 281250,
  turnoverCeilingPercent: 43.75, // 218750 / 500000
  estimatedIRRate: 0.01,         // 1%
  estimatedIRYTD: 2187.5,        // 1% of 218,750 MAD
  taxDeclaredYTD: 1525.0,
  taxPaidYTD: 1525.0,
  taxEstimatedDue: 662.5,

  // CNSS / AMO
  cnssStatus: "up_to_date",
  cnssContributionFrequency: "quarterly",
  cnssQuarterlyAmount: 600,
  cnssNextDueDate: "2026-12-31",
  cnssArrears: 0,

  // Activity
  activeContacts: 24,
  newLeadsThisMonth: 6,
  activeProperties: 12,
  scheduledVisits: 8,
  activeNegotiations: 2,
  transactionsCompletedYTD: 9,
  conversionRate: 37.5,
};

// Monthly Chart Data (12 months)
export const DEMO_MONTHLY_REVENUE = [
  { month: "Jan", collected: 15000, expected: 0, expenses: 2200 },
  { month: "Fév", collected: 22500, expected: 0, expenses: 2400 },
  { month: "Mar", collected: 18000, expected: 0, expenses: 2100 },
  { month: "Avr", collected: 32000, expected: 0, expenses: 3100 },
  { month: "Mai", collected: 25000, expected: 0, expenses: 2800 },
  { month: "Juin", collected: 19000, expected: 0, expenses: 2500 },
  { month: "Juil", collected: 28500, expected: 0, expenses: 3400 },
  { month: "Août", collected: 12000, expected: 0, expenses: 1900 },
  { month: "Sep", collected: 29000, expected: 0, expenses: 3200 },
  { month: "Oct", collected: 17750, expected: 36250, expenses: 4770 },
  { month: "Nov", collected: 0, expected: 52750, expenses: 870 },
  { month: "Déc", collected: 0, expected: 36250, expenses: 0 },
];
