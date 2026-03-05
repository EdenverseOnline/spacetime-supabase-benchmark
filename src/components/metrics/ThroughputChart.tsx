import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { OperationResult } from "../../types/benchmark.types";
import { GEAR_SLOTS } from "../../schemas/gear.schema";

interface ThroughputChartProps {
  spacetimeResults: OperationResult[];
  supabaseResults: OperationResult[];
}

export function ThroughputChart({
  spacetimeResults,
  supabaseResults,
}: ThroughputChartProps) {
  const data = GEAR_SLOTS.map((slot) => {
    const stSlotResults = spacetimeResults.filter(
      (r) => r.slot === slot && r.success,
    );
    const sbSlotResults = supabaseResults.filter(
      (r) => r.slot === slot && r.success,
    );

    const stAvg =
      stSlotResults.length > 0
        ? stSlotResults.reduce((a, b) => a + b.rttMs, 0) / stSlotResults.length
        : 0;
    const sbAvg =
      sbSlotResults.length > 0
        ? sbSlotResults.reduce((a, b) => a + b.rttMs, 0) / sbSlotResults.length
        : 0;

    return {
      slot: slot.charAt(0).toUpperCase() + slot.slice(1),
      SpacetimeDB: Number(stAvg.toFixed(2)),
      Supabase: Number(sbAvg.toFixed(2)),
    };
  });

  return (
    <div
      className="chart-container"
      role="img"
      aria-label="Average RTT per gear category"
    >
      <h3 className="chart-container__title">Avg RTT by Category (ms)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis dataKey="slot" stroke="rgba(255,255,255,0.3)" fontSize={11} />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(10, 14, 26, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0",
            }}
            formatter={(value) => [`${Number(value).toFixed(2)}ms`]}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
          <Bar dataKey="SpacetimeDB" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Supabase" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
