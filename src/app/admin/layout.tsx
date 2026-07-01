import { getServerDictionary } from "@/lib/i18n/server";
import { getAdminSession } from "@/lib/admin/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getServerDictionary();
  const session = await getAdminSession();

  if (!session.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight px-6 text-center">
        <div>
          <p className="font-display text-2xl text-ivory">Autentificare necesară</p>
          <p className="mt-2 text-sm text-stone">Conectează-te pentru a accesa panoul de administrare.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-midnight text-ivory">
      <AdminSidebar dict={dict} />
      <div className="flex-1">
        <AdminHeader locale={locale} session={session} />
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
