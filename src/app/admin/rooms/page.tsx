import { getServerDictionary } from "@/lib/i18n/server";
import { getRooms } from "@/lib/data/rooms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, StatusBadge } from "@/components/admin/AdminTable";
import { formatCurrency } from "@/lib/utils";

export default async function AdminRoomsPage() {
  const { dict } = await getServerDictionary();
  const rooms = await getRooms();

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.rooms} description="Editarea completă necesită conectarea Supabase (tabelul rooms)." />
      <AdminTable
        emptyLabel="Nicio cameră configurată."
        keyField={(r) => r.id}
        rows={rooms}
        columns={[
          { header: "Nume", render: (r) => r.name.ro },
          { header: "Capacitate", render: (r) => `${r.maxAdults} + ${r.maxChildren}` },
          { header: "Suprafață", render: (r) => `${r.sizeSqm} m²` },
          { header: "Preț de bază", render: (r) => formatCurrency(r.basePrice) },
          { header: "Status", render: (r) => <StatusBadge status={r.active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
