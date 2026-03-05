import type { BackendType } from "../../types/benchmark.types";

interface StatusBadgeProps {
  backend: BackendType;
  connected: boolean;
}

export function StatusBadge({ backend, connected }: StatusBadgeProps) {
  const label = backend === "spacetimedb" ? "SpacetimeDB" : "Supabase";
  const colorClass =
    backend === "spacetimedb"
      ? "status-badge--spacetime"
      : "status-badge--supabase";

  return (
    <span
      className={`status-badge ${colorClass} ${connected ? "status-badge--connected" : "status-badge--disconnected"}`}
      role="status"
      aria-label={`${label} ${connected ? "connected" : "disconnected"}`}
    >
      <span className="status-badge__dot" aria-hidden="true" />
      <span className="status-badge__label">{label}</span>
    </span>
  );
}
