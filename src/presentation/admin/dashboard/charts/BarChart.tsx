// Server Component puro: solo transforma props en <svg>, sin estado ni
// interacción — tooltip vía <title> nativo. SVG propio, cero dependencias.
const HEIGHT = 100;
const BAR_GAP = 0.6;

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("es-VE", { day: "2-digit", month: "short" });
}

export function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = 100 / data.length;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label="Leads por día"
      >
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.count / max) * HEIGHT : 0;
          const x = i * barWidth + BAR_GAP / 2;
          const width = Math.max(0, barWidth - BAR_GAP);
          const y = HEIGHT - barHeight;
          return (
            <rect key={d.date} x={x} y={y} width={width} height={barHeight} fill="var(--color-trust)">
              <title>{`${formatShortDate(d.date)}: ${d.count}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-text-muted">
        <span>{data[0] && formatShortDate(data[0].date)}</span>
        <span>{data[data.length - 1] && formatShortDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}
