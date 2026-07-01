import { getServerDictionary } from "@/lib/i18n/server";
import { getSeasons } from "@/lib/data/seasons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export default async function AdminSeasonsPage() {
  const { dict } = await getServerDictionary();
  const seasons = await getSeasons();

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.seasons} />
      <AdminTable
        emptyLabel="Niciun sezon configurat."
        keyField={(s) => s.id}
        rows={seasons}
        columns={[
          { header: "Sezon", render: (s) => s.name.ro },
          { header: "Interval", render: (s) => `${formatDate(s.startDate)} – ${formatDate(s.endDate)}` },
          { header: "Multiplicator", render: (s) => `×${s.multiplier}` },
          { header: "Multiplicator weekend", render: (s) => `×${s.weekendMultiplier}` },
          { header: "Minim nopți", render: (s) => String(s.minNights ?? 1) },
        ]}
      />
    </div>
  );
}
