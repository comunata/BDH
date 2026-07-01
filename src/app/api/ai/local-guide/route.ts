import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAttractions, getLocalEvents } from "@/lib/data/explore";
import { completeChat, isAiConfigured } from "@/lib/integrations/ai";
import { getDictionary } from "@/lib/i18n";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Attraction } from "@/lib/types";

const requestSchema = z.object({
  question: z.string().min(1).max(1000),
  locale: z.string().optional(),
});

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function describe(a: Attraction, locale: Locale) {
  return `${a.name[locale] ?? a.name.en} (${a.distanceKm} km, ${a.driveMinutes} min) — ${a.description[locale] ?? a.description.en}`;
}

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "ai-local-guide", { maxRequests: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { question } = parsed.data;
  const locale = isLocale(parsed.data.locale ?? "") ? (parsed.data.locale as Locale) : defaultLocale;
  const dict = getDictionary(locale);

  const [attractions, events] = await Promise.all([getAttractions(), getLocalEvents()]);
  const q = normalize(question);

  let relevant: Attraction[];
  if (/(ploua|ploaie|rain)/.test(q)) {
    relevant = attractions.filter((a) => a.goodFor.includes("rainy-day"));
  } else if (/(copii|copil|kids|children)/.test(q)) {
    relevant = attractions.filter((a) => a.goodFor.includes("kids") || a.goodFor.includes("family"));
  } else if (/(romantic|romantica|romance)/.test(q)) {
    relevant = attractions.filter((a) => a.goodFor.includes("romantic"));
  } else if (/(mananc|mâncăm|eat|restaurant|cafenea|cafe)/.test(q)) {
    relevant = attractions.filter((a) => a.category === "restaurant" || a.category === "cafe");
  } else if (/(vizit|visit|attraction|obiectiv)/.test(q)) {
    relevant = attractions.filter((a) => a.category === "attraction");
  } else if (/(3 zile|3 days|plan|itinerar)/.test(q)) {
    relevant = attractions;
  } else {
    relevant = attractions.slice(0, 6);
  }

  const isItineraryRequest = /(3 zile|3 days|plan|itinerar)/.test(q);
  const groundingFacts = relevant.map((a) => describe(a, locale)).join("\n");
  const eventFacts = events.map((e) => `${e.name[locale] ?? e.name.en} — ${e.date}, ${e.location}`).join("\n");
  const mapLinks = relevant
    .map((a) => `${a.name[locale] ?? a.name.en}: https://www.google.com/maps?q=${a.lat},${a.lng}`)
    .join("\n");

  if (await isAiConfigured()) {
    const itineraryInstructions = isItineraryRequest
      ? `\n\nThe guest asked for a multi-day plan. Produce a structured 3-day itinerary (Ziua 1 / Ziua 2 / Ziua 3 or Day 1 / Day 2 / Day 3) using ONLY the real places listed below. For each day include: 2-3 objectives with estimated visit time and driving distance/time from the hotel (use the exact distanceKm/driveMinutes given), at least one recommended restaurant or cafe for a meal, and one suggested activity. Keep mornings/afternoons/evenings roughly balanced across the real places available — reuse a place across days only if there aren't enough distinct ones. End each day's entry with its Google Maps link if available.`
      : "";
    const answer = await completeChat([
      {
        role: "system",
        content:
          `You are the AI Local Guide for ${dict.common.brand}. Answer ONLY using the local attractions/events facts below. Reply in ${locale === "ro" ? "Romanian" : "English"}. Never invent places not listed.` +
          itineraryInstructions +
          `\n\nAttractions:\n${groundingFacts}\n\nEvents:\n${eventFacts}\n\nMap links:\n${mapLinks}`,
      },
      { role: "user", content: question },
    ]);
    if (answer) return NextResponse.json({ answer, itinerary: isItineraryRequest });
  }

  if (isItineraryRequest) {
    // Deterministic fallback itinerary (no AI key configured): split the
    // real attractions/restaurants/cafes evenly across 3 days.
    const days: Attraction[][] = [[], [], []];
    relevant.forEach((a, i) => days[i % 3].push(a));
    const dayLabel = (n: number) => (locale === "ro" ? `Ziua ${n}` : `Day ${n}`);
    const answer = days
      .map((items, i) => {
        const lines = items
          .map((a) => `  • ${describe(a, locale)} — https://www.google.com/maps?q=${a.lat},${a.lng}`)
          .join("\n");
        return `${dayLabel(i + 1)}:\n${lines || (locale === "ro" ? "  (fără obiective suplimentare)" : "  (no additional objectives)")}`;
      })
      .join("\n\n");
    return NextResponse.json({ answer, itinerary: true });
  }

  const answer =
    relevant.length > 0
      ? relevant.map((a) => `• ${describe(a, locale)}`).join("\n")
      : dict.ai.concierge.handoffText;
  return NextResponse.json({ answer });
}
