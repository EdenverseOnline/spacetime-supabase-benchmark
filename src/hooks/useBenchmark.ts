import { useState, useCallback, useRef, useEffect } from "react";
import type {
  BenchmarkConfig,
  BenchmarkState,
  OperationResult,
  AggregateMetrics,
  BackendType,
} from "../types/benchmark.types";
import { EMPTY_METRICS } from "../types/benchmark.types";
import type { EquippedGear } from "../types/gear.types";
import { BenchmarkEngine, computeMetrics } from "../services/benchmark.engine";
import {
  SpacetimeService,
  SupabaseService,
} from "../services/database.service";

interface UseBenchmarkReturn {
  state: BenchmarkState;
  config: BenchmarkConfig;
  currentIteration: number;
  totalIterations: number;
  spacetimeResults: OperationResult[];
  supabaseResults: OperationResult[];
  spacetimeGear: EquippedGear;
  supabaseGear: EquippedGear;
  spacetimeMetrics: AggregateMetrics;
  supabaseMetrics: AggregateMetrics;
  recentOps: OperationResult[];
  elapsedMs: number;
  latencyTimeline: Array<{
    time: number;
    spacetimedb: number;
    supabase: number;
  }>;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  updateConfig: (config: Partial<BenchmarkConfig>) => void;
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  iterations: 50,
  parallelCategories: true,
  delayBetweenOpsMs: 100,
};

const MAX_RECENT_OPS = 100;
const MAX_TIMELINE_POINTS = 200;

export function useBenchmark(): UseBenchmarkReturn {
  const [state, setState] = useState<BenchmarkState>("idle");
  const [config, setConfig] = useState<BenchmarkConfig>(DEFAULT_CONFIG);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [spacetimeResults, setSpacetimeResults] = useState<OperationResult[]>(
    [],
  );
  const [supabaseResults, setSupabaseResults] = useState<OperationResult[]>([]);
  const [spacetimeGear, setSpacetimeGear] = useState<EquippedGear>({});
  const [supabaseGear, setSupabaseGear] = useState<EquippedGear>({});
  const [spacetimeMetrics, setSpacetimeMetrics] = useState<AggregateMetrics>({
    ...EMPTY_METRICS,
  });
  const [supabaseMetrics, setSupabaseMetrics] = useState<AggregateMetrics>({
    ...EMPTY_METRICS,
  });
  const [recentOps, setRecentOps] = useState<OperationResult[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [latencyTimeline, setLatencyTimeline] = useState<
    Array<{ time: number; spacetimedb: number; supabase: number }>
  >([]);

  const engineRef = useRef<BenchmarkEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const spacetimeServiceRef = useRef(new SpacetimeService());
  const supabaseServiceRef = useRef(new SupabaseService());

  const stResultsRef = useRef<OperationResult[]>([]);
  const sbResultsRef = useRef<OperationResult[]>([]);
  const recentOpsRef = useRef<OperationResult[]>([]);
  const timelineRef = useRef<
    Array<{ time: number; spacetimedb: number; supabase: number }>
  >([]);
  const batchUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushUpdates = useCallback(() => {
    setSpacetimeResults([...stResultsRef.current]);
    setSupabaseResults([...sbResultsRef.current]);
    setRecentOps([...recentOpsRef.current]);
    setLatencyTimeline([...timelineRef.current]);
    setSpacetimeMetrics(computeMetrics(stResultsRef.current));
    setSupabaseMetrics(computeMetrics(sbResultsRef.current));
  }, []);

  const scheduleBatchUpdate = useCallback(() => {
    if (batchUpdateRef.current) return;
    batchUpdateRef.current = setTimeout(() => {
      flushUpdates();
      batchUpdateRef.current = null;
    }, 50);
  }, [flushUpdates]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (batchUpdateRef.current) clearTimeout(batchUpdateRef.current);
    };
  }, []);

  const start = useCallback(() => {
    stResultsRef.current = [];
    sbResultsRef.current = [];
    recentOpsRef.current = [];
    timelineRef.current = [];

    const engine = new BenchmarkEngine(
      spacetimeServiceRef.current,
      supabaseServiceRef.current,
      config,
      {
        onStateChange: (newState) => {
          setState(newState);
          if (
            newState === "completed" ||
            newState === "error" ||
            newState === "idle"
          ) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            flushUpdates();
          }
        },
        onOperationComplete: (result) => {
          if (result.backend === "spacetimedb") {
            stResultsRef.current = [...stResultsRef.current, result];
          } else {
            sbResultsRef.current = [...sbResultsRef.current, result];
          }

          recentOpsRef.current = [result, ...recentOpsRef.current].slice(
            0,
            MAX_RECENT_OPS,
          );

          const elapsed = startedAtRef.current
            ? performance.now() - startedAtRef.current
            : 0;
          const lastSt = stResultsRef.current[stResultsRef.current.length - 1];
          const lastSb = sbResultsRef.current[sbResultsRef.current.length - 1];

          if (lastSt && lastSb) {
            timelineRef.current = [
              ...timelineRef.current,
              {
                time: Math.round(elapsed),
                spacetimedb: Number(lastSt.rttMs.toFixed(2)),
                supabase: Number(lastSb.rttMs.toFixed(2)),
              },
            ].slice(-MAX_TIMELINE_POINTS);
          }

          scheduleBatchUpdate();
        },
        onIterationComplete: (iteration) => {
          setCurrentIteration(iteration);
        },
        onGearUpdate: (backend: BackendType, gear: EquippedGear) => {
          if (backend === "spacetimedb") {
            setSpacetimeGear({ ...gear });
          } else {
            setSupabaseGear({ ...gear });
          }
        },
        onError: (error) => {
          console.error("Benchmark error:", error);
        },
      },
    );

    engineRef.current = engine;
    startedAtRef.current = performance.now();

    timerRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(performance.now() - startedAtRef.current);
      }
    }, 250);

    engine.start();
  }, [config, flushUpdates, scheduleBatchUpdate]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    flushUpdates();
  }, [flushUpdates]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
    stResultsRef.current = [];
    sbResultsRef.current = [];
    recentOpsRef.current = [];
    timelineRef.current = [];
    setSpacetimeResults([]);
    setSupabaseResults([]);
    setSpacetimeGear({});
    setSupabaseGear({});
    setSpacetimeMetrics({ ...EMPTY_METRICS });
    setSupabaseMetrics({ ...EMPTY_METRICS });
    setRecentOps([]);
    setLatencyTimeline([]);
    setCurrentIteration(0);
    setElapsedMs(0);
    setState("idle");
    startedAtRef.current = null;
  }, []);

  const updateConfig = useCallback((partial: Partial<BenchmarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    state,
    config,
    currentIteration,
    totalIterations: config.iterations,
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
  };
}
