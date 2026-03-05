import { z } from "zod";

export const OperationTypeSchema = z.enum([
  "equip",
  "unequip",
  "read",
  "update",
]);

export const OperationResultSchema = z.object({
  id: z.string(),
  type: OperationTypeSchema,
  slot: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  rttMs: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
  backend: z.enum(["spacetimedb", "supabase"]),
});

export const BenchmarkConfigSchema = z.object({
  iterations: z.number().int().min(1).max(1000).default(50),
  parallelCategories: z.boolean().default(true),
  delayBetweenOpsMs: z.number().min(0).max(5000).default(100),
});

export const AggregateMetricsSchema = z.object({
  avgRtt: z.number(),
  medianRtt: z.number(),
  p95Rtt: z.number(),
  p99Rtt: z.number(),
  minRtt: z.number(),
  maxRtt: z.number(),
  totalOps: z.number(),
  successfulOps: z.number(),
  failedOps: z.number(),
  successRate: z.number(),
  opsPerSecond: z.number(),
  totalDurationMs: z.number(),
});

export const BenchmarkStateSchema = z.enum([
  "idle",
  "running",
  "paused",
  "completed",
  "error",
]);
