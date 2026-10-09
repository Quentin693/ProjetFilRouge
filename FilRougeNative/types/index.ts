// Types partagés entre l'app mobile et le backend Next.js

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  image: string | null;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  highlights: string[];
  latitude: number | null;
  longitude: number | null;
}

export interface Departure {
  id: string;
  departureDate: string; // ISO string
  returnDate: string;
  availableSeats: number;
  isActive: boolean;
}

export interface Voyage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  category: string;
  destination: Destination;
  departures: Departure[];
}

export interface Passenger {
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string;
}

export interface Reservation {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  passengers: Passenger[];
  createdAt: string;
  voyage: Pick<Voyage, "id" | "title" | "imageUrl" | "duration">;
  departure: Pick<Departure, "id" | "departureDate" | "returnDate">;
  checkIns?: CheckIn[];
}

export interface CheckIn {
  id: string;
  checkedInAt: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  reservationId: string;
}

export interface NearbyDestination extends Destination {
  distanceKm: number;
}

// Auth
export interface AuthTokens {
  token: string;
  user: User;
}

// API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ── Admin ─────────────────────────────────────────────

export interface AdminOverview {
  totalUsers: number;
  totalReservations: number;
  totalVoyages: number;
  pendingReservations: number;
  totalRevenue: number;
  recentReservations: Array<{
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    user: { name: string | null; email: string | null };
    voyage: { title: string };
  }>;
}

export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalReservations: number;
  reservationsThisMonth: number;
  totalRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
  topVoyages: Array<{
    id: string;
    title: string;
    destination: string;
    reservations: number;
  }>;
  topDestinations: Array<{
    id: string;
    name: string;
    voyages: number;
  }>;
  byStatus: Array<{ status: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  recentActivity: Array<{
    id: string;
    totalPrice: number;
    createdAt: string;
    userName: string | null;
    voyageTitle: string;
  }>;
}

export interface AdminVoyage {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  category: string;
  duration: number;
  price: number;
  active: boolean;
  featured: boolean;
  destination: { name: string; country: string };
  reservationsCount: number;
  activeDepartures: number;
  totalSeats: number;
  bookedSeats: number;
  fillRate: number;
  nextDeparture: string | null;
}

export interface AdminDestination {
  id: string;
  name: string;
  country: string;
  continent: string;
  category: string;
  imageUrl: string;
  rating: number;
  featured: boolean;
  active: boolean;
  voyagesCount: number;
}

export interface AdminReservation {
  id: string;
  reference: string;
  status: string;
  adults: number;
  children: number;
  totalPrice: number;
  createdAt: string;
  user: { name: string | null; email: string | null };
  voyage: { title: string; imageUrl: string };
  departure: { departureDate: string; returnDate: string };
  paymentStatus: string | null;
}

export interface AdminReservationsPayload {
  total: number;
  counts: Record<string, number>;
  reservations: AdminReservation[];
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  image: string | null;
  createdAt: string;
  reservationsCount: number;
  totalSpent: number;
}
