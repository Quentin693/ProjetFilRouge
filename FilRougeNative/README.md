# Voyage Luxe — FilRougeNative

Application mobile **Expo SDK 57** (React Native) pour Voyage Luxe.

> Documentation complète (téléphone réel, QR, GPS, Docker, comptes) : **[README racine](../README.md)**.

## Lancement (téléphone réel — obligatoire pour la démo)

```bash
# Backend Next.js déjà lancé (Docker ou npm run dev)

cd FilRougeNative
# .env.local → EXPO_PUBLIC_API_URL=http://<IP-du-Mac>:3000
npm install
npm start
```

1. Installer **Expo Go** sur le téléphone  
2. Même Wi‑Fi que le Mac  
3. Scanner le QR Expo  
4. Tester **scan QR billet** (caméra) + **À proximité** (GPS)

### Compatible Expo Go (aucun NFC)
- Scan QR billet / check-in (`expo-camera`)  
- Géolocalisation (`expo-location`)  
- Auth JWT + SecureStore  

> Pas de NFC → **Expo Go suffit**, pas de Development Build.

## Stack

Expo Router · TypeScript · Zustand · expo-camera · expo-location · JWT Bearer

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| User | `test@voyage-luxe.fr` | `User@123456` |
| Admin | `admin@voyage-luxe.fr` | `Admin@123456` |
