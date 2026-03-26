import { ModuleCard } from '../../shared/components/ModuleCard';

export function MarketModulePage() {
  return (
    <ModuleCard
      title="Market Module"
      description="Core market area for pairs, price boards, and market analytics."
    >
      <ul className="space-y-2 text-sm text-slate-300">
        <li>Domain folder: src/features/market</li>
        <li>Route: /app/market</li>
        <li>Next steps: market table, websocket ticker stream, filters, and watchlists</li>
      </ul>
    </ModuleCard>
  );
}
