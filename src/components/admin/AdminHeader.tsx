import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/config";
import type { AdminSession } from "@/lib/admin/session";

export function AdminHeader({ locale, session }: { locale: Locale; session: AdminSession }) {
  return (
    <header className="flex items-center justify-between border-b border-platinum/10 bg-midnight/80 px-6 py-4 backdrop-blur">
      <div>
        {session.demoMode && (
          <span className="rounded-full border border-champagne/40 px-3 py-1 text-[11px] uppercase tracking-widest text-champagne">
            Demo mode — conectează Supabase pentru date live
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {session.email && <span className="text-xs text-stone">{session.email}</span>}
        <LocaleSwitcher current={locale} />
      </div>
    </header>
  );
}
