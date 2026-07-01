import type { LocalizedText } from "@/lib/types";

export interface PageContent {
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  body: LocalizedText;
  gallery: string[];
}

const img = (seed: string, i: number) => `https://picsum.photos/seed/baeco-${seed}-${i}/1600/1000`;

export const seedPages: Record<string, PageContent> = {
  restaurant: {
    slug: "restaurant",
    title: { ro: "Restaurant", en: "Restaurant" },
    subtitle: { ro: "Bucătărie de sezon, din produse locale", en: "Seasonal cuisine, from local produce" },
    body: {
      ro: "Restaurantul nostru propune un meniu care se schimbă odată cu anotimpurile, construit din ingrediente de la producători din zonă. Micul dejun este servit zilnic, iar cina este disponibilă pe bază de rezervare.",
      en: "Our restaurant offers a menu that evolves with the seasons, built from ingredients sourced from local producers. Breakfast is served daily, and dinner is available by reservation.",
    },
    gallery: [img("restaurant", 1), img("restaurant", 2), img("restaurant", 3)],
  },
  spa: {
    slug: "spa",
    title: { ro: "SPA & Wellness", en: "Spa & Wellness" },
    subtitle: { ro: "O pauză completă de la ritmul zilnic", en: "A complete break from the everyday rhythm" },
    body: {
      ro: "Zona de SPA include saună, baie de aburi și o gamă de tratamente de relaxare. Acces disponibil pentru oaspeți și ca serviciu extra pentru vizitatori de o zi.",
      en: "The spa area includes a sauna, steam bath and a range of relaxation treatments. Access is available for guests and as an extra service for day visitors.",
    },
    gallery: [img("spa", 1), img("spa", 2), img("spa", 3)],
  },
  pool: {
    slug: "pool",
    title: { ro: "Piscină", en: "Pool" },
    subtitle: { ro: "Piscină exterioară încălzită", en: "Heated outdoor pool" },
    body: {
      ro: "Piscina este deschisă de la mai până în septembrie, cu șezlonguri și un bar de vară adiacent.",
      en: "The pool is open from May to September, with sun loungers and an adjacent summer bar.",
    },
    gallery: [img("pool", 1), img("pool", 2), img("pool", 3)],
  },
  facilities: {
    slug: "facilities",
    title: { ro: "Facilități", en: "Facilities" },
    subtitle: { ro: "Tot ce ai nevoie, la un pas distanță", en: "Everything you need, a step away" },
    body: {
      ro: "De la Wi-Fi de mare viteză la spații pentru evenimente, fiecare facilitate este gândită să susțină un sejur fără compromisuri.",
      en: "From high-speed Wi-Fi to event spaces, every facility is designed to support a stay without compromises.",
    },
    gallery: [img("facilities", 1), img("facilities", 2), img("facilities", 3)],
  },
  gallery: {
    slug: "gallery",
    title: { ro: "Galerie", en: "Gallery" },
    subtitle: { ro: "O privire asupra proprietății", en: "A look inside the property" },
    body: { ro: "", en: "" },
    gallery: [
      img("gallery", 1), img("gallery", 2), img("gallery", 3), img("gallery", 4),
      img("gallery", 5), img("gallery", 6), img("gallery", 7), img("gallery", 8),
    ],
  },
};
