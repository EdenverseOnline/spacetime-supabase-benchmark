import { useRef, useEffect, useCallback, useMemo } from "react";
import type { EquippedGear } from "../../types/gear.types";
import type {
  AggregateMetrics,
  BackendType,
} from "../../types/benchmark.types";
import { GEAR_SLOTS } from "../../schemas/gear.schema";
import { GearSlotIndicator } from "./GearSlotIndicator";
import { formatMs, formatOpsPerSecond } from "../../utils/formatters";
import {
  getBaseSpritePath,
  getGearSpritePath,
  LAYER_ORDER,
  FRAME_COUNTS,
  FRAME_RATES,
  SPRITE_SIZE,
  type GearCategory,
} from "../../constants/avatarConstants";
import {
  GiStopwatch,
  GiSpeedometer,
  GiCheckMark,
  GiStack,
} from "react-icons/gi";

interface AvatarPreviewCardProps {
  backend: BackendType;
  gear: EquippedGear;
  metrics: AggregateMetrics;
  isActive: boolean;
}

interface LoadedImage {
  path: string;
  img: HTMLImageElement;
  loaded: boolean;
}

const CANVAS_SIZE = 192;

export function AvatarPreviewCard({
  backend,
  gear,
  metrics,
  isActive,
}: AvatarPreviewCardProps) {
  const isSpacetime = backend === "spacetimedb";
  const title = isSpacetime ? "SpacetimeDB" : "Supabase (PostgreSQL)";
  const subtitle = isSpacetime
    ? "WebSocket · WASM · Real-time Subscriptions"
    : "REST API · PostgreSQL · Request/Response";
  const accentClass = isSpacetime ? "accent--spacetime" : "accent--supabase";
  const cardClass = isSpacetime
    ? "avatar-card--spacetime"
    : "avatar-card--supabase";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const imagesRef = useRef<Map<string, LoadedImage>>(new Map());
  const animationRef = useRef<number | null>(null);

  const equippedGearRecord = useMemo(() => {
    const record: Record<GearCategory, string | null> = {
      hat: null,
      hood: null,
      shirt: null,
      robe: null,
      pants: null,
      gloves: null,
      shoes: null,
    };
    for (const slot of GEAR_SLOTS) {
      const item = gear[slot as keyof EquippedGear];
      record[slot as GearCategory] = item?.id ?? null;
    }
    return record;
  }, [gear]);

  const spritePaths = useMemo(() => {
    const paths: { path: string; zIndex: number }[] = [];
    paths.push({ path: getBaseSpritePath(), zIndex: 0 });

    LAYER_ORDER.forEach((category, index) => {
      const gearId = equippedGearRecord[category];
      if (gearId) {
        paths.push({
          path: getGearSpritePath(gearId, category),
          zIndex: index + 1,
        });
      }
    });

    return paths.sort((a, b) => a.zIndex - b.zIndex);
  }, [equippedGearRecord]);

  const loadImage = useCallback((path: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const existing = imagesRef.current.get(path);
      if (existing?.loaded) {
        resolve(existing.img);
        return;
      }
      const img = new Image();
      img.onload = () => {
        imagesRef.current.set(path, { path, img, loaded: true });
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${path}`));
      img.src = path;
    });
  }, []);

  useEffect(() => {
    frameRef.current = 0;
    lastFrameTimeRef.current = 0;

    const renderFrame = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frameCount = FRAME_COUNTS["idle"];
      const frameRate = FRAME_RATES["idle"];
      const frameInterval = 1000 / frameRate;

      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        frameRef.current = (frameRef.current + 1) % frameCount;
        lastFrameTimeRef.current = timestamp;
      }

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.imageSmoothingEnabled = false;

      spritePaths.forEach(({ path }) => {
        const imageData = imagesRef.current.get(path);
        if (imageData?.loaded && imageData.img.complete) {
          const frameX = frameRef.current * SPRITE_SIZE;
          ctx.drawImage(
            imageData.img,
            frameX,
            0,
            SPRITE_SIZE,
            SPRITE_SIZE,
            0,
            0,
            CANVAS_SIZE,
            CANVAS_SIZE,
          );
        }
      });

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    Promise.all(
      spritePaths.map(({ path }) => loadImage(path).catch(() => null)),
    ).then(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(renderFrame);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spritePaths, loadImage]);

  return (
    <article
      className={`avatar-card ${cardClass} ${isActive ? "avatar-card--active" : ""}`}
      aria-label={`${title} avatar preview`}
    >
      <header className="avatar-card__header">
        <div className="avatar-card__title-group">
          <h2 className="avatar-card__title">{title}</h2>
          <p className="avatar-card__subtitle">{subtitle}</p>
        </div>
        <div
          className={`avatar-card__indicator ${accentClass}`}
          aria-hidden="true"
        >
          {isActive && <span className="avatar-card__pulse" />}
        </div>
      </header>

      <div className="avatar-card__preview">
        <div className="avatar-card__canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="avatar-card__canvas"
            role="img"
            aria-label={`${title} animated character preview`}
          />
        </div>
      </div>

      <div
        className="avatar-card__gear-grid"
        role="list"
        aria-label="Equipped gear"
      >
        {GEAR_SLOTS.map((slot) => (
          <div role="listitem" key={slot}>
            <GearSlotIndicator
              slot={slot}
              item={gear[slot as keyof EquippedGear]}
              accentClass={accentClass}
            />
          </div>
        ))}
      </div>

      <footer className="avatar-card__stats">
        <div className="avatar-card__stat">
          <span className="avatar-card__stat-label">
            <GiStopwatch aria-hidden="true" /> Avg RTT
          </span>
          <span className={`avatar-card__stat-value ${accentClass}`}>
            {formatMs(metrics.avgRtt)}
          </span>
        </div>
        <div className="avatar-card__stat">
          <span className="avatar-card__stat-label">
            <GiSpeedometer aria-hidden="true" /> Ops/s
          </span>
          <span className={`avatar-card__stat-value ${accentClass}`}>
            {formatOpsPerSecond(metrics.opsPerSecond)}
          </span>
        </div>
        <div className="avatar-card__stat">
          <span className="avatar-card__stat-label">
            <GiStack aria-hidden="true" /> Total
          </span>
          <span className={`avatar-card__stat-value ${accentClass}`}>
            {metrics.totalOps}
          </span>
        </div>
        <div className="avatar-card__stat">
          <span className="avatar-card__stat-label">
            <GiCheckMark aria-hidden="true" /> Success
          </span>
          <span className={`avatar-card__stat-value ${accentClass}`}>
            {metrics.totalOps > 0
              ? `${(metrics.successRate * 100).toFixed(0)}%`
              : "—"}
          </span>
        </div>
      </footer>
    </article>
  );
}
