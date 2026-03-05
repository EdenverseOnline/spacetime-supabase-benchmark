import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LatencyChartProps {
  data: Array<{ time: number; spacetimedb: number; supabase: number }>;
}

export function LatencyChart({ data }: LatencyChartProps) {
  return (
    <div
      className="chart-container"
      role="img"
      aria-label="Latency comparison chart over time"
    >
      <h3 className="chart-container__title">Round-Trip Latency (ms)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickFormatter={(v: number) => `${v.toFixed(0)}ms`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(10, 14, 26, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e2e8f0",
            }}
            labelFormatter={(v) => `${(Number(v) / 1000).toFixed(2)}s`}
            formatter={(value) => [`${Number(value).toFixed(2)}ms`]}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
          <Line
            type="monotone"
            dataKey="spacetimedb"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            name="SpacetimeDB"
            activeDot={{ r: 4, stroke: "#06b6d4" }}
          />
          <Line
            type="monotone"
            dataKey="supabase"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Supabase"
            activeDot={{ r: 4, stroke: "#f59e0b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
