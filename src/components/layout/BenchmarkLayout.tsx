import { BenchmarkControls } from "../controls/BenchmarkControls";
import { AvatarPreviewCard } from "../avatar/AvatarPreviewCard";
import { PanelContainer } from "./PanelContainer";
import { MetricsDashboard } from "../metrics/MetricsDashboard";
import { useBenchmark } from "../../hooks/useBenchmark";

export function BenchmarkLayout() {
  const {
    state,
    config,
    currentIteration,
    totalIterations,
    spacetimeResults,
    supabaseResults,
    spacetimeGear,
    supabaseGear,
    spacetimeMetrics,
    supabaseMetrics,
    recentOps,
    elapsedMs,
    latencyTimeline,
    start,
    stop,
    pause,
    resume,
    reset,
    updateConfig,
  } = useBenchmark();

  const isActive = state === "running" || state === "paused";

  return (
    <div className="benchmark-layout">
      <header className="benchmark-layout__header" role="banner">
        <div className="benchmark-layout__brand">
          <h1 className="benchmark-layout__title">
            <span className="benchmark-layout__title-accent">Edenverse</span>{" "}
            Database Benchmark
          </h1>
          <p className="benchmark-layout__subtitle">
            SpacetimeDB <span className="benchmark-layout__vs">vs</span>{" "}
            PostgreSQL (Supabase): Real-time CRUD Performance
          </p>
        </div>
      </header>

      <main className="benchmark-layout__main" role="main">
        <BenchmarkControls
          state={state}
          config={config}
          currentIteration={currentIteration}
          totalIterations={totalIterations}
          elapsedMs={elapsedMs}
          onStart={start}
          onStop={stop}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onConfigChange={updateConfig}
        />

        <div className="benchmark-layout__panels">
          <PanelContainer backend="spacetimedb">
            <AvatarPreviewCard
              backend="spacetimedb"
              gear={spacetimeGear}
              metrics={spacetimeMetrics}
              isActive={isActive}
            />
          </PanelContainer>

          <div className="benchmark-layout__divider" aria-hidden="true">
            <span className="benchmark-layout__divider-label">VS</span>
          </div>

          <PanelContainer backend="supabase">
            <AvatarPreviewCard
              backend="supabase"
              gear={supabaseGear}
              metrics={supabaseMetrics}
              isActive={isActive}
            />
          </PanelContainer>
        </div>

        <MetricsDashboard
          spacetimeMetrics={spacetimeMetrics}
          supabaseMetrics={supabaseMetrics}
          spacetimeResults={spacetimeResults}
          supabaseResults={supabaseResults}
          recentOps={recentOps}
          latencyTimeline={latencyTimeline}
        />
      </main>

      <footer className="benchmark-layout__footer" role="contentinfo">
        <p>
          Edenverse Database Benchmark: Comparing SpacetimeDB (WebSocket/WASM)
          vs PostgreSQL (Supabase REST)
        </p>
      </footer>
    </div>
  );
}
