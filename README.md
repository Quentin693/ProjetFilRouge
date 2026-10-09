# Voyage Luxe — Projet Fil Rouge EEMI

> Soutenance finale M2 · **Next.js /20** · **React Native /20** · **Docker /20**

Plateforme de réservation de voyages de luxe : site web **Next.js**, application mobile **React Native (Expo)**, API REST partagée, et **dockerisation** de l’app Next.js.

| Module | Dossier / fichier | Note |
|---|---|---|
| Next.js | `FilRougeNext/` | Front web, admin, API, Prisma + PostgreSQL |
| React Native | `FilRougeNative/` | App Expo (scan QR, géolocalisation, auth JWT) |
| Docker | `docker-compose.yml` + `FilRougeNext/Dockerfile` | Image production Next.js + Postgres |

---

## 1. Description produit

**Voyage Luxe** est une plateforme de voyages haut de gamme.

### Web (Next.js)
- Pages marketing (destinations, voyages)
- Authentification (inscription / connexion)
- Onboarding préférences
- Espace client (dashboard, réservations, settings)
- Parcours de réservation + voucher PDF
- Back-office admin (CRUD destinations / voyages / users / stats)

### Mobile (React Native / Expo)
- Connexion avec le même compte que le web (JWT)
- Catalogue voyages / destinations
- Mes réservations
- **Scan QR code** → check-in billet + voucher PDF
- **Géolocalisation** → destinations à proximité

---

## 2. Architecture

```
┌──────────────────────┐          ┌─────────────────────────────┐
│  FilRougeNative      │   JWT    │  FilRougeNext               │
│  Expo SDK 57         │ ───────► │  Next.js 16 (App Router)    │
│  • Scan QR (caméra)  │   REST   │  • Web + Admin              │
│  • Géolocalisation   │          │  • /api/mobile/*            │
│  • Auth SecureStore  │          │  • NextAuth (web)           │
└──────────────────────┘          │  • Prisma ORM               │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ PostgreSQL 17   │
                                        └─────────────────┘
```

### Stack technique

| Couche | Technologie |
|---|---|
| Web | Next.js 16, React 19, TypeScript, Tailwind, next-intl |
| Auth web | NextAuth v5 (Auth.js) — cookies |
| Auth mobile | JWT Bearer (`jose`) + Expo SecureStore |
| Données | Prisma 5 + PostgreSQL |
| Mobile | Expo Router, Zustand, expo-camera, expo-location |
| Docker | Multi-stage (Node 22 Alpine), user non-root, Compose |

### Arborescence

```
ProjetFilRouge/
├── README.md
├── .env.example              # variables Compose (IP, AUTH_*)
├── .gitignore
├── docker-compose.yml        # nextjs + postgres
├── FilRougeNext/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── docker-entrypoint.sh  # migrate + seed + start
│   ├── .env.example
│   ├── prisma/
│   └── src/
└── FilRougeNative/
    ├── app/                  # Expo Router
    ├── services/api.ts
    ├── stores/auth.ts
    └── constants/api.ts
```

---

## 3. Installation

### Prérequis
- Node.js **22+**
- npm
- Docker Desktop
- Expo Go (téléphone réel)
- (optionnel) compte Unsplash

### Cloner le repo

```bash
git clone https://github.com/Quentin693/ProjetFilRouge.git
cd ProjetFilRouge
```

### Option A — Docker (recommandé pour la démo)

```bash
# 1. Récupérer l'IP Wi‑Fi du Mac
ipconfig getifaddr en0

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env → remplacer 192.168.X.X par votre IP

# 3. Lancer
docker compose up --build
```

→ App : [http://localhost:3000](http://localhost:3000)  
→ Seed automatique (comptes + destinations + voyages) au démarrage.

### Option B — Développement local (sans Docker)

```bash
# --- Next.js ---
cd FilRougeNext
cp .env.example .env
# Renseigner DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_APP_URL
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev

# --- Mobile (autre terminal) ---
cd FilRougeNative
# Créer .env.local avec :
# EXPO_PUBLIC_API_URL=http://<IP-du-Mac>:3000
npm install
npm start
```

---

## 4. Variables d’environnement

### Racine (`.env` — utilisé par Docker Compose)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL réseau du Mac (`http://IP:3000`) — **obligatoire pour le QR** |
| `AUTH_URL` | URL NextAuth (même valeur que ci-dessus en démo) |
| `AUTH_SECRET` | Secret Auth.js (≥ 32 caractères) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Images Unsplash (optionnel) |
| `UNSPLASH_SECRET_KEY` | Secret Unsplash (optionnel) |

> `NEXT_PUBLIC_APP_URL` est passé en **build-arg** Docker (injecté dans le bundle client).  
> Si l’IP change : mettre à jour `.env` puis `docker compose up --build -d`.

### FilRougeNext (`.env`)

| Variable | Exemple |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5434/voyage_luxe` |
| `AUTH_SECRET` | chaîne secrète ≥ 32 chars |
| `AUTH_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | `http://192.168.X.X:3000` |
| Clés Unsplash | voir `.env.example` |

Fichier modèle : `FilRougeNext/.env.example`  
**Ne jamais committer** de vrais secrets (`.env` est dans `.gitignore`).

### FilRougeNative (`.env.local`)

| Variable | Exemple |
|---|---|
| `EXPO_PUBLIC_API_URL` | `http://192.168.X.X:3000` |

- iPhone physique → IP du Mac  
- Émulateur Android → `http://10.0.2.2:3000`  
- Simulateur iOS → `http://localhost:3000`

---

## 5. Commandes Next.js

```bash
cd FilRougeNext

npm run dev          # http://localhost:3000
npm run build        # build production
npm run start        # servir le build
npm run lint

npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:seed      # comptes + données de démo
npm run db:studio    # Prisma Studio
```

### Parcours web à démontrer
1. Landing / destinations / voyages  
2. Inscription → onboarding → dashboard  
3. Réserver un voyage → confirmation + QR voucher  
4. Admin (`admin@voyage-luxe.fr`) : CRUD + stats  

---

## 6. Commandes React Native

```bash
cd FilRougeNative

npm start            # Expo DevTools + QR Expo Go
npm run ios          # simulateur iOS
npm run android      # émulateur Android
```

### Tester sur téléphone réel (obligatoire)

> Cas général de la note React Native : **téléphone réel + caméra**.  
> Expo Go est suffisant pour QR + géolocalisation (modules compatibles).

| Prérequis | Détail |
|---|---|
| Téléphone physique | iPhone ou Android (pas seulement le simulateur pour la démo) |
| Même Wi‑Fi | Mac + téléphone sur le même réseau |
| Backend joignable | `EXPO_PUBLIC_API_URL=http://<IP-Mac>:3000` dans `.env.local` |
| Expo Go | Installé depuis l’App Store / Play Store |

```bash
# 1. Backend (Docker ou npm run dev) démarré
# 2. IP du Mac
ipconfig getifaddr en0

# 3. FilRougeNative/.env.local
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000

# 4. Lancer Expo
cd FilRougeNative
npm start

# 5. Sur le téléphone : ouvrir Expo Go → scanner le QR du terminal
```

#### Checklist téléphone réel

- [ ] **Scan QR** testé avec la **caméra** du téléphone (écran Check-in billet)
- [ ] **Géolocalisation** testée sur le téléphone (onglet À proximité + permission)
- [ ] Permissions caméra / localisation acceptées (et cas refus expliqué)
- [ ] Données réelles via l’API (login, réservation, check-in persisté)
- [ ] Expo Go utilisé pour QR + GPS (compatible)

### Routes API mobile utilisées

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/mobile/auth/login` | Connexion → JWT |
| GET | `/api/mobile/auth/me` | Profil |
| GET | `/api/mobile/voyages` | Liste voyages |
| GET | `/api/mobile/destinations/nearby?lat=&lng=` | Proximité GPS |
| GET/POST | `/api/mobile/reservations` | Réservations |
| POST | `/api/mobile/voucher/scan` | Check-in billet QR |

Header : `Authorization: Bearer <jwt>`

> **Expo Go suffit** pour ce projet : scan QR (`expo-camera`) + géolocalisation (`expo-location`).  
> Pas de module natif hors Expo Go → **pas de Development Build requise**.

---

## 7. Commandes Docker

### Lancement

```bash
# Depuis la racine ProjetFilRouge/
cp .env.example .env          # puis adapter l'IP
docker compose up --build     # foreground
docker compose up --build -d  # arrière-plan

docker compose logs -f nextjs
docker compose down
docker compose down -v        # + reset volume Postgres
```

| Service | Accès |
|---|---|
| Next.js | [http://localhost:3000](http://localhost:3000) ou `http://<IP>:3000` |
| Postgres (hôte) | `localhost:5434` → conteneur `:5432` |

### Contenu livré Docker

| Fichier | Rôle |
|---|---|
| `FilRougeNext/Dockerfile` | Multi-stage production (`standalone`) |
| `FilRougeNext/.dockerignore` | Exclut `node_modules`, `.next`, `.env`… |
| `FilRougeNext/docker-entrypoint.sh` | `migrate deploy` → `seed` → `node server.js` |
| `docker-compose.yml` | Services `nextjs` + `postgres` |

### Choix techniques Docker
- Image `node:22-alpine` + OpenSSL 3 (Prisma `linux-musl-openssl-3.0.x`)
- User **non-root** (`nextjs`)
- Layers cachés : `package*.json` copié avant le code source
- Secrets **non** copiés dans l’image (`.dockerignore` + env runtime)
- Port hôte Postgres **5434** (évite les conflits avec d’autres Postgres locaux)

### `docker run` (sans Compose)

```bash
cd FilRougeNext
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=http://192.168.X.X:3000 \
  -t voyage-luxe-next .

docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5434/voyage_luxe" \
  -e AUTH_SECRET="..." \
  -e AUTH_URL="http://192.168.X.X:3000" \
  -e NEXT_PUBLIC_APP_URL="http://192.168.X.X:3000" \
  voyage-luxe-next
```

---

## 8. Test scan QR

### Flux métier attendu (BILLET / check-in)

```
1. QR physique (écran web / impression)
2. Caméra du téléphone (app Expo)
3. Scan
4. Payload = reservationId + token
5. Validation app (format URL Voyage Luxe)
6. Backend POST /api/mobile/voucher/scan
7. Action métier = check-in billet (persisté en DB)
8. Feedback utilisateur dans l’app (+ PDF en option)
```

> Le QR **ne se contente pas d’ouvrir une URL** : l’app extrait l’ID, appelle le backend, enregistre un check-in, puis affiche le résultat.

### Scénario de démo (étape par étape)

| # | Action |
|---|---|
| 1 | Lancer Docker avec `NEXT_PUBLIC_APP_URL=http://<IP-Mac>:3000` |
| 2 | Web : login `test@voyage-luxe.fr` / `User@123456` |
| 3 | Réserver un voyage → **payer / confirmer** (statut `CONFIRMED`) |
| 4 | Afficher le QR code sur la confirmation |
| 5 | App mobile (même compte) → **Scanner QR** → autoriser caméra (+ GPS optionnel) |
| 6 | L’app valide → appelle l’API → **check-in réussi** à l’écran |
| 7 | Boutons : voir la réservation / télécharger le PDF / re-scanner |

### Points de contrôle
- Téléphone et Mac sur le **même Wi‑Fi**
- Le QR ne doit **pas** contenir `localhost`
- Réservation **CONFIRMÉE** (sinon le backend refuse le check-in)
- Double scan bloqué (`409` — déjà enregistré)
- PDF disponible en action secondaire, pas comme seul résultat

---

## 9. Test géolocalisation

> À tester sur **téléphone réel** (pas uniquement simulateur), avec la permission système.

| # | Action |
|---|---|
| 1 | App **Expo Go** sur téléphone réel (même Wi‑Fi que le Mac) |
| 2 | Se connecter avec un compte démo |
| 3 | Onglet **À proximité** |
| 4 | Autoriser la permission de localisation quand iOS/Android le demande |
| 5 | L’app envoie `lat` / `lng` à `GET /api/mobile/destinations/nearby` |
| 6 | Le backend calcule la distance (formule Haversine) |
| 7 | Affichage de la liste + distances en km |

États à montrer : **loading** / **empty** / **success** / **erreur** (permission refusée).

Astuce démo : refuser une fois la permission → montrer le message d’erreur → réautoriser dans Réglages → retester.

---

## 10. Comptes de démo

Créés automatiquement par le seed (`docker-entrypoint` ou `npm run db:seed`) :

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Admin | `admin@voyage-luxe.fr` | `Admin@123456` |
| 🧳 User | `test@voyage-luxe.fr` | `User@123456` |

---

## 11. Scan Docker

Après le build de l’image :

```bash
docker compose build nextjs

# Scan des vulnérabilités
docker scout cves projetfilrouge-nextjs
# Vue rapide
docker scout quickview projetfilrouge-nextjs
```

### Résultat réel (`docker scout quickview projetfilrouge-nextjs`)

| | Critical | High | Medium | Low |
|---|---|---|---|---|
| Image actuelle (`node:22-alpine`) | 1 | 14 | 13 | 2 |
| Base image seule | 0 | 11 | 9 | 1 |
| Base plus récente (`node:26-alpine`) | 0 | 5 | 7 | 1 |

- Score santé Scout : **D (44 %)** — politiques : user **non-root OK**, pas de CVE « high-profile »
- Échecs : 1 critique + 13 high **corrigeables**, base image un peu ancienne, licences copyleft, attestation supply-chain manquante
- Choix assumé : rester sur Node 22 (version du projet) ; la majorité des CVE vient de l’image de base, pas du code Voyage Luxe
- Atténuations déjà en place : user non-root, `.dockerignore` (pas de `.env` / `node_modules`), layers `package*.json` avant le code

Commandes à relancer en soutenance :

```bash
docker scout quickview projetfilrouge-nextjs
docker scout cves projetfilrouge-nextjs
```

---

## 12. Usage de l’IA

L’IA a été utilisée pour :
- générer et itérer le **Dockerfile** multi-stage et le `docker-compose.yml` ;
- diagnostiquer les erreurs (port Postgres, OpenSSL Prisma/Alpine, seed manquant, QR en `localhost`) ;
- structurer ce **README**.

Responsabilité humaine (non déléguable) :
1. **Vérifier** chaque suggestion  
2. **Tester** (`docker compose up --build`, login, QR, GPS)  
3. **Comprendre** image / conteneur / ports / env / layers  
4. **Documenter** les choix et limites  
5. **Refuser** ce qui est faux ou dangereux (ex. copier `.env` dans l’image)

Pendant le **live coding** : pas d’agent IA (docs officielles, IDE, terminal, DevTools uniquement).

---

## 13. Limites connues

| Limite | Détail |
|---|---|
| Paiement | Simulé — réservation mobile auto-confirmée |
| Unsplash | Sans clés API, certaines images manquent |
| IP Wi‑Fi | Change souvent → rebuild Docker si `NEXT_PUBLIC_APP_URL` change |
| Expo Go | Suffisant (QR + GPS) — pas de NFC dans ce projet |
| Réseau mobile | `localhost` inaccessible depuis le téléphone → IP locale obligatoire |
| Port Postgres | Mappé sur **5434** côté hôte (conflits fréquents sur 5432) |
| Build Next.js | Logs Prisma « placeholder » au build (routes dynamiques, non bloquant) |

---

## Lancement rapide (soutenance)

```bash
# Terminal 1 — Web + DB
cd ProjetFilRouge
cp .env.example .env   # IP à jour
docker compose up --build

# Terminal 2 — Mobile
cd FilRougeNative
# EXPO_PUBLIC_API_URL=http://<IP>:3000
npm start
```

| Cible | URL |
|---|---|
| Web | http://localhost:3000 |
| Web (téléphone / QR) | http://\<IP-Mac\>:3000 |
| Mobile | Expo Go sur téléphone réel |

---

## Licence

Projet scolaire EEMI — M2 · Soutenance finale 2026.
