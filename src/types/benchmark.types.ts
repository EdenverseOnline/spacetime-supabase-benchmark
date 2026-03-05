import { z } from "zod";
import {
  OperationTypeSchema,
  OperationResultSchema,
  BenchmarkConfigSchema,
  AggregateMetricsSchema,
  BenchmarkStateSchema,
} from "../schemas/benchmark.schema";
import type { GearSlot, GearItem, EquippedGear } from "./gear.types";

export type OperationType = z.infer<typeof OperationTypeSchema>;
export type OperationResult = z.infer<typeof OperationResultSchema>;
export type BenchmarkConfig = z.infer<typeof BenchmarkConfigSchema>;
export type AggregateMetrics = z.infer<typeof AggregateMetricsSchema>;
export type BenchmarkState = z.infer<typeof BenchmarkStateSchema>;

export type BackendType = "spacetimedb" | "supabase";

export interface DatabaseService {
  readonly backendType: BackendType;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  equipGear(slot: GearSlot, item: GearItem): Promise<OperationResult>;
  updateGear(slot: GearSlot, item: GearItem): Promise<OperationResult>;
  unequipGear(slot: GearSlot): Promise<OperationResult>;
  readGear(): Promise<{ result: EquippedGear; operation: OperationResult }>;
}

export interface BenchmarkEngineEvents {
  onOperationComplete: (result: OperationResult) => void;
  onIterationComplete: (iteration: number, results: OperationResult[]) => void;
  onBenchmarkComplete: (allResults: OperationResult[]) => void;
  onStateChange: (state: BenchmarkState) => void;
  onGearUpdate: (backend: BackendType, gear: EquippedGear) => void;
  onError: (error: Error) => void;
}

export interface BenchmarkSnapshot {
  state: BenchmarkState;
  currentIteration: number;
  totalIterations: number;
  spacetimeResults: OperationResult[];
  supabaseResults: OperationResult[];
  spacetimeGear: EquippedGear;
  supabaseGear: EquippedGear;
  spacetimeMetrics: AggregateMetrics;
  supabaseMetrics: AggregateMetrics;
  startedAt: number | null;
  elapsedMs: number;
}

export const EMPTY_METRICS: AggregateMetrics = {
  avgRtt: 0,
  medianRtt: 0,
  p95Rtt: 0,
  p99Rtt: 0,
  minRtt: 0,
  maxRtt: 0,
  totalOps: 0,
  successfulOps: 0,
  failedOps: 0,
  successRate: 0,
  opsPerSecond: 0,
  totalDurationMs: 0,
};
