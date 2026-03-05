export function preciseNow(): number {
  return performance.now();
}

export function measureRtt(startTime: number): number {
  return performance.now() - startTime;
}

export function generateOperationId(): string {
  return `op_${crypto.randomUUID()}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computePercentile(
  sortedValues: number[],
  percentile: number,
): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}
