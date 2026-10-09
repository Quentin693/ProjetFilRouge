#!/bin/sh
set -e

echo "🗄️  Exécution des migrations Prisma..."
./node_modules/.bin/prisma migrate deploy

echo "🌱 Seed de la base (idempotent)..."
if [ -f ./prisma/seed.js ]; then
  node ./prisma/seed.js
else
  echo "⚠️  prisma/seed.js introuvable — seed ignoré"
fi

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
