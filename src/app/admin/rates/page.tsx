import { getServerDictionary } from "@/lib/i18n/server";
import { getRooms } from "@/lib/data/rooms";
import { getSeasons } from "@/lib/data/seasons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency } from "@/lib/utils";

export default async function AdminRatesPage() {
  const { dict } = await getServerDictionary();
  const [rooms, seasons] = await Promise.all([getRooms(), getSeasons()]);

  return (
    <div>
      <AdminPageHeader title={dict.admin.nav.rates} description="Tarif calculat = preț de bază × multiplicator sezon × multiplicator weekend." />
      <div className="overflow-x-auto rounded-sm border border-platinum/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-platinum/10 bg-graphite/60">
              <th className="px-4 py-3 text-[11px] uppercase tracking-widest text-stone">Cameră</th>
              {seasons.map((s) => (
                <th key={s.id} className="px-4 py-3 text-[11px] uppercase tracking-widest text-stone">
                  {s.name.ro}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-platinum/5">
                <td className="px-4 py-3 text-ivory">{room.name.ro}</td>
                {seasons.map((season) => (
                  <td key={season.id} className="px-4 py-3 text-champagne">
                    {formatCurrency(room.basePrice * season.multiplier)}
                    <span className="ml-1 text-[10px] text-stone">/ {formatCurrency(room.basePrice * season.multiplier * season.weekendMultiplier)} weekend</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
