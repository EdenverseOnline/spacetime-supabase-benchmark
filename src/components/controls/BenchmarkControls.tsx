import type {
  BenchmarkConfig,
  BenchmarkState,
} from "../../types/benchmark.types";
import { ProgressRing } from "../common/ProgressRing";
import { formatDuration } from "../../utils/formatters";

interface BenchmarkControlsProps {
  state: BenchmarkState;
  config: BenchmarkConfig;
  currentIteration: number;
  totalIterations: number;
  elapsedMs: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onConfigChange: (config: Partial<BenchmarkConfig>) => void;
}

export function BenchmarkControls({
  state,
  config,
  currentIteration,
  totalIterations,
  elapsedMs,
  onStart,
  onStop,
  onPause,
  onResume,
  onReset,
  onConfigChange,
}: BenchmarkControlsProps) {
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isIdle = state === "idle";
  const isCompleted = state === "completed";

  return (
    <section
      className="benchmark-controls"
      aria-label="Benchmark Controls"
      role="toolbar"
    >
      <div className="benchmark-controls__config">
        <div className="benchmark-controls__field">
          <label
            htmlFor="iterations-input"
            className="benchmark-controls__label"
          >
            Iterations
          </label>
          <input
            id="iterations-input"
            type="number"
            className="benchmark-controls__input"
            value={config.iterations}
            onChange={(e) =>
              onConfigChange({
                iterations: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            min={1}
            max={1000}
            disabled={isRunning || isPaused}
            aria-describedby="iterations-desc"
          />
          <span id="iterations-desc" className="sr-only">
            Number of benchmark iterations to run
          </span>
        </div>

        <div className="benchmark-controls__field">
          <label htmlFor="delay-input" className="benchmark-controls__label">
            Delay (ms)
          </label>
          <input
            id="delay-input"
            type="number"
            className="benchmark-controls__input"
            value={config.delayBetweenOpsMs}
            onChange={(e) =>
              onConfigChange({
                delayBetweenOpsMs: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            min={0}
            max={5000}
            step={50}
            disabled={isRunning || isPaused}
            aria-describedby="delay-desc"
          />
          <span id="delay-desc" className="sr-only">
            Delay in milliseconds between operations
          </span>
        </div>

        <div className="benchmark-controls__field">
          <label className="benchmark-controls__toggle-label">
            <input
              type="checkbox"
              className="benchmark-controls__checkbox"
              checked={config.parallelCategories}
              onChange={(e) =>
                onConfigChange({ parallelCategories: e.target.checked })
              }
              disabled={isRunning || isPaused}
            />
            <span className="benchmark-controls__toggle-text">
              Parallel Categories
            </span>
          </label>
        </div>
      </div>

      <div className="benchmark-controls__actions">
        {(isIdle || isCompleted) && (
          <button
            className="benchmark-controls__btn benchmark-controls__btn--start"
            onClick={onStart}
            aria-label="Start benchmark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start
          </button>
        )}

        {isRunning && (
          <button
            className="benchmark-controls__btn benchmark-controls__btn--pause"
            onClick={onPause}
            aria-label="Pause benchmark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            Pause
          </button>
        )}

        {isPaused && (
          <button
            className="benchmark-controls__btn benchmark-controls__btn--resume"
            onClick={onResume}
            aria-label="Resume benchmark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Resume
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            className="benchmark-controls__btn benchmark-controls__btn--stop"
            onClick={onStop}
            aria-label="Stop benchmark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            Stop
          </button>
        )}

        {(isCompleted || (!isIdle && !isRunning && !isPaused)) && (
          <button
            className="benchmark-controls__btn benchmark-controls__btn--reset"
            onClick={onReset}
            aria-label="Reset benchmark"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Reset
          </button>
        )}
      </div>

      <div
        className="benchmark-controls__status"
        role="status"
        aria-live="polite"
      >
        <ProgressRing
          value={currentIteration}
          max={totalIterations}
          size={48}
          strokeWidth={3}
          label={`Benchmark progress: ${currentIteration} of ${totalIterations} iterations`}
        />
        <div className="benchmark-controls__status-text">
          <span className="benchmark-controls__iteration">
            {currentIteration} / {totalIterations}
          </span>
          <span className="benchmark-controls__elapsed">
            {formatDuration(elapsedMs)}
          </span>
        </div>
      </div>
    </section>
  );
}
