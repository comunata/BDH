import { getServerDictionary } from "@/lib/i18n/server";
import { getLocalEvents } from "@/lib/data/explore";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export default async function AdminEventsPage() {
  const { dict } = await getServerDictionary();
  const events = await getLocalEvents();

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.events} />
      <AdminTable
        emptyLabel="Niciun eveniment programat."
        keyField={(e) => e.id}
        rows={events}
        columns={[
          { header: "Eveniment", render: (e) => e.name.ro },
          { header: "Data", render: (e) => formatDate(e.date) },
          { header: "Locație", render: (e) => e.location },
        ]}
      />
    </div>
  );
}
