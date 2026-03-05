import type {
  AggregateMetrics,
  OperationResult,
} from "../../types/benchmark.types";
import { StatCard } from "./StatCard";
import { LatencyChart } from "./LatencyChart";
import { ThroughputChart } from "./ThroughputChart";
import { OperationLog } from "./OperationLog";
import {
  formatMs,
  formatOpsPerSecond,
  formatPercentage,
} from "../../utils/formatters";

interface MetricsDashboardProps {
  spacetimeMetrics: AggregateMetrics;
  supabaseMetrics: AggregateMetrics;
  spacetimeResults: OperationResult[];
  supabaseResults: OperationResult[];
  recentOps: OperationResult[];
  latencyTimeline: Array<{
    time: number;
    spacetimedb: number;
    supabase: number;
  }>;
}

export function MetricsDashboard({
  spacetimeMetrics,
  supabaseMetrics,
  spacetimeResults,
  supabaseResults,
  recentOps,
  latencyTimeline,
}: MetricsDashboardProps) {
  return (
    <section className="metrics-dashboard" aria-label="Benchmark Metrics">
      <h2 className="metrics-dashboard__title">Performance Metrics</h2>

      <div className="metrics-dashboard__stats">
        <StatCard
          label="Avg RTT"
          spacetimeValue={formatMs(spacetimeMetrics.avgRtt)}
          supabaseValue={formatMs(supabaseMetrics.avgRtt)}
        />
        <StatCard
          label="Median RTT"
          spacetimeValue={formatMs(spacetimeMetrics.medianRtt)}
          supabaseValue={formatMs(supabaseMetrics.medianRtt)}
        />
        <StatCard
          label="P95 RTT"
          spacetimeValue={formatMs(spacetimeMetrics.p95Rtt)}
          supabaseValue={formatMs(supabaseMetrics.p95Rtt)}
        />
        <StatCard
          label="P99 RTT"
          spacetimeValue={formatMs(spacetimeMetrics.p99Rtt)}
          supabaseValue={formatMs(supabaseMetrics.p99Rtt)}
        />
        <StatCard
          label="Min RTT"
          spacetimeValue={formatMs(spacetimeMetrics.minRtt)}
          supabaseValue={formatMs(supabaseMetrics.minRtt)}
        />
        <StatCard
          label="Max RTT"
          spacetimeValue={formatMs(spacetimeMetrics.maxRtt)}
          supabaseValue={formatMs(supabaseMetrics.maxRtt)}
        />
        <StatCard
          label="Ops/sec"
          spacetimeValue={formatOpsPerSecond(spacetimeMetrics.opsPerSecond)}
          supabaseValue={formatOpsPerSecond(supabaseMetrics.opsPerSecond)}
          higherIsBetter
        />
        <StatCard
          label="Success Rate"
          spacetimeValue={formatPercentage(spacetimeMetrics.successRate)}
          supabaseValue={formatPercentage(supabaseMetrics.successRate)}
          higherIsBetter
        />
        <StatCard
          label="Total Ops"
          spacetimeValue={String(spacetimeMetrics.totalOps)}
          supabaseValue={String(supabaseMetrics.totalOps)}
          higherIsBetter
        />
      </div>

      <div className="metrics-dashboard__charts">
        <LatencyChart data={latencyTimeline} />
        <ThroughputChart
          spacetimeResults={spacetimeResults}
          supabaseResults={supabaseResults}
        />
      </div>

      <div className="metrics-dashboard__log">
        <OperationLog operations={recentOps} />
      </div>
    </section>
  );
}
