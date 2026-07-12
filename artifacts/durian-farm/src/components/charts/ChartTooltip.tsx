import { formatBaht } from "@/lib/utils";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  /** Formats a numeric value for display. Defaults to Thai baht formatting. */
  valueFormatter?: (value: number, seriesName?: string) => string;
}

/**
 * Shared Recharts tooltip used across Dashboard, Forecast, and AI Analysis charts.
 * Pass `valueFormatter` to customize how values are displayed (e.g. percentages).
 */
export function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3.5 text-xs shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 slide-in-right"
    >
      <p className="font-semibold text-gray-900 dark:text-white mb-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">{label}</p>
      <div className="space-y-2">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-gray-500 dark:text-gray-400">{p.name}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white num">
              {valueFormatter
                ? valueFormatter(Number(p.value), p.name)
                : formatBaht(Number(p.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
