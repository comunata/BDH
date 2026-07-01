import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAttractions, getLocalEvents } from "@/lib/data/explore";
import { completeChat, isAiConfigured } from "@/lib/integrations/ai";
import { getDictionary } from "@/lib/i18n";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
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
    relevant = attractions.slice(0, 6);
  } else {
    relevant = attractions.slice(0, 6);
  }

  const groundingFacts = relevant.map((a) => describe(a, locale)).join("\n");
  const eventFacts = events.map((e) => `${e.name[locale] ?? e.name.en} — ${e.date}, ${e.location}`).join("\n");

  if (await isAiConfigured()) {
    const answer = await completeChat([
      {
        role: "system",
        content: `You are the AI Local Guide for ${dict.common.brand}. Answer ONLY using the local attractions/events facts below. Reply in ${locale === "ro" ? "Romanian" : "English"}. Never invent places not listed. If asked for a multi-day plan, organize the listed places into a simple day-by-day plan.\n\nAttractions:\n${groundingFacts}\n\nEvents:\n${eventFacts}`,
      },
      { role: "user", content: question },
    ]);
    if (answer) return NextResponse.json({ answer });
  }

  const answer =
    relevant.length > 0
      ? relevant.map((a) => `• ${describe(a, locale)}`).join("\n")
      : dict.ai.concierge.handoffText;
  return NextResponse.json({ answer });
}
