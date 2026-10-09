#!/bin/sh
set -e

echo "🗄️  Exécution des migrations Prisma..."
./node_modules/.bin/prisma migrate deploy

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
