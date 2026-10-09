# Voyage Luxe — Projet Fil Rouge EEMI

Plateforme de réservation de voyages de luxe : site web Next.js + application mobile React Native (Expo), avec API REST partagée et dockerisation de l’app Next.js.

| Module | Dossier | Rôle |
|---|---|---|
| **Next.js** | `FilRougeNext/` | Front web, back-office admin, API (`/api/*`), Prisma + PostgreSQL |
| **React Native** | `FilRougeNative/` | App mobile Expo (QR, GPS, auth JWT) |
| **Docker** | `docker-compose.yml` + `FilRougeNext/Dockerfile` | Conteneurisation production de Next.js + Postgres |

---

## 1. Description produit

**Voyage Luxe** permet de découvrir des destinations et offres de voyage, de réserver en ligne, de gérer son espace client, et d’accéder à un back-office admin.

Côté mobile, l’utilisateur peut :
- se connecter avec le même compte que le web ;
- parcourir voyages / destinations ;
- consulter ses réservations ;
- **scanner un QR code** (voucher PDF généré par le web) ;
- voir les **destinations à proximité** via la géolocalisation ;
- (bonus) effectuer un **check-in NFC** sur build de développement.

---

## 2. Architecture

```
┌─────────────────────┐         ┌──────────────────────────────┐
│  FilRougeNative     │  JWT    │  FilRougeNext                │
│  Expo / RN          │ ──────► │  Next.js 16 (App Router)     │
│  - QR scan          │  REST   │  - Pages web + Admin         │
│  - Géolocalisation  │         │  - Route Handlers /api/*     │
│  - Auth mobile      │         │  - NextAuth (web)            │
└─────────────────────┘         │  - Prisma ORM                │
                                └──────────────┬───────────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │  PostgreSQL 17  │
                                      └─────────────────┘
```

### Stack

| Couche | Techno |
|---|---|
| Web | Next.js 16, React 19, TypeScript, Tailwind, next-intl |
| Auth web | NextAuth v5 (Auth.js) |
| Auth mobile | JWT Bearer (`jose`) + SecureStore |
| ORM / DB | Prisma 5 + PostgreSQL |
| Mobile | Expo SDK 57, Expo Router, Zustand, expo-camera, expo-location |
| Conteneur | Docker multi-stage (Node Alpine), docker compose |

### Structure du monorepo

```
ProjetFilRouge/
├── README.md                 ← ce fichier
├── docker-compose.yml
├── FilRougeNext/             ← Next.js (web + API + admin)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── docker-entrypoint.sh  ← migrations Prisma au démarrage
│   ├── .env.example
│   ├── prisma/
│   └── src/
└── FilRougeNative/           ← App Expo / React Native
    ├── .env.local            ← EXPO_PUBLIC_API_URL
    ├── app/
    ├── services/
    └── stores/
```

---

## 3. Installation

### Prérequis

- Node.js **22+**
- npm
- PostgreSQL (local **ou** via Docker)
- Docker Desktop (pour la partie Docker)
- Expo Go sur téléphone réel (ou simulateur)
- Compte Unsplash (optionnel, images)

### Cloner & installer

```bash
git clone <url-du-repo>
cd ProjetFilRouge

# Backend / web
cd FilRougeNext
cp .env.example .env          # puis remplir les valeurs
npm install
npx prisma migrate deploy
npm run db:seed               # comptes de démo

# Mobile
cd ../FilRougeNative
npm install
# Éditer .env.local → EXPO_PUBLIC_API_URL=http://<IP-du-Mac>:3000
```

---

## 4. Variables d’environnement

### FilRougeNext (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (`postgresql://user:pass@host:port/db`) |
| `AUTH_SECRET` | Secret NextAuth (≥ 32 caractères) |
| `AUTH_URL` | URL publique de l’app (`http://localhost:3000`) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Clé publique Unsplash |
| `UNSPLASH_SECRET_KEY` | Clé secrète Unsplash |
| `NEXT_PUBLIC_APP_URL` | URL réseau (QR codes scannables depuis le téléphone) |

> Voir `FilRougeNext/.env.example`. **Ne jamais committer** un fichier `.env` avec de vrais secrets.

### FilRougeNative (`.env.local`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL du backend Next.js |

Exemples :
- iPhone physique → `http://192.168.x.x:3000` (IP du Mac)
- Émulateur Android → `http://10.0.2.2:3000`
- Simulateur iOS → `http://localhost:3000`

### Docker (racine, optionnel)

Les variables du service `nextjs` peuvent être surchargées via un `.env` à la racine du monorepo (`AUTH_SECRET`, `AUTH_URL`, clés Unsplash, `NEXT_PUBLIC_APP_URL`).

---

## 5. Commandes Next.js

```bash
cd FilRougeNext

npm run dev          # serveur de développement → http://localhost:3000
npm run build        # build production
npm run start        # démarrer le build production
npm run lint         # ESLint

npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:push      # prisma db push
npm run db:seed      # seed (comptes + données de démo)
npm run db:studio    # Prisma Studio
```

### Parcours web à tester

1. Pages marketing / destinations / voyages  
2. Inscription → onboarding → dashboard  
3. Réservation d’un voyage  
4. Espace réservations + voucher PDF / QR  
5. Back-office admin (CRUD destinations, voyages, users, stats)

---

## 6. Commandes React Native

```bash
cd FilRougeNative

npm start            # Expo DevTools
npm run ios          # simulateur iOS
npm run android      # émulateur Android
npm run web          # mode web Expo
```

Sur téléphone réel : ouvrir **Expo Go** et scanner le QR affiché dans le terminal.

> Le backend Next.js doit être lancé et joignable via `EXPO_PUBLIC_API_URL`.

---

## 7. Commandes Docker

Dockerise **l’application Next.js** (exigence commune) + PostgreSQL.

```bash
# Depuis la racine ProjetFilRouge/
docker compose up --build        # build + lancement (foreground)
docker compose up --build -d     # en arrière-plan
docker compose logs -f nextjs    # logs Next.js
docker compose down              # arrêt
docker compose down -v           # arrêt + suppression du volume Postgres
```

| Service | URL / port |
|---|---|
| Next.js | [http://localhost:3000](http://localhost:3000) |
| Postgres (hôte) | `localhost:5433` → conteneur `:5432` |

> Le port hôte **5433** évite le conflit avec un Postgres déjà présent sur `5432`.  
> À l’intérieur du réseau Docker, Next.js parle à `postgres:5432`.

### Image seule (sans compose)

```bash
cd FilRougeNext
docker build -t voyage-luxe-next .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e AUTH_URL="http://localhost:3000" \
  voyage-luxe-next
```

### Points Docker notables

- Build **multi-stage** (deps → builder → runner)
- Output Next.js `standalone`
- Utilisateur **non-root** (`nextjs`)
- Migrations Prisma au démarrage (`docker-entrypoint.sh`)
- `.dockerignore` exclut `node_modules`, `.next`, `.env`, etc.
- `binaryTargets` Prisma : `linux-musl-openssl-3.0.x` (Alpine)

---

## 8. Test scan QR code

### Flux métier

1. Se connecter sur le **web**, réserver un voyage  
2. Ouvrir la réservation → un **QR code** pointe vers `/api/reservations/[id]/pdf`  
3. Sur le **téléphone**, ouvrir l’app → **Scanner QR**  
4. Autoriser la **caméra**  
5. Scanner le QR affiché sur l’écran web (ou imprimé)  
6. L’app valide que l’URL correspond à un voucher Voyage Luxe  
7. Ouverture / téléchargement du **PDF voucher**

### Scénario de démo

| Étape | Action |
|---|---|
| 1 | Web : login `test@voyage-luxe.fr` |
| 2 | Réserver un voyage (ou ouvrir une réservation existante) |
| 3 | Afficher le QR du voucher |
| 4 | Mobile : onglet Accueil / Réservations → Scanner QR |
| 5 | Pointer la caméra vers le QR |
| 6 | Confirmer l’ouverture du PDF |

> Le QR n’ouvre pas une URL générique : l’app **valide** le chemin `/api/reservations/.../pdf` avant d’agir.

---

## 9. Test géolocalisation

1. Lancer l’app sur **téléphone réel**  
2. Onglet **À proximité** (`nearby`)  
3. Autoriser la permission de localisation  
4. L’app envoie `lat` / `lng` à `GET /api/mobile/destinations/nearby`  
5. Le backend calcule la distance (Haversine) et renvoie les destinations dans le rayon  

Vérifier les états : loading, empty (aucune destination), liste avec distances, erreur si permission refusée.

---

## 10. Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Admin | `admin@voyage-luxe.fr` | `Admin@123456` |
| 🧳 User | `test@voyage-luxe.fr` | `User@123456` |

Créés via `npm run db:seed` dans `FilRougeNext`.

---

## 11. Scan Docker Scout

Après le build de l’image :

```bash
# Build
docker compose build nextjs

# Scan
docker scout cves projetfilrouge-nextjs
# ou
docker scout quickview projetfilrouge-nextjs
```

À documenter pour la soutenance :
- résumé des vulnérabilités (critique / high / medium) ;
- ce qui a été corrigé ou accepté (ex. base Alpine à jour, user non-root, pas de `.env` dans l’image) ;
- limites restantes (dépendances transitives, image de base Node).

---

## 12. Usage de l’IA

L’IA a été utilisée pour :
- générer / itérer le **Dockerfile** multi-stage et le `docker-compose.yml` ;
- diagnostiquer des erreurs de build (OpenSSL Alpine / Prisma, port 5432, symlink CLI Prisma) ;
- structurer la documentation.

Responsabilité humaine :
- chaque commande a été **testée** localement (`docker compose up --build`) ;
- les secrets ne sont **pas** copiés dans l’image (`.dockerignore`) ;
- les choix techniques (port 5433, binaryTargets Prisma, entrypoint migrations) sont **compris et assumés**.

---

## 13. Limites connues

| Limite | Détail |
|---|---|
| Paiement | Simulé : réservation mobile confirmée automatiquement |
| Unsplash | Sans clés API, certaines images peuvent manquer |
| Expo Go | NFC **non disponible** dans Expo Go → Development Build requise |
| Réseau mobile | `localhost` ne marche pas sur téléphone physique → IP locale obligatoire |
| Port Postgres Docker | Mappé sur **5433** côté hôte (conflit fréquent avec un Postgres local) |
| Build Next.js | Les pages qui appellent Prisma pendant le build loggent une erreur DB placeholder (sans bloquer : routes dynamiques) |

### Bonus NFC (si présenté)

- Check-in via tag NFC + GPS optionnel  
- Route `POST /api/mobile/check-in`  
- Nécessite une **Development Build** (EAS) et un device NFC  

```bash
npm install -g eas-cli
eas build --profile development --platform ios     # ou android
```

---

## Lancement rapide recommandé (soutenance)

```bash
# Terminal 1 — stack Docker (web + DB)
cd ProjetFilRouge
docker compose up --build

# Terminal 2 — mobile (contre le Next.js sur :3000)
cd FilRougeNative
# Vérifier EXPO_PUBLIC_API_URL = IP du Mac
npm start
```

Puis ouvrir :
- Web → [http://localhost:3000](http://localhost:3000)  
- Mobile → Expo Go sur téléphone réel  

---

## Licence

Projet scolaire EEMI — M2 · Soutenance finale (Next.js / React Native / Docker).
