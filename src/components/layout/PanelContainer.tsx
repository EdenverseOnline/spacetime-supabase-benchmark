import type { ReactNode } from "react";
import type { BackendType } from "../../types/benchmark.types";

interface PanelContainerProps {
  backend: BackendType;
  children: ReactNode;
}

export function PanelContainer({ backend, children }: PanelContainerProps) {
  const panelClass =
    backend === "spacetimedb"
      ? "panel-container--spacetime"
      : "panel-container--supabase";

  return <div className={`panel-container ${panelClass}`}>{children}</div>;
}
