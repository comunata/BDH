import { getServerDictionary } from "@/lib/i18n/server";
import { getServices } from "@/lib/data/services";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, StatusBadge } from "@/components/admin/AdminTable";
import { formatCurrency } from "@/lib/utils";

const chargeTypeLabel: Record<string, string> = {
  per_person: "per persoană",
  per_room: "per cameră",
  per_booking: "per rezervare",
  per_night: "per noapte",
};

export default async function AdminServicesPage() {
  const { dict } = await getServerDictionary();
  const services = await getServices();

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.services} />
      <AdminTable
        emptyLabel="Niciun serviciu configurat."
        keyField={(s) => s.id}
        rows={services}
        columns={[
          { header: "Serviciu", render: (s) => s.name.ro },
          { header: "Preț", render: (s) => formatCurrency(s.price) },
          { header: "Taxare", render: (s) => chargeTypeLabel[s.chargeType] },
          { header: "Status", render: (s) => <StatusBadge status={s.active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
