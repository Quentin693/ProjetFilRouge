# =====================
# Stage 1 : Dépendances
# =====================
FROM node:22-alpine AS deps
WORKDIR /app

# libc6-compat : compatibilité glibc | openssl : engine Prisma 3.0.x sur Alpine
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install complet (incluant devDeps pour le build)
RUN npm ci

# =====================
# Stage 2 : Build
# =====================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Compiler le seed TypeScript → JS (exécutable au runtime sans ts-node)
RUN npx tsc prisma/seed.ts \
      --outDir prisma \
      --esModuleInterop \
      --module commonjs \
      --moduleResolution node \
      --skipLibCheck \
      --target ES2020 \
      --resolveJsonModule

# Variables factices pour le build (les vraies sont injectées au runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV AUTH_SECRET=build-time-placeholder-secret-32chars
ENV AUTH_URL=http://localhost:3000

# NEXT_PUBLIC_* est injecté dans le bundle client au build — passer via --build-arg
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# =====================
# Stage 3 : Runner
# =====================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl

# Utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Fichiers statiques publics
COPY --from=builder /app/public ./public

# Build standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Client Prisma généré + CLI Prisma pour les migrations + seed
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
# Recréer le symlink (node_modules/.bin/prisma -> ../prisma/build/index.js)
RUN mkdir -p node_modules/.bin && \
    ln -sf ../prisma/build/index.js node_modules/.bin/prisma && \
    chmod +x node_modules/prisma/build/index.js

# Schéma, migrations et seed compilé
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Script d'entrée (migrations + démarrage)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
