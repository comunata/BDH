import { getServerDictionary } from "@/lib/i18n/server";
import { getAttractions } from "@/lib/data/explore";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminRestaurantsPage() {
  const { dict } = await getServerDictionary();
  const attractions = await getAttractions();
  const restaurants = attractions.filter((a) => a.category === "restaurant" || a.category === "cafe");

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.restaurants} />
      <AdminTable
        emptyLabel="Niciun restaurant/cafenea adăugat."
        keyField={(r) => r.id}
        rows={restaurants}
        columns={[
          { header: "Nume", render: (r) => r.name.ro },
          { header: "Categorie", render: (r) => <span className="capitalize">{r.category}</span> },
          { header: "Distanță", render: (r) => `${r.distanceKm} km / ${r.driveMinutes} min` },
          { header: "Potrivit pentru", render: (r) => r.goodFor.join(", ") },
        ]}
      />
    </div>
  );
}
