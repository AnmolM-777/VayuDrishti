/**
 * AQI color legend overlay for the map.
 */

const AQI_LEVELS = [
  { range: '0–50', label: 'Good', color: '#22c55e' },
  { range: '51–100', label: 'Satisfactory', color: '#84cc16' },
  { range: '101–200', label: 'Moderate', color: '#f59e0b' },
  { range: '201–300', label: 'Poor', color: '#f97316' },
  { range: '301–400', label: 'Very Poor', color: '#ef4444' },
  { range: '400+', label: 'Severe', color: '#8b5cf6' },
];

export function MapLegend() {
  return (
    <div className="bg-card/95 border-border absolute bottom-4 left-4 z-10 rounded-xl border p-3 shadow-lg backdrop-blur-md">
      <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
        AQI Levels
      </p>
      <div className="space-y-1.5">
        {AQI_LEVELS.map((l) => (
          <div key={l.range} className="flex items-center gap-2">
            <div
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-[10px]">{l.label}</span>
            <span className="text-muted-foreground ml-auto pl-2 text-[10px]">
              {l.range}
            </span>
          </div>
        ))}
      </div>
      <div className="border-border mt-2 space-y-1 border-t pt-2">
        <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
          <div className="size-2.5 shrink-0 rounded-full border border-white bg-slate-600" />
          CPCB Station
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
          <div className="size-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
          Active Hotspot
        </div>
      </div>
    </div>
  );
}
