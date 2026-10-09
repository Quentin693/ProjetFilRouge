// URL de l'API Next.js backend
// En développement, utiliser l'IP locale de votre machine (pas localhost car le simulateur en a besoin)
// Remplacer par votre IP locale (ex: 192.168.1.X) ou l'URL de production
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_ROUTES = {
  // Auth
  login: `${API_BASE_URL}/api/mobile/auth/login`,
  me: `${API_BASE_URL}/api/mobile/auth/me`,

  // Voyages
  voyages: `${API_BASE_URL}/api/mobile/voyages`,
  voyage: (id: string) => `${API_BASE_URL}/api/mobile/voyages/${id}`,

  // Destinations
  destinations: `${API_BASE_URL}/api/mobile/destinations`,
  destinationsNearby: `${API_BASE_URL}/api/mobile/destinations/nearby`,
  destination: (id: string) =>
    `${API_BASE_URL}/api/mobile/destinations/${id}`,

  // Réservations
  reservations: `${API_BASE_URL}/api/mobile/reservations`,
  reservation: (id: string) =>
    `${API_BASE_URL}/api/mobile/reservations/${id}`,

  // Voucher QR (check-in billet)
  voucherScan: `${API_BASE_URL}/api/mobile/voucher/scan`,

  // Admin
  adminOverview: `${API_BASE_URL}/api/mobile/admin/overview`,
  adminStats: `${API_BASE_URL}/api/mobile/admin/stats`,
  adminVoyages: `${API_BASE_URL}/api/mobile/admin/voyages`,
  adminDestinations: `${API_BASE_URL}/api/mobile/admin/destinations`,
  adminReservations: `${API_BASE_URL}/api/mobile/admin/reservations`,
  adminUsers: `${API_BASE_URL}/api/mobile/admin/users`,
} as const;
