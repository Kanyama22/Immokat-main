import { getCommunes } from "@/data/mockListings";

interface Filters {
  type: string;
  propertyType: string;
  commune: string;
  query: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const selectClasses =
  "rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

export default function SearchFilters({ filters, onChange }: Props) {
  const communes = getCommunes();

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Rechercher..."
        value={filters.query}
        onChange={(e) => update("query", e.target.value)}
        className={`${selectClasses} flex-1 min-w-[200px]`}
      />
      <select
        value={filters.type}
        onChange={(e) => update("type", e.target.value)}
        className={selectClasses}
      >
        <option value="">Tout type</option>
        <option value="vente">Vente</option>
        <option value="location">Location</option>
      </select>
      <select
        value={filters.propertyType}
        onChange={(e) => update("propertyType", e.target.value)}
        className={selectClasses}
      >
        <option value="">Tout bien</option>
        <option value="maison">Maison</option>
        <option value="terrain">Terrain</option>
        <option value="appartement">Appartement</option>
      </select>
      <select
        value={filters.commune}
        onChange={(e) => update("commune", e.target.value)}
        className={selectClasses}
      >
        <option value="">Toutes communes</option>
        {communes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
