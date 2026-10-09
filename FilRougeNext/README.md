# Voyage Luxe — FilRougeNext

Application **Next.js 16** (web + API + admin) du projet Fil Rouge EEMI.

> La documentation complète (installation, Docker, QR, géolocalisation, comptes de démo) se trouve dans le **[README racine](../README.md)**.

## Lancement rapide

```bash
# Depuis FilRougeNext (dev local)
cp .env.example .env   # renseigner DATABASE_URL, AUTH_*, NEXT_PUBLIC_APP_URL
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev            # http://localhost:3000

# Ou depuis la racine du monorepo (Docker)
cd ..
cp .env.example .env   # IP Wi‑Fi du Mac
docker compose up --build
```

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@voyage-luxe.fr` | `Admin@123456` |
| User | `test@voyage-luxe.fr` | `User@123456` |

## Stack

Next.js 16 · React 19 · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind · next-intl
