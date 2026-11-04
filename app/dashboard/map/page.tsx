import * as React from "react";
import { MarketExplorerClient } from "@/components/map/market-explorer-client";

export const metadata = {
  title: "Carte Interactive & Explorateur de Marché — RealtorOS Morocco",
  description: "Exploration cartographique interactive, inventaire immobilier géoréférencé et zonage stratégique à Tanger.",
};

export default function MarketExplorerPage() {
  return <MarketExplorerClient />;
}
