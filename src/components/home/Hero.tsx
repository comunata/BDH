import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";
import { BookingWidget } from "@/components/booking/BookingWidget";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-midnight">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://picsum.photos/seed/baeco-hero/2000/1400)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/20" />

      <Container className="relative z-10 pb-16 pt-40">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-champagne">{dict.common.brand}</p>
          <h1 className="font-display text-5xl leading-[1.05] text-ivory md:text-7xl">{dict.home.heroTitle}</h1>
          <p className="mt-6 max-w-lg text-base text-stone md:text-lg">{dict.home.heroSubtitle}</p>
        </div>

        <div className="mt-12">
          <BookingWidget locale={locale} dict={dict} floating />
        </div>
      </Container>
    </section>
  );
}
