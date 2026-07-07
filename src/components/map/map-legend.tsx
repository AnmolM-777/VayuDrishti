/**
 * AQI color legend overlay for the map.
 */

const AQI_LEVELS = [
  { range: '0–50',   label: 'Good',        color: '#22c55e' },
  { range: '51–100', label: 'Satisfactory', color: '#84cc16' },
  { range: '101–200',label: 'Moderate',    color: '#f59e0b' },
  { range: '201–300',label: 'Poor',        color: '#f97316' },
  { range: '301–400',label: 'Very Poor',   color: '#ef4444' },
  { range: '400+',   label: 'Severe',      color: '#8b5cf6' },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">AQI Levels</p>
      <div className="space-y-1.5">
        {AQI_LEVELS.map((l) => (
          <div key={l.range} className="flex items-center gap-2">
            <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[10px]">{l.label}</span>
            <span className="text-[10px] text-muted-foreground ml-auto pl-2">{l.range}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-border space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="size-2.5 rounded-full border border-white bg-slate-600 shrink-0" />
          CPCB Station
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="size-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
          Active Hotspot
        </div>
      </div>
    </div>
  );
}
