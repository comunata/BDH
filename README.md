# Baeco Hospitality Enterprise 2027

Platformă premium modulară pentru hoteluri, pensiuni, vile și case de vacanță: website, booking engine, admin enterprise, portal client, AI Concierge, AI Local Guide și integrări reale (Supabase, email, WhatsApp, plăți, hărți, vreme, analytics).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — design system "Quiet Luxury" (paletă Midnight Obsidian / Champagne Gold / Royal Emerald etc., vezi `src/app/globals.css`)
- **Supabase** (Postgres + Auth + Storage + RLS) — opțional; platforma rulează complet fără el, cu date demo
- Adaptoare izolate pentru fiecare integrare externă (OpenAI, Resend/SendGrid, WhatsApp, Stripe, Google Maps, OpenWeather, GA/Meta Pixel)

## Arhitectură

```
src/
  app/
    [locale]/        website public (ro/en, pregătit pentru de/fr/it/es)
    admin/            Admin Enterprise (fără prefix de limbă)
    portal/           Portal Client (fără prefix de limbă)
    api/              rute API: booking, ai, contact, portal
  components/         UI, layout, booking, admin, portal, ai, seo, pwa
  config/             modules.ts (feature flags), site.ts, adminNav.ts
  lib/
    i18n/             dicționare de traducere RO/EN + fallback DE/FR/IT/ES
    data/              strat de acces la date: Supabase dacă e configurat, altfel seed/*
    integrations/      email, whatsapp, ai, weather, payments, calendar, analytics, channel-manager
    pricing.ts         motorul de calcul preț (sezoane, weekend, extra, taxe, reduceri, voucher)
    supabase/          clienți browser/server/admin
supabase/
  migrations/0001_init.sql   schema completă + RLS
  seed.sql                    roluri + proprietate implicită
```

### Principiul cheie: totul funcționează fără chei API

Fiecare integrare are un mod „mock”/sandbox: dacă variabila de mediu lipsește, funcția răspunde realist (loghează, generează un link, folosește date demo) în loc să eșueze. Asta înseamnă că poți clona proiectul și naviga tot site-ul, adminul, portalul, booking engine-ul și AI-ul fără să configurezi nimic — apoi activezi integrările una câte una din `.env.local` (vezi `.env.example`) sau verifici starea lor din **Admin → Integrări**.

### Module activabile/dezactivabile

`src/config/modules.ts` listează toate cele 12 module cerute (website, booking, admin, portal, aiConcierge, aiLocalGuide, explore, aiKnowledgeBase, seo, analytics, notifications, integrations). Se dezactivează cu `NEXT_PUBLIC_MODULE_<CHEIE>=false` în `.env.local`; persistență per-proprietate din Supabase (tabelul `settings`) e pregătită în schema SQL.

## Pornire locală

```bash
npm install
cp .env.example .env.local   # opțional — merge și fără el
npm run dev
```

Deschide `http://localhost:3000` (redirect automat la `/ro`), `/admin` pentru panoul de administrare și `/portal` pentru contul de client (ambele în „demo mode" până conectezi Supabase Auth).

## Conectarea Supabase

1. Creează un proiect Supabase, rulează `supabase/migrations/0001_init.sql` apoi `supabase/seed.sql`.
2. Setează `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Din acel moment, `src/lib/data/*` citește/scrie din Postgres în loc de datele demo din `src/lib/data/seed/*`; RLS separă accesul public (citire), admin (rol owner/manager/staff) și client (rândurile proprii).

## Motorul de rezervări

`src/lib/pricing.ts` calculează: tarif per noapte (bază × multiplicator sezon × multiplicator weekend), reducere pentru sejur 7+ nopți, servicii extra (per persoană/cameră/rezervare/noapte, cu copii sub 6 ani gratuiți), cod promoțional, taxă turistică per persoană adultă/pe noapte, voucher cadou aplicat pe rest. Rezumatul (`lines`) e afișat identic în booking engine și în factura din Portal Client. Prețul e recalculat și validat server-side la crearea rezervării (`/api/booking/create`), nu doar pe client.

## AI Concierge & AI Local Guide

Ambele rulează pe un strat de „grounding": caută în AI Knowledge Base (`ai_knowledge` / `src/lib/data/seed/content.ts`) și în datele reale (camere, atracții, evenimente) cuvintele cheie din întrebare. Dacă `OPENAI_API_KEY` e setat, răspunsul e reformulat de model dar **strict limitat la faptele găsite** (nu are voie să inventeze); fără cheie, răspunde direct cu intrarea din Knowledge Base găsită. Când nu găsește nimic relevant, AI Concierge oferă preluare pe WhatsApp în loc să ghicească.

## Traduceri

Totul trece prin chei de traducere (`src/lib/i18n/dictionaries/*`), niciun text hardcodat în componente. RO și EN sunt complete; DE/FR/IT/ES au cheile vizibile (nav, hero) traduse și restul cad automat pe EN până sunt completate (vezi Admin → Traduceri pentru statusul per limbă).

## Ce necesită configurare suplimentară înainte de lansare comercială

- Fotografii reale (galeria folosește `picsum.photos` ca placeholder)
- Autentificare Supabase Auth pentru Admin/Portal (în prezent „demo mode" dacă Supabase nu e conectat)
- Chei de producție pentru plăți (Stripe/Revolut/PayPal), WhatsApp Business, email transacțional
- Traducere profesională DE/FR/IT/ES
- Integrări channel manager (Booking.com/Airbnb/Expedia) — interfața e pregătită în `src/lib/integrations/channel-manager.ts`, fără implementare, până la alegerea unui provider (Channex, ex.)
