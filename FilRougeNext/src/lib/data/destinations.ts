export const LUXURY_DESTINATIONS = [
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    continent: "Asie",
    tagline: "L'Océan à l'état pur",
    description:
      "Un archipel de 1 200 îles coraliennes baignées par l'océan Indien, offrant des villas sur pilotis et des lagons turquoise d'une transparence absolue.",
    imageUrl:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1400&q=90&auto=format&fit=crop",
    category: "ISLAND",
    rating: 4.9,
    reviewCount: 1284,
    highlights: ["Villas sur pilotis", "Plongée sous-marine", "Spa de luxe", "Couchers de soleil"],
    featured: true,
    basePrice: 4200,
    duration: 7,
  },
  {
    id: "santorini",
    name: "Santorin",
    country: "Grèce",
    continent: "Europe",
    tagline: "La Méditerranée en bleu et blanc",
    description:
      "Perchée sur des falaises volcaniques, Santorin offre des panoramas incomparables sur la caldeira, des hôtels troglodytes et des couchers de soleil légendaires.",
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400&q=90&auto=format&fit=crop",
    category: "ISLAND",
    rating: 4.8,
    reviewCount: 2156,
    highlights: ["Vue sur la caldeira", "Villages blancs", "Gastronomie grecque", "Vignobles"],
    featured: true,
    basePrice: 2800,
    duration: 5,
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonésie",
    continent: "Asie",
    tagline: "L'Île des Dieux",
    description:
      "Entre rizières en terrasses, temples ancestraux et plages paradisiaques, Bali est une destination spirituelle et esthétique hors du commun.",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=90&auto=format&fit=crop",
    category: "CULTURAL",
    rating: 4.7,
    reviewCount: 3420,
    highlights: ["Rizières de Tegallalang", "Temples Hindous", "Surf à Seminyak", "Retraites Yoga"],
    featured: true,
    basePrice: 1900,
    duration: 10,
  },
  {
    id: "dubai",
    name: "Dubaï",
    country: "Émirats Arabes Unis",
    continent: "Moyen-Orient",
    tagline: "Le Futur entre ciel et désert",
    description:
      "La ville du record, entre gratte-ciels vertigineux, désert doré et luxe absolu. Dubaï réinvente le voyage de prestige à chaque instant.",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=90&auto=format&fit=crop",
    category: "CITY",
    rating: 4.8,
    reviewCount: 1876,
    highlights: ["Burj Khalifa", "Désert en 4x4", "Shopping de luxe", "Cuisine du monde"],
    featured: true,
    basePrice: 3100,
    duration: 6,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japon",
    continent: "Asie",
    tagline: "L'Âme du Japon éternel",
    description:
      "Ancienne capitale impériale, Kyoto conserve l'essence du Japon traditionnel : temples millénaires, geishas et jardins zen d'une quiétude absolue.",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=90&auto=format&fit=crop",
    category: "CULTURAL",
    rating: 4.9,
    reviewCount: 987,
    highlights: ["Temples Zen", "Forêt de bambous", "Cérémonie du thé", "Geishas de Gion"],
    featured: false,
    basePrice: 3500,
    duration: 8,
  },
  {
    id: "amalfi",
    name: "Côte Amalfitaine",
    country: "Italie",
    continent: "Europe",
    tagline: "La Dolce Vita face à la mer",
    description:
      "Villages accrochés aux falaises, citronniers en fleurs et mer azurée — la Côte Amalfitaine incarne l'art de vivre à l'italienne dans sa quintessence.",
    imageUrl:
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1400&q=90&auto=format&fit=crop",
    category: "BEACH",
    rating: 4.7,
    reviewCount: 1543,
    highlights: ["Positano", "Croisière privée", "Gastronomie italienne", "Villa historiques"],
    featured: false,
    basePrice: 2400,
    duration: 6,
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Sophie Marchand",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80&auto=format&fit=crop&facepad=2&crop=faces",
    location: "Paris, France",
    rating: 5,
    title: "Une expérience inoubliable aux Maldives",
    content:
      "Notre villa sur pilotis était un rêve éveillé. Chaque détail était soigné à la perfection. Je recommande Voyage Luxe les yeux fermés pour un voyage qui restera gravé à jamais.",
    voyage: "Maldives Privées",
  },
  {
    id: "2",
    name: "Pierre Dumont",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&auto=format&fit=crop&facepad=2&crop=faces",
    location: "Lyon, France",
    rating: 5,
    title: "Santorin : la lune de miel parfaite",
    content:
      "Pour nos 10 ans de mariage, Voyage Luxe nous a offert une expérience à Santorin au-delà de toutes nos attentes. Le service, les hôtels, les excursions... tout était parfait.",
    voyage: "Santorin Romantique",
  },
  {
    id: "3",
    name: "Amélie Fontaine",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&auto=format&fit=crop&facepad=2&crop=faces",
    location: "Bordeaux, France",
    rating: 5,
    title: "Bali m'a transformée",
    content:
      "Une retraite spirituelle à Bali organisée par Voyage Luxe. Les accès aux temples privés, les cours de cuisine balinaise, le spa traditionnel... Une immersion totale dans la culture.",
    voyage: "Bali Spirituel",
  },
];
