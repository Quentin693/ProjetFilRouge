import { Colors } from "@/constants/colors";

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  REFUNDED: "Remboursée",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.statusPending,
  CONFIRMED: Colors.statusConfirmed,
  CANCELLED: Colors.statusCancelled,
  COMPLETED: Colors.statusCompleted,
  REFUNDED: "#C084FC",
};

export const VOYAGE_CATEGORY_LABELS: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};

export const DEST_CATEGORY_LABELS: Record<string, string> = {
  BEACH: "🏖️ Plage",
  MOUNTAIN: "⛰️ Montagne",
  CITY: "🏙️ Ville",
  SAFARI: "🦁 Safari",
  CRUISE: "🛳️ Croisière",
  ISLAND: "🏝️ Île",
  CULTURAL: "🏛️ Culture",
};

export const CATEGORY_LABELS: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};
