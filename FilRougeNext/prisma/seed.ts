import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@voyage-luxe.fr" },
    update: {},
    create: {
      email: "admin@voyage-luxe.fr",
      name: "Admin Voyage Luxe",
      password: adminPassword,
      role: "ADMIN",
      onboarded: true,
    },
  });
  console.log("✅ Admin créé:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("User@123456", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@voyage-luxe.fr" },
    update: {},
    create: {
      email: "test@voyage-luxe.fr",
      name: "Sophie Marchand",
      password: userPassword,
      role: "USER",
      onboarded: true,
      profile: {
        create: {
          firstName: "Sophie",
          lastName: "Marchand",
          phone: "+33 6 12 34 56 78",
          nationality: "Française",
          preferences: { budget: "luxury", themes: ["beach", "wellness", "gastronomy"] },
        },
      },
    },
  });
  console.log("✅ Utilisateur test créé:", user.email);

  // Create destinations
  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { id: "dest-maldives" },
      update: {},
      create: {
        id: "dest-maldives",
        name: "Maldives",
        country: "Maldives",
        continent: "Asie",
        description:
          "Un archipel de 1 200 îles coraliennes baignées par l'océan Indien, offrant des villas sur pilotis et des lagons turquoise d'une transparence absolue.",
        highlights: ["Villas sur pilotis", "Plongée sous-marine", "Spa de luxe", "Couchers de soleil"],
        imageUrl:
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1400&q=90&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&q=80&auto=format&fit=crop",
        ],
        category: "ISLAND",
        rating: 4.9,
        reviewCount: 1284,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-santorini" },
      update: {},
      create: {
        id: "dest-santorini",
        name: "Santorin",
        country: "Grèce",
        continent: "Europe",
        description:
          "Perchée sur des falaises volcaniques, Santorin offre des panoramas incomparables sur la caldeira, des hôtels troglodytes et des couchers de soleil légendaires.",
        highlights: ["Vue sur la caldeira", "Villages blancs", "Gastronomie grecque", "Vignobles"],
        imageUrl:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400&q=90&auto=format&fit=crop",
        gallery: [],
        category: "ISLAND",
        rating: 4.8,
        reviewCount: 2156,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-bali" },
      update: {},
      create: {
        id: "dest-bali",
        name: "Bali",
        country: "Indonésie",
        continent: "Asie",
        description:
          "Entre rizières en terrasses, temples ancestraux et plages paradisiaques, Bali est une destination spirituelle et esthétique hors du commun.",
        highlights: ["Rizières de Tegallalang", "Temples Hindous", "Surf à Seminyak", "Retraites Yoga"],
        imageUrl:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=90&auto=format&fit=crop",
        gallery: [],
        category: "CULTURAL",
        rating: 4.7,
        reviewCount: 3420,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-dubai" },
      update: {},
      create: {
        id: "dest-dubai",
        name: "Dubaï",
        country: "Émirats Arabes Unis",
        continent: "Moyen-Orient",
        description:
          "La ville du record, entre gratte-ciels vertigineux, désert doré et luxe absolu. Dubaï réinvente le voyage de prestige à chaque instant.",
        highlights: ["Burj Khalifa", "Désert en 4x4", "Shopping de luxe", "Cuisine du monde"],
        imageUrl:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=90&auto=format&fit=crop",
        gallery: [],
        category: "CITY",
        rating: 4.8,
        reviewCount: 1876,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-ibiza" },
      update: {},
      create: {
        id: "dest-ibiza",
        name: "Ibiza",
        country: "Espagne",
        continent: "Europe",
        description:
          "L'île blanche de la Méditerranée, capitale mondiale de la fête et du luxe. Clubs légendaires, plages sauvages, couchers de soleil à Café del Mar et villas privées avec piscine à débordement — Ibiza ne dort jamais.",
        highlights: ["Clubs légendaires (Pacha, Ushuaïa, Amnesia)", "Plages de Ses Salines & Cala Comte", "Couchers de soleil à Café del Mar", "Vieille ville Dalt Vila classée UNESCO", "Restaurants étoilés", "Beach clubs VIP"],
        imageUrl: "/image.png",
        gallery: [
          "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80&auto=format&fit=crop",
        ],
        category: "BEACH",
        rating: 4.7,
        reviewCount: 4210,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-kyoto" },
      update: {},
      create: {
        id: "dest-kyoto",
        name: "Kyoto",
        country: "Japon",
        continent: "Asie",
        description:
          "Ancienne capitale impériale, Kyoto conserve l'essence du Japon traditionnel : temples millénaires, geishas et jardins zen d'une quiétude absolue.",
        highlights: ["Temples Zen", "Forêt de bambous", "Cérémonie du thé", "Geishas de Gion"],
        imageUrl:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=90&auto=format&fit=crop",
        gallery: [],
        category: "CULTURAL",
        rating: 4.9,
        reviewCount: 987,
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-amalfi" },
      update: {},
      create: {
        id: "dest-amalfi",
        name: "Côte Amalfitaine",
        country: "Italie",
        continent: "Europe",
        description:
          "Villages accrochés aux falaises, citronniers en fleurs et mer azurée — la Côte Amalfitaine incarne l'art de vivre à l'italienne dans sa quintessence.",
        highlights: ["Positano", "Croisière privée", "Gastronomie italienne", "Villas historiques"],
        imageUrl:
          "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1400&q=90&auto=format&fit=crop",
        gallery: [],
        category: "BEACH",
        rating: 4.7,
        reviewCount: 1543,
        featured: true,
      },
    }),
  ]);
  console.log("✅ Destinations créées:", destinations.length);

  // Create Voyages
  const now = new Date();
  const voyage1 = await prisma.voyage.upsert({
    where: { slug: "maldives-ultra-luxe-7j" },
    update: {},
    create: {
      title: "Maldives Ultra Luxe — 7 Jours",
      slug: "maldives-ultra-luxe-7j",
      description:
        "Une semaine de pur bonheur dans les Maldives. Villa sur pilotis privée avec piscine à débordement, plongée avec les raies manta, spa traditionnel et gastronomie d'exception.",
      destinationId: "dest-maldives",
      category: "LUXURY",
      duration: 7,
      maxGuests: 4,
      basePrice: 4200,
      imageUrl:
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Malé (Business Class)",
        "7 nuits en villa sur pilotis 5★",
        "Pension complète gastronomique",
        "Transferts en hydravion privé",
        "2 plongées guidées",
        "Soin spa quotidien 60 min",
        "Excursion île déserte privée",
      ],
      excludes: ["Boissons alcoolisées", "Activités non mentionnées"],
      itinerary: [
        { day: 1, title: "Arrivée & Installation", description: "Accueil VIP à l'aéroport, transfert en hydravion, installation dans votre villa." },
        { day: 2, title: "Découverte du lagon", description: "Snorkeling privé, déjeuner flottant sur plateforme." },
        { day: 3, title: "Plongée avec les raies manta", description: "Excursion plongée au lever du soleil avec guide certifié." },
        { day: 4, title: "Journée Spa & Sérénité", description: "Soins ayurvédiques, yoga face à l'océan, déjeuner sur la plage." },
        { day: 5, title: "Île déserte privée", description: "Escapade exclusive sur une île non habitée, pique-nique de luxe." },
        { day: 6, title: "Gastronomie & Coucher de soleil", description: "Cours de cuisine maldivienne, dîner sur l'eau aux chandelles." },
        { day: 7, title: "Dernières heures & Départ", description: "Brunch de clôture, transfert et vol retour." },
      ],
      active: true,
      featured: true,
    },
  });

  const voyage2 = await prisma.voyage.upsert({
    where: { slug: "santorini-romantique-5j" },
    update: {},
    create: {
      title: "Santorin Romantique — 5 Jours",
      slug: "santorini-romantique-5j",
      description:
        "5 jours de romantisme absolu sur l'île volcanique la plus belle de Méditerranée. Hôtel troglodyte avec vue caldeira, croisière coucher de soleil et dégustation de vins locaux.",
      destinationId: "dest-santorini",
      category: "HONEYMOON",
      duration: 5,
      maxGuests: 2,
      basePrice: 2800,
      imageUrl:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Athènes + ferry Santorin",
        "5 nuits en suite troglodyte avec vue caldeira",
        "Petit-déjeuner gourmet inclus",
        "Croisière coucher de soleil",
        "Dégustation dans 2 domaines viticoles",
        "Dîner romantique aux chandelles à Oia",
      ],
      excludes: ["Vol intérieur optionnel", "Autres repas"],
      itinerary: [
        { day: 1, title: "Arrivée à Fira", description: "Accueil et installation dans votre suite, apéritif bienvenue." },
        { day: 2, title: "Oia & Coucher de soleil légendaire", description: "Exploration du village blanc, croisière au coucher du soleil." },
        { day: 3, title: "Villages et vignobles", description: "Visite de Pyrgos, dégustation Vinsanto dans un domaine perché." },
        { day: 4, title: "Plage de Perissa & Akrotiri", description: "Site archéologique, plage de sable volcanique noir." },
        { day: 5, title: "Dernières heures", description: "Brunch avec vue, départ pour l'aéroport." },
      ],
      active: true,
      featured: true,
    },
  });
  const voyage3 = await prisma.voyage.upsert({
    where: { slug: "ibiza-party-experience-5j" },
    update: {},
    create: {
      title: "Ibiza Party Experience — 5 Jours",
      slug: "ibiza-party-experience-5j",
      description:
        "5 jours d'exception sur l'île blanche : villa de luxe avec DJ set privé, entrées VIP dans les meilleurs clubs (Pacha, Ushuaïa, Amnesia), beach clubs exclusifs et journées plage à Ses Salines. Le voyage ultime pour ceux qui veulent vivre Ibiza comme une star.",
      destinationId: "dest-ibiza",
      category: "LUXURY",
      duration: 5,
      maxGuests: 12,
      basePrice: 1800,
      imageUrl: "/image.png",
      gallery: [
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80&auto=format&fit=crop",
      ],
      includes: [
        "Vol aller-retour Paris-Ibiza",
        "5 nuits en villa luxe avec piscine privée",
        "DJ set privatif le soir d'arrivée",
        "Entrées VIP + table Pacha (nuit 2)",
        "Entrées VIP + table Ushuaïa open-air (nuit 3)",
        "Entrées VIP Amnesia (nuit 4)",
        "Journée beach club VIP à Destino Pacha",
        "Excursion bateau privatisé autour de l'île",
        "Chauffeur privé inclus toutes les nuits",
        "Brunchs gastronomiques chaque matin",
      ],
      excludes: ["Consommations en club", "Autres repas", "Dépenses personnelles"],
      itinerary: [
        { day: 1, title: "Arrivée & DJ Set Privé", description: "Accueil à l'aéroport, transfert en limousine, installation en villa. DJ set privatif au bord de la piscine avec champagne à volonté." },
        { day: 2, title: "Plage & Pacha", description: "Matinée libre sur la plage de Ses Salines, déjeuner au beach club. Le soir : table VIP au mythique Pacha avec les meilleurs DJs de la planète." },
        { day: 3, title: "Bateau privatisé & Ushuaïa", description: "Journée sur un yacht de 12m autour des criques de l'île. Coucher de soleil à Café del Mar, puis Ushuaïa Open Air Theater." },
        { day: 4, title: "Cala Comte & Amnesia", description: "Beach club VIP à Destino Pacha pour le déjeuner. L'une des plus belles criques de l'île l'après-midi. Nuit de légende à Amnesia." },
        { day: 5, title: "Brunch & Départ", description: "Brunch de clôture en villa, séance photo dans Dalt Vila (vieille ville UNESCO), transfert aéroport avec les meilleurs souvenirs de votre vie." },
      ],
      active: true,
      featured: true,
    },
  });

  const voyage4 = await prisma.voyage.upsert({
    where: { slug: "bali-spirituel-10j" },
    update: {},
    create: {
      title: "Bali Spirituel — 10 Jours",
      slug: "bali-spirituel-10j",
      description:
        "Une immersion de 10 jours dans l'âme de Bali : temples privés, yoga au lever du soleil, rizières de Tegallalang, spa traditionnel et cuisine balinaise. Le voyage idéal pour se reconnecter.",
      destinationId: "dest-bali",
      category: "SOLO",
      duration: 10,
      maxGuests: 6,
      basePrice: 1900,
      imageUrl:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Denpasar",
        "10 nuits en villa privée Ubud & Seminyak",
        "Petit-déjeuner quotidien",
        "Yoga quotidien face aux rizières",
        "Accès temples privés avec guide",
        "Cours de cuisine balinaise",
        "Soin spa traditionnel (2 séances)",
      ],
      excludes: ["Déjeuners et dîners", "Activités optionnelles"],
      itinerary: [
        { day: 1, title: "Arrivée à Ubud", description: "Accueil, installation villa jungle, cérémonie de bienvenue." },
        { day: 2, title: "Temples & Rizières", description: "Tirta Empul, Tegallalang, atelier batik." },
        { day: 3, title: "Yoga & Méditation", description: "Session sunrise, forêt de singes, spa ayurvédique." },
        { day: 4, title: "Cuisine balinaise", description: "Marché local et cours de cuisine avec un chef." },
        { day: 5, title: "Mont Batur", description: "Trekking lever du soleil (optionnel) et sources chaudes." },
        { day: 6, title: "Vers Seminyak", description: "Transfert côte ouest, plage et sunset." },
        { day: 7, title: "Surf & Bien-être", description: "Cours de surf débutant, massage balinais." },
        { day: 8, title: "Uluwatu", description: "Temple sur falaise, danse Kecak au coucher du soleil." },
        { day: 9, title: "Journée libre", description: "Temps libre ou excursion Nusa Penida." },
        { day: 10, title: "Départ", description: "Brunch et transfert aéroport." },
      ],
      active: true,
      featured: true,
    },
  });

  const voyage5 = await prisma.voyage.upsert({
    where: { slug: "dubai-prestige-6j" },
    update: {},
    create: {
      title: "Dubaï Prestige — 6 Jours",
      slug: "dubai-prestige-6j",
      description:
        "6 jours de luxe absolu à Dubaï : palace 5★, safari dans le désert, yacht sur la Marina, shopping exclusive et dîner au sommet du Burj Khalifa.",
      destinationId: "dest-dubai",
      category: "LUXURY",
      duration: 6,
      maxGuests: 4,
      basePrice: 3100,
      imageUrl:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Dubaï (Business)",
        "6 nuits palace 5★ Downtown",
        "Petit-déjeuner gourmet",
        "Safari désert en 4x4 + dîner bédouin",
        "Yacht privé 3h Marina",
        "Tickets Burj Khalifa (At the Top)",
        "Chauffeur privé",
      ],
      excludes: ["Shopping personnel", "Autres repas"],
      itinerary: [
        { day: 1, title: "Arrivée VIP", description: "Accueil aéroport, check-in palace, vue Burj Khalifa." },
        { day: 2, title: "Skyline & Souks", description: "Dubai Mall, fontaines, vieux Dubaï et souks." },
        { day: 3, title: "Désert", description: "Safari dune bashing, falconnerie, dîner sous les étoiles." },
        { day: 4, title: "Yacht & Plage", description: "Croisière Marina, après-midi Palm Jumeirah." },
        { day: 5, title: "Burj Khalifa", description: "Ascension At the Top, dîner gastronomique." },
        { day: 6, title: "Départ", description: "Brunch et transfert aéroport." },
      ],
      active: true,
      featured: true,
    },
  });

  const voyage6 = await prisma.voyage.upsert({
    where: { slug: "kyoto-tradition-8j" },
    update: {},
    create: {
      title: "Kyoto Tradition — 8 Jours",
      slug: "kyoto-tradition-8j",
      description:
        "8 jours dans le Japon éternel : ryokan traditionnel, cérémonie du thé, forêt de bambous d'Arashiyama, temples zen et rencontre avec une geisha à Gion.",
      destinationId: "dest-kyoto",
      category: "PREMIUM",
      duration: 8,
      maxGuests: 4,
      basePrice: 3500,
      imageUrl:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Osaka (Premium Economy)",
        "8 nuits ryokan & hôtel design",
        "Petit-déjeuner kaiseki",
        "Cérémonie du thé privée",
        "Guide francophone",
        "Pass transports locaux",
        "Dîner avec geisha (expérience privée)",
      ],
      excludes: ["Déjeuners", "Excursions hors programme"],
      itinerary: [
        { day: 1, title: "Arrivée à Kyoto", description: "Train depuis Osaka, installation ryokan." },
        { day: 2, title: "Fushimi Inari", description: "Milliers de torii et sanctuaire du renard." },
        { day: 3, title: "Arashiyama", description: "Forêt de bambous, temple Tenryu-ji." },
        { day: 4, title: "Zen & Thé", description: "Méditation temple, cérémonie du thé." },
        { day: 5, title: "Gion", description: "Quartier des geishas, dîner privé." },
        { day: 6, title: "Philosophers Path", description: "Promenade des philosophes, Kiyomizu-dera." },
        { day: 7, title: "Nara", description: "Excursion cerfs sacrés et Grand Bouddha." },
        { day: 8, title: "Départ", description: "Dernière matinée et transfert." },
      ],
      active: true,
      featured: false,
    },
  });

  const voyage7 = await prisma.voyage.upsert({
    where: { slug: "amalfi-dolce-vita-6j" },
    update: {},
    create: {
      title: "Amalfi Dolce Vita — 6 Jours",
      slug: "amalfi-dolce-vita-6j",
      description:
        "6 jours de dolce vita sur la Côte Amalfitaine : Positano, Capri en bateau privé, limoncello, villas historiques et gastronomie campanienne.",
      destinationId: "dest-amalfi",
      category: "HONEYMOON",
      duration: 6,
      maxGuests: 4,
      basePrice: 2400,
      imageUrl:
        "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Naples",
        "6 nuits hôtel vue mer Positano",
        "Petit-déjeuner buffet",
        "Croisière privée Capri",
        "Dégustation limoncello",
        "Dîner romantique terrasse",
        "Transferts privés",
      ],
      excludes: ["Déjeuners", "Pourboires"],
      itinerary: [
        { day: 1, title: "Arrivée à Positano", description: "Transfert depuis Naples, aperitivo face à la mer." },
        { day: 2, title: "Positano à pied", description: "Ruelle colorées, plage et shopping artisanal." },
        { day: 3, title: "Capri privée", description: "Bateau privé, Grotte Bleue, déjeuner Anacapri." },
        { day: 4, title: "Ravello & Amalfi", description: "Villas historiques, cathédrale, limoncello." },
        { day: 5, title: "Journée libre", description: "Plage ou sentier des Dieux (optionnel)." },
        { day: 6, title: "Départ", description: "Brunch et transfert Naples." },
      ],
      active: true,
      featured: true,
    },
  });

  const voyage8 = await prisma.voyage.upsert({
    where: { slug: "bali-aventure-famille-8j" },
    update: {},
    create: {
      title: "Bali Aventure Famille — 8 Jours",
      slug: "bali-aventure-famille-8j",
      description:
        "Un séjour familial actif à Bali : rafting, snorkel, rizières à vélo, temples et plages. Pensé pour parents et enfants.",
      destinationId: "dest-bali",
      category: "FAMILY",
      duration: 8,
      maxGuests: 8,
      basePrice: 1600,
      imageUrl:
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1400&q=90&auto=format&fit=crop",
      gallery: [],
      includes: [
        "Vol aller-retour Paris-Denpasar",
        "8 nuits resort familial",
        "Petit-déjeuner",
        "Rafting Ayung (enfants 8+)",
        "Journée snorkel",
        "Location vélos rizières",
        "Club enfants 2 demi-journées",
      ],
      excludes: ["Déjeuners/dîners", "Garderie hors programme"],
      itinerary: [
        { day: 1, title: "Arrivée", description: "Installation resort, piscine." },
        { day: 2, title: "Rizières à vélo", description: "Balade douce autour d'Ubud." },
        { day: 3, title: "Rafting", description: "Descente de la rivière Ayung en famille." },
        { day: 4, title: "Temples", description: "Visite adaptée aux enfants, goûter local." },
        { day: 5, title: "Plage", description: "Transfert sud, snorkel et club enfants." },
        { day: 6, title: "Liberté", description: "Journée libre à la plage." },
        { day: 7, title: "Uluwatu light", description: "Point de vue falaise, danse Kecak." },
        { day: 8, title: "Départ", description: "Transfert aéroport." },
      ],
      active: true,
      featured: false,
    },
  });

  console.log("✅ Voyages créés");

  // Departures for Ibiza
  const ibizaDep1 = new Date(now);
  ibizaDep1.setMonth(ibizaDep1.getMonth() + 1);
  ibizaDep1.setDate(15);
  const ibizaDep1Return = new Date(ibizaDep1);
  ibizaDep1Return.setDate(ibizaDep1Return.getDate() + 5);

  const ibizaDep2 = new Date(now);
  ibizaDep2.setMonth(ibizaDep2.getMonth() + 2);
  ibizaDep2.setDate(5);
  const ibizaDep2Return = new Date(ibizaDep2);
  ibizaDep2Return.setDate(ibizaDep2Return.getDate() + 5);

  const ibizaDep3 = new Date(now);
  ibizaDep3.setMonth(ibizaDep3.getMonth() + 3);
  const ibizaDep3Return = new Date(ibizaDep3);
  ibizaDep3Return.setDate(ibizaDep3Return.getDate() + 5);

  await prisma.departure.createMany({
    data: [
      {
        voyageId: voyage3.id,
        departDate: ibizaDep1,
        returnDate: ibizaDep1Return,
        seatsTotal: 12,
        seatsBooked: 6,
        priceAdult: 1800,
        priceChild: null,
        active: true,
      },
      {
        voyageId: voyage3.id,
        departDate: ibizaDep2,
        returnDate: ibizaDep2Return,
        seatsTotal: 12,
        seatsBooked: 3,
        priceAdult: 1900,
        priceChild: null,
        active: true,
      },
      {
        voyageId: voyage3.id,
        departDate: ibizaDep3,
        returnDate: ibizaDep3Return,
        seatsTotal: 12,
        seatsBooked: 0,
        priceAdult: 2100,
        priceChild: null,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  // Reviews Ibiza
  await prisma.review.createMany({
    data: [
      {
        voyageId: voyage3.id,
        authorName: "Maxime R.",
        rating: 5,
        title: "La nuit de ma vie à Ushuaïa !",
        content: "Franchement le meilleur voyage de ma vie. La villa était dingue, le DJ privé le soir d'arrivée on a cru rêver. Pacha et Ushuaïa avec table VIP c'est une autre dimension. Je recommande à 1000%.",
        verified: true,
      },
      {
        voyageId: voyage3.id,
        authorName: "Laura & Thomas",
        rating: 5,
        title: "Ibiza comme des rockstars",
        content: "Le bateau privatisé le jour 3 était hallucinant, les criques sont magnifiques. Le soir Amnesia on a dansé jusqu'au lever du soleil. Organisation parfaite du début à la fin.",
        verified: true,
      },
      {
        voyageId: voyage3.id,
        authorName: "Jordan K.",
        rating: 4,
        title: "Expérience VIP incroyable",
        content: "Tout était au top : villa, clubs, plages. Le chauffeur privé la nuit c'est vraiment pratique. Je mets 4 étoiles juste parce que les consommations en club s'ajoutent, mais c'est clairement indiqué.",
        verified: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create Departures (Maldives & Santorin)
  const dep1 = new Date(now);
  dep1.setMonth(dep1.getMonth() + 2);
  const dep1Return = new Date(dep1);
  dep1Return.setDate(dep1Return.getDate() + 7);

  const dep2 = new Date(now);
  dep2.setMonth(dep2.getMonth() + 3);
  const dep2Return = new Date(dep2);
  dep2Return.setDate(dep2Return.getDate() + 7);

  await prisma.departure.createMany({
    data: [
      {
        voyageId: voyage1.id,
        departDate: dep1,
        returnDate: dep1Return,
        seatsTotal: 8,
        seatsBooked: 4,
        priceAdult: 4200,
        priceChild: 2800,
        active: true,
      },
      {
        voyageId: voyage1.id,
        departDate: dep2,
        returnDate: dep2Return,
        seatsTotal: 8,
        seatsBooked: 2,
        priceAdult: 4500,
        priceChild: 3000,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  const depS1 = new Date(now);
  depS1.setMonth(depS1.getMonth() + 2);
  depS1.setDate(15);
  const depS1Return = new Date(depS1);
  depS1Return.setDate(depS1Return.getDate() + 5);

  await prisma.departure.create({
    data: {
      voyageId: voyage2.id,
      departDate: depS1,
      returnDate: depS1Return,
      seatsTotal: 4,
      seatsBooked: 0,
      priceAdult: 2800,
      priceChild: 2000,
      active: true,
    },
  });

  // Départs pour les nouveaux voyages
  const extraVoyages = [
    { voyage: voyage4, days: 10, price: 1900, seats: 6 },
    { voyage: voyage5, days: 6, price: 3100, seats: 4 },
    { voyage: voyage6, days: 8, price: 3500, seats: 4 },
    { voyage: voyage7, days: 6, price: 2400, seats: 4 },
    { voyage: voyage8, days: 8, price: 1600, seats: 8 },
  ];

  for (let i = 0; i < extraVoyages.length; i++) {
    const { voyage, days, price, seats } = extraVoyages[i];
    const d1 = new Date(now);
    d1.setMonth(d1.getMonth() + 2 + i);
    d1.setDate(10 + i * 3);
    const r1 = new Date(d1);
    r1.setDate(r1.getDate() + days);

    const d2 = new Date(now);
    d2.setMonth(d2.getMonth() + 4 + i);
    d2.setDate(20);
    const r2 = new Date(d2);
    r2.setDate(r2.getDate() + days);

    await prisma.departure.createMany({
      data: [
        {
          voyageId: voyage.id,
          departDate: d1,
          returnDate: r1,
          seatsTotal: seats,
          seatsBooked: 0,
          priceAdult: price,
          priceChild: Math.round(price * 0.7),
          active: true,
        },
        {
          voyageId: voyage.id,
          departDate: d2,
          returnDate: r2,
          seatsTotal: seats,
          seatsBooked: 0,
          priceAdult: Math.round(price * 1.08),
          priceChild: Math.round(price * 0.75),
          active: true,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("✅ Départs créés");

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        voyageId: voyage1.id,
        authorName: "Sophie M.",
        rating: 5,
        title: "Une expérience inoubliable",
        content: "Les Maldives ont dépassé toutes nos attentes. La villa était magnifique, le service impeccable. On reviendra !",
        verified: true,
      },
      {
        voyageId: voyage1.id,
        authorName: "Pierre D.",
        rating: 5,
        title: "Paradis sur terre",
        content: "La plongée avec les raies manta était un moment magique. Tout était parfaitement organisé.",
        verified: true,
      },
      {
        voyageId: voyage2.id,
        authorName: "Amélie F.",
        rating: 5,
        title: "Lune de miel parfaite",
        content: "Santorin est tout simplement époustouflant. Le dîner aux chandelles à Oia était une expérience hors du commun.",
        verified: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Avis créés");

  console.log("\n🎉 Seeding terminé avec succès !");
  console.log("\n📋 Comptes de test :");
  console.log("   Admin → admin@voyage-luxe.fr / Admin@123456");
  console.log("   User  → test@voyage-luxe.fr / User@123456");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
