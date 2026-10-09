import * as SecureStore from "expo-secure-store";
import { API_ROUTES } from "@/constants/api";
import type {
  ApiResponse,
  AuthTokens,
  User,
  Voyage,
  Destination,
  Reservation,
  NearbyDestination,
  AdminOverview,
  AdminStats,
  AdminVoyage,
  AdminDestination,
  AdminReservationsPayload,
  AdminUser,
} from "@/types";

const TOKEN_KEY = "auth_token";

// --- Helpers ---

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      return { error: json.error ?? `Erreur ${res.status}` };
    }

    return { data: json };
  } catch (err) {
    return { error: "Impossible de joindre le serveur." };
  }
}

// --- Auth ---

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const res = await request<AuthTokens>(API_ROUTES.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
    }
    return res;
  },

  async me(): Promise<ApiResponse<User>> {
    return request<User>(API_ROUTES.me);
  },

  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getToken() {
    return getToken();
  },
};

// --- Voyages ---

export const voyageService = {
  async list(params?: { category?: string; search?: string }): Promise<ApiResponse<Voyage[]>> {
    const url = new URL(API_ROUTES.voyages);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.search) url.searchParams.set("search", params.search);
    return request<Voyage[]>(url.toString());
  },

  async get(id: string): Promise<ApiResponse<Voyage>> {
    return request<Voyage>(API_ROUTES.voyage(id));
  },
};

// --- Destinations ---

export const destinationService = {
  async list(): Promise<ApiResponse<Destination[]>> {
    return request<Destination[]>(API_ROUTES.destinations);
  },

  async get(id: string): Promise<ApiResponse<Destination>> {
    return request<Destination>(API_ROUTES.destination(id));
  },

  async nearby(
    latitude: number,
    longitude: number,
    radiusKm = 500
  ): Promise<ApiResponse<NearbyDestination[]>> {
    const url = new URL(API_ROUTES.destinationsNearby);
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lng", String(longitude));
    url.searchParams.set("radius", String(radiusKm));
    return request<NearbyDestination[]>(url.toString());
  },
};

// --- Réservations ---

export const reservationService = {
  async list(): Promise<ApiResponse<Reservation[]>> {
    return request<Reservation[]>(API_ROUTES.reservations);
  },

  async get(id: string): Promise<ApiResponse<Reservation>> {
    return request<Reservation>(API_ROUTES.reservation(id));
  },

  async create(body: {
    voyageId: string;
    departureId: string;
    passengers: Array<{
      firstName: string;
      lastName: string;
      birthDate: string;
      passportNumber: string;
    }>;
  }): Promise<ApiResponse<Reservation>> {
    return request<Reservation>(API_ROUTES.reservations, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// --- Admin ---

export const adminService = {
  async overview(): Promise<ApiResponse<AdminOverview>> {
    return request<AdminOverview>(API_ROUTES.adminOverview);
  },

  async stats(): Promise<ApiResponse<AdminStats>> {
    return request<AdminStats>(API_ROUTES.adminStats);
  },

  async voyages(): Promise<ApiResponse<AdminVoyage[]>> {
    return request<AdminVoyage[]>(API_ROUTES.adminVoyages);
  },

  async destinations(): Promise<ApiResponse<AdminDestination[]>> {
    return request<AdminDestination[]>(API_ROUTES.adminDestinations);
  },

  async reservations(params?: {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<AdminReservationsPayload>> {
    const url = new URL(API_ROUTES.adminReservations);
    if (params?.status && params.status !== "ALL") {
      url.searchParams.set("status", params.status);
    }
    if (params?.search) url.searchParams.set("q", params.search);
    return request<AdminReservationsPayload>(url.toString());
  },

  async users(search?: string): Promise<ApiResponse<AdminUser[]>> {
    const url = new URL(API_ROUTES.adminUsers);
    if (search) url.searchParams.set("q", search);
    return request<AdminUser[]>(url.toString());
  },
};
