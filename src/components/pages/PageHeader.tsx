import { Container } from "@/components/ui/Container";

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="border-b border-platinum/10 bg-graphite/30 py-20">
      <Container>
        <div className="max-w-2xl animate-fade-up">
          {eyebrow && <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-champagne">{eyebrow}</p>}
          <h1 className="font-display text-4xl text-ivory md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 text-base text-stone md:text-lg">{subtitle}</p>}
        </div>
      </Container>
    </div>
  );
}
