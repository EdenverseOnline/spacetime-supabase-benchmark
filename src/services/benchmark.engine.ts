import type {
  DatabaseService,
  OperationResult,
  BenchmarkConfig,
  AggregateMetrics,
  BenchmarkState,
  BenchmarkEngineEvents,
  BackendType,
} from "../types/benchmark.types";
import type { EquippedGear, GearSlot, GearItem } from "../types/gear.types";
import { GEAR_SLOTS } from "../schemas/gear.schema";
import { computePercentile, delay } from "../utils/timing";
import { getRandomGearForSlot } from "./database.service";
import { EMPTY_METRICS } from "../types/benchmark.types";

export function computeMetrics(results: OperationResult[]): AggregateMetrics {
  if (results.length === 0) return { ...EMPTY_METRICS };

  const rttValues = results.filter((r) => r.success).map((r) => r.rttMs);
  const sorted = [...rttValues].sort((a, b) => a - b);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;
  const totalDuration =
    results.length > 0
      ? results[results.length - 1].endTime - results[0].startTime
      : 0;

  return {
    avgRtt:
      sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
    medianRtt: computePercentile(sorted, 50),
    p95Rtt: computePercentile(sorted, 95),
    p99Rtt: computePercentile(sorted, 99),
    minRtt: sorted.length > 0 ? sorted[0] : 0,
    maxRtt: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
    totalOps: results.length,
    successfulOps: successCount,
    failedOps: failCount,
    successRate: results.length > 0 ? successCount / results.length : 0,
    opsPerSecond:
      totalDuration > 0 ? (results.length / totalDuration) * 1000 : 0,
    totalDurationMs: totalDuration,
  };
}

export class BenchmarkEngine {
  private spacetimeService: DatabaseService;
  private supabaseService: DatabaseService;
  private config: BenchmarkConfig;
  private events: Partial<BenchmarkEngineEvents>;
  private state: BenchmarkState = "idle";
  private currentIteration = 0;
  private spacetimeResults: OperationResult[] = [];
  private supabaseResults: OperationResult[] = [];
  private spacetimeGear: EquippedGear = {};
  private supabaseGear: EquippedGear = {};
  private abortController: AbortController | null = null;
  private pauseResolve: (() => void) | null = null;
  private startedAt: number | null = null;

  constructor(
    spacetimeService: DatabaseService,
    supabaseService: DatabaseService,
    config: BenchmarkConfig,
    events: Partial<BenchmarkEngineEvents> = {},
  ) {
    this.spacetimeService = spacetimeService;
    this.supabaseService = supabaseService;
    this.config = config;
    this.events = events;
  }

  updateConfig(config: Partial<BenchmarkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  updateEvents(events: Partial<BenchmarkEngineEvents>): void {
    this.events = { ...this.events, ...events };
  }

  getState(): BenchmarkState {
    return this.state;
  }

  getSnapshot() {
    return {
      state: this.state,
      currentIteration: this.currentIteration,
      totalIterations: this.config.iterations,
      spacetimeResults: [...this.spacetimeResults],
      supabaseResults: [...this.supabaseResults],
      spacetimeGear: { ...this.spacetimeGear },
      supabaseGear: { ...this.supabaseGear },
      spacetimeMetrics: computeMetrics(this.spacetimeResults),
      supabaseMetrics: computeMetrics(this.supabaseResults),
      startedAt: this.startedAt,
      elapsedMs: this.startedAt ? performance.now() - this.startedAt : 0,
    };
  }

  private setState(state: BenchmarkState): void {
    this.state = state;
    this.events.onStateChange?.(state);
  }

  private async waitIfPaused(): Promise<void> {
    if (this.state === "paused") {
      await new Promise<void>((resolve) => {
        this.pauseResolve = resolve;
      });
    }
  }

  private recordResult(
    result: OperationResult,
    backend: BackendType,
    iterationResults: OperationResult[],
  ): void {
    if (backend === "spacetimedb") {
      this.spacetimeResults.push(result);
    } else {
      this.supabaseResults.push(result);
    }
    iterationResults.push(result);
    this.events.onOperationComplete?.(result);
  }

  async start(): Promise<void> {
    if (this.state === "running") return;

    this.spacetimeResults = [];
    this.supabaseResults = [];
    this.spacetimeGear = {};
    this.supabaseGear = {};
    this.currentIteration = 0;
    this.abortController = new AbortController();
    this.startedAt = performance.now();
    this.setState("running");

    try {
      if (!this.spacetimeService.isConnected()) {
        await this.spacetimeService.connect();
      }
      if (!this.supabaseService.isConnected()) {
        await this.supabaseService.connect();
      }

      for (let i = 0; i < this.config.iterations; i++) {
        if (this.abortController.signal.aborted) break;
        await this.waitIfPaused();
        if (this.abortController.signal.aborted) break;

        this.currentIteration = i + 1;
        const iterationResults = await this.runIteration();
        this.events.onIterationComplete?.(i + 1, iterationResults);

        if (
          i < this.config.iterations - 1 &&
          this.config.delayBetweenOpsMs > 0
        ) {
          await delay(this.config.delayBetweenOpsMs);
        }
      }

      if (!this.abortController.signal.aborted) {
        this.setState("completed");
        this.events.onBenchmarkComplete?.([
          ...this.spacetimeResults,
          ...this.supabaseResults,
        ]);
      }
    } catch (error) {
      this.setState("error");
      this.events.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async runCrudCycleForSlot(
    service: DatabaseService,
    backend: BackendType,
    slot: GearSlot,
    iterationResults: OperationResult[],
  ): Promise<void> {
    const item1 = getRandomGearForSlot(slot);
    let item2 = getRandomGearForSlot(slot);
    while (item2.id === item1.id) {
      item2 = getRandomGearForSlot(slot);
    }

    const equipResult = await service.equipGear(slot, item1);
    this.recordResult(equipResult, backend, iterationResults);
    this.updateGearState(backend, slot, item1);

    const readAfterEquip = await service.readGear();
    this.recordResult(readAfterEquip.operation, backend, iterationResults);

    const updateResult = await service.updateGear(slot, item2);
    this.recordResult(updateResult, backend, iterationResults);
    this.updateGearState(backend, slot, item2);

    const readAfterUpdate = await service.readGear();
    this.recordResult(readAfterUpdate.operation, backend, iterationResults);

    const unequipResult = await service.unequipGear(slot);
    this.recordResult(unequipResult, backend, iterationResults);
    this.updateGearState(backend, slot, null);

    const readAfterDelete = await service.readGear();
    this.recordResult(readAfterDelete.operation, backend, iterationResults);

    // const finalEquipResult = await service.equipGear(slot, item1);
    // this.recordResult(finalEquipResult, backend, iterationResults);
    // this.updateGearState(backend, slot, item1);
  }

  private updateGearState(
    backend: BackendType,
    slot: GearSlot,
    item: GearItem | null,
  ): void {
    if (backend === "spacetimedb") {
      this.spacetimeGear = { ...this.spacetimeGear, [slot]: item };
      this.events.onGearUpdate?.("spacetimedb", { ...this.spacetimeGear });
    } else {
      this.supabaseGear = { ...this.supabaseGear, [slot]: item };
      this.events.onGearUpdate?.("supabase", { ...this.supabaseGear });
    }
  }

  private async runIteration(): Promise<OperationResult[]> {
    const slots: GearSlot[] = [...GEAR_SLOTS];
    const iterationResults: OperationResult[] = [];

    if (this.config.parallelCategories) {
      const promises = slots.flatMap((slot) => [
        this.runCrudCycleForSlot(
          this.spacetimeService,
          "spacetimedb",
          slot,
          iterationResults,
        ),
        this.runCrudCycleForSlot(
          this.supabaseService,
          "supabase",
          slot,
          iterationResults,
        ),
      ]);
      await Promise.all(promises);
    } else {
      for (const slot of slots) {
        await Promise.all([
          this.runCrudCycleForSlot(
            this.spacetimeService,
            "spacetimedb",
            slot,
            iterationResults,
          ),
          this.runCrudCycleForSlot(
            this.supabaseService,
            "supabase",
            slot,
            iterationResults,
          ),
        ]);
      }
    }

    return iterationResults;
  }

  pause(): void {
    if (this.state === "running") {
      this.setState("paused");
    }
  }

  resume(): void {
    if (this.state === "paused") {
      this.setState("running");
      this.pauseResolve?.();
      this.pauseResolve = null;
    }
  }

  stop(): void {
    this.abortController?.abort();
    this.setState("idle");
    this.pauseResolve?.();
    this.pauseResolve = null;
  }

  reset(): void {
    this.stop();
    this.spacetimeResults = [];
    this.supabaseResults = [];
    this.spacetimeGear = {};
    this.supabaseGear = {};
    this.currentIteration = 0;
    this.startedAt = null;
  }
}
