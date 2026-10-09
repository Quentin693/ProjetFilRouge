// Palette luxury cohérente avec le site Next.js
export const Colors = {
  // Fond
  background: "#0D0D0D",
  surface: "#1A1A1A",
  surfaceElevated: "#222222",
  border: "rgba(255,255,255,0.08)",

  // Or luxury
  gold: "#C9A84C",
  goldLight: "#E4C478",
  goldDim: "rgba(201,168,76,0.3)",

  // Texte
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.35)",

  // États
  success: "#4ADE80",
  error: "#F87171",
  warning: "#FBBF24",
  info: "#60A5FA",

  // Statuts réservations
  statusPending: "#FBBF24",
  statusConfirmed: "#4ADE80",
  statusCancelled: "#F87171",
  statusCompleted: "#818CF8",
} as const;
