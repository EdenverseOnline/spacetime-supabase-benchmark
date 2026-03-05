import { useRef, useEffect } from "react";
import type { OperationResult } from "../../types/benchmark.types";
import { formatMs } from "../../utils/formatters";

interface OperationLogProps {
  operations: OperationResult[];
  maxVisible?: number;
}

export function OperationLog({
  operations,
  maxVisible = 50,
}: OperationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [operations.length]);

  const visible = operations.slice(0, maxVisible);

  return (
    <div
      className="operation-log"
      role="log"
      aria-label="Live operation log"
      aria-live="polite"
    >
      <h3 className="operation-log__title">
        Live Operations
        <span className="operation-log__count">{operations.length}</span>
      </h3>
      <div className="operation-log__scroll" ref={scrollRef}>
        {visible.length === 0 && (
          <p className="operation-log__empty">
            No operations yet. Start the benchmark to begin.
          </p>
        )}
        {visible.map((op) => (
          <div
            key={op.id}
            className={`operation-log__entry ${
              op.backend === "spacetimedb"
                ? "operation-log__entry--spacetime"
                : "operation-log__entry--supabase"
            } ${op.success ? "" : "operation-log__entry--error"}`}
          >
            <span className="operation-log__backend">
              {op.backend === "spacetimedb" ? "ST" : "SB"}
            </span>
            <span className="operation-log__type">{op.type}</span>
            <span className="operation-log__slot">{op.slot}</span>
            <span className="operation-log__rtt">{formatMs(op.rttMs)}</span>
            {!op.success && (
              <span className="operation-log__error" title={op.error}>
                ✗
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
