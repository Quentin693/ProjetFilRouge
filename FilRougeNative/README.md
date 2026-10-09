# Voyage Luxe — Application React Native

Application mobile **Expo SDK 57** pour la plateforme de réservation de voyages de luxe. Elle consomme l'API REST du backend Next.js existant (`/FilRougeNext`).

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Expo SDK 57 + Expo Router |
| Langage | TypeScript strict |
| Navigation | Expo Router (file-based) |
| État global | Zustand |
| Authentification | JWT Bearer Token (jose) + SecureStore |
| Géolocalisation | expo-location |
| NFC | react-native-nfc-manager |
| Backend | Next.js API Routes (`/api/mobile/*`) |

## Structure du projet

```
FilRougeNative/
├── app/
│   ├── _layout.tsx              # Layout racine (chargement session)
│   ├── index.tsx                # Redirection auth / app
│   ├── (auth)/
│   │   └── login.tsx            # Écran de connexion
│   └── (app)/
│       ├── _layout.tsx          # Protection routes (auth requise)
│       ├── (tabs)/
│       │   ├── index.tsx        # Accueil (voyages populaires + actions)
│       │   ├── voyages.tsx      # Liste voyages (filtres, recherche)
│       │   ├── reservations.tsx # Mes réservations + statut NFC
│       │   ├── nearby.tsx       # Destinations à proximité (GPS)
│       │   └── profile.tsx      # Profil + déconnexion
│       ├── voyages/[id].tsx     # Détail voyage + réservation
│       ├── reservations/[id].tsx # Détail réservation + check-ins
│       └── checkin/scan.tsx     # Scanner NFC + check-in GPS
├── constants/
│   ├── api.ts                   # URLs API
│   └── colors.ts                # Palette luxury
├── services/api.ts              # Couche HTTP (auth, voyages, réservations, check-in)
├── stores/auth.ts               # Store Zustand (session utilisateur)
└── types/index.ts               # Types partagés avec le backend
```

## Backend — Routes API mobile (dans FilRougeNext)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/mobile/auth/login` | Connexion → JWT 30 jours |
| GET | `/api/mobile/auth/me` | Profil utilisateur connecté |
| GET | `/api/mobile/voyages` | Liste voyages (filtres: category, search) |
| GET | `/api/mobile/voyages/:id` | Détail voyage |
| GET | `/api/mobile/destinations` | Liste destinations |
| GET | `/api/mobile/destinations/nearby` | Destinations proches (params: lat, lng, radius) |
| GET | `/api/mobile/destinations/:id` | Détail destination |
| GET | `/api/mobile/reservations` | Mes réservations |
| POST | `/api/mobile/reservations` | Créer une réservation |
| GET | `/api/mobile/reservations/:id` | Détail réservation |
| POST | `/api/mobile/check-in` | Check-in NFC (nfcTagId, reservationId, lat?, lng?) |
| GET | `/api/mobile/check-in` | Historique des check-ins |

Toutes les routes (sauf `/login`) nécessitent le header :
```
Authorization: Bearer <jwt_token>
```

## Fonctionnalités obligatoires implémentées

### NFC (`react-native-nfc-manager`)
- Détection support NFC au démarrage
- Scan tag NDEF en temps réel
- Envoi automatique au backend avec l'ID du tag
- États visuels : idle → scanning → success / error
- Fonctionne uniquement sur **build de développement** (pas Expo Go)

### Géolocalisation (`expo-location`)
- Permission foreground demandée à l'usage
- Calcul de distance par formule Haversine côté serveur
- Géocodage inverse pour afficher l'adresse lisible lors du check-in
- Onglet "À proximité" avec liste des destinations dans un rayon donné

## Lancer le projet

### Prérequis
- Backend Next.js lancé sur `http://localhost:3000`
- Si appareil physique : remplacer `localhost` par l'IP locale du Mac dans `.env.local`

```bash
# Dans FilRougeNext (backend)
npm run dev

# Dans FilRougeNative (mobile)
npm start
```

### NFC — Build de développement requis
Le NFC ne fonctionne pas dans Expo Go. Pour tester le NFC :

```bash
# Installer EAS CLI
npm install -g eas-cli

# Créer un dev build iOS
eas build --profile development --platform ios

# Ou Android
eas build --profile development --platform android
```

## Schéma Prisma ajouté

```prisma
model CheckIn {
  id            String      @id @default(cuid())
  reservationId String
  nfcTagId      String      // ID du tag NFC scanné
  checkedInAt   DateTime    @default(now())
  latitude      Float?      // Position GPS
  longitude     Float?
  location      String?     // Adresse lisible
  reservation   Reservation @relation(...)
}

// Champs ajoutés à Destination :
latitude  Float?
longitude Float?
```

## Notes pour la soutenance

- Le NFC est **obligatoire** mais ne s'exécute que sur build natif (pas Expo Go) — prévoir un device physique avec NFC activé ou un émulateur Android avec NFC virtuel
- La géolocalisation fonctionne dans Expo Go et sur device physique
- L'authentification utilise un JWT séparé du cookie NextAuth (adapté au mobile)
- Le paiement est **simulé** : toute réservation créée depuis le mobile est automatiquement confirmée
