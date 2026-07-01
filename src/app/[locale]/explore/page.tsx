import { notFound } from "next/navigation";
import Image from "next/image";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getAttractions } from "@/lib/data/explore";
import { getWeatherToday } from "@/lib/integrations/weather";
import { PageHeader } from "@/components/pages/PageHeader";
import { Section } from "@/components/ui/Section";
import { LocalGuideChat } from "@/components/ai/LocalGuideChat";
import type { Attraction } from "@/lib/types";

// Real Bucovina photos (monasteries, nature, trails) categorized under
// public/images/explore — reused deterministically across attraction cards
// since there isn't a 1:1 photo per attraction in the seed data.
const exploreImages = [
  "/images/explore/094950562916ba4478d80bfbd6b28d8b.jpg",
  "/images/explore/0b426843dddfece952b3c3aa027bd354.jpg",
  "/images/explore/226964dcdf0a0882c93bf8a89657e338.jpg",
  "/images/explore/2a087e23a961d9666ae8723d804fa4ac.jpg",
  "/images/explore/2dfb12d1da3716e851848a54d2a77121.jpg",
  "/images/explore/2e752854cb526887850d62bc1ccb2901.jpg",
  "/images/explore/425df1ba2db69b4dbb613f18c2602939.jpg",
  "/images/explore/6eb716628d0b707ee27169eb3f98c090.jpg",
  "/images/explore/7387d5222efdda1320bcc20c682f683b.jpg",
  "/images/explore/76bd2ebff6a2a70946f711da036ba39b.jpg",
  "/images/explore/7da693d35809543df6b6f00e974dbadf.jpg",
  "/images/explore/84e6ed1f71b0b66761e834252c3d67b7.jpg",
  "/images/explore/a01db56af644f3216bdc74f304498bb8.jpg",
  "/images/explore/aad6d71e5cc8168f3b107ef126924f95.jpg",
  "/images/explore/b2cd0d7d7884c89767a8c2381fa1dfb1.jpg",
  "/images/explore/c68321955e9ac35422d666f13497e182.jpg",
  "/images/explore/d15adec32154b69a742f02e2f60b36f9.jpg",
  "/images/explore/d64cbb77a3b5884f1175e9ffbcf45782.jpg",
  "/images/explore/d8637d2e2042e48e1c3c7eee01200833.jpg",
  "/images/explore/f799e86ae64e8d883962426c657bf965.jpg",
];

function imageFor(attraction: Attraction, index: number) {
  if (attraction.image) return attraction.image;
  return exploreImages[index % exploreImages.length];
}

const categoryLabel: Record<Attraction["category"], { ro: string; en: string }> = {
  attraction: { ro: "Obiective turistice", en: "Attractions" },
  restaurant: { ro: "Restaurante", en: "Restaurants" },
  cafe: { ro: "Cafenele", en: "Cafes" },
  market: { ro: "Piețe", en: "Markets" },
  shop: { ro: "Magazine locale", en: "Local shops" },
  producer: { ro: "Producători locali", en: "Local producers" },
};

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const [attractions, weather] = await Promise.all([getAttractions(), getWeatherToday()]);

  const byCategory = attractions.reduce<Record<string, Attraction[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <>
      <PageHeader eyebrow={dict.nav.explore} title={dict.explore.title} subtitle={dict.explore.subtitle} />
      <Section>
        <div className="mb-12 flex items-center gap-4 rounded-sm border border-platinum/10 bg-graphite/60 px-6 py-4">
          <span className="font-display text-3xl text-champagne">{weather.tempC}°C</span>
          <span className="text-sm text-stone">{dict.explore.weather} · {weather.condition}</span>
        </div>

        <div className="mb-16">
          <LocalGuideChat locale={locale} dict={dict} />
        </div>

        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="mb-16">
            <h2 className="font-display text-2xl text-ivory">{categoryLabel[category as Attraction["category"]][locale === "ro" ? "ro" : "en"]}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {items.map((item, i) => (
                <div key={item.id} className="overflow-hidden rounded-sm border border-platinum/10 pb-6">
                  <div className="relative aspect-[16/9]">
                    <Image src={imageFor(item, i)} alt={item.name[locale] ?? item.name.en} fill sizes="50vw" className="object-cover" />
                  </div>
                  <div className="px-1 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-lg text-ivory">{item.name[locale] ?? item.name.en}</h3>
                      <span className="text-xs uppercase tracking-widest text-champagne">
                        {item.distanceKm} km · {item.driveMinutes} min
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone">{item.description[locale] ?? item.description.en}</p>
                    <a
                      href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs font-medium uppercase tracking-widest text-champagne underline"
                    >
                      {dict.explore.viewOnMap}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </>
  );
}
