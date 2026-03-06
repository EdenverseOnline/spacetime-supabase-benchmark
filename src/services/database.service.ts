import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  DatabaseService,
  OperationResult,
  OperationType,
  BackendType,
} from "../types/benchmark.types";
import type { GearSlot, GearItem, EquippedGear } from "../types/gear.types";
import { preciseNow, measureRtt, generateOperationId } from "../utils/timing";
import { DbConnection, tables } from "../module_bindings";
import { GearCategory } from "../module_bindings/types";
import {
  getRandomGearItemForSlot,
  type AvatarGearItem,
} from "../constants/avatarConstants";
import { GEAR_SLOTS } from "../schemas/gear.schema";

const BENCHMARK_WALLET = "benchmark_test_wallet_001";
const SPACETIME_WRITE_TIMEOUT_MS = 5000;

function avatarGearToGearItem(ag: AvatarGearItem): GearItem {
  return {
    id: ag.id,
    name: ag.name,
    slot: ag.category,
    iconPath: ag.iconPath,
  };
}

export function getRandomGearForSlot(slot: GearSlot): GearItem {
  return avatarGearToGearItem(getRandomGearItemForSlot(slot));
}

function fieldToGearItem(
  value: string | null | undefined,
  slot: GearSlot,
): GearItem | null {
  if (!value) return null;
  return { id: value, name: value, slot, iconPath: "" };
}

function mapRowToEquippedGear(row: {
  hat?: string | null;
  hood?: string | null;
  shirt?: string | null;
  robe?: string | null;
  pants?: string | null;
  gloves?: string | null;
  shoes?: string | null;
}): EquippedGear {
  const gear: EquippedGear = {};
  for (const slot of GEAR_SLOTS) {
    const value = row[slot as keyof typeof row];
    gear[slot] = fieldToGearItem(value ?? null, slot);
  }
  return gear;
}

const GEAR_SLOT_TO_CATEGORY: Record<GearSlot, GearCategory> = {
  hat: { tag: "Hat" },
  hood: { tag: "Hood" },
  shirt: { tag: "Shirt" },
  robe: { tag: "Robe" },
  pants: { tag: "Pants" },
  gloves: { tag: "Gloves" },
  shoes: { tag: "Shoes" },
};

export class SpacetimeService implements DatabaseService {
  readonly backendType: BackendType = "spacetimedb";
  private connection: DbConnection | null = null;
  private _connected = false;
  private currentGear: EquippedGear = {};
  private pendingWriteResolvers: Array<() => void> = [];

  async connect(): Promise<void> {
    const uri = import.meta.env.VITE_SPACETIME_URI || "ws://localhost:3000";
    const moduleName = import.meta.env.VITE_SPACETIME_MODULE || "server-bench";

    return new Promise<void>((resolve, reject) => {
      try {
        const conn = DbConnection.builder()
          .withUri(uri)
          .withDatabaseName(moduleName)
          .withToken(localStorage.getItem("benchmark_auth_token") || "")
          .onConnect(() => {
            this._connected = true;
            this.connection = conn;

            conn.db.benchmark_avatar_config.onInsert(() => {
              this.flushPendingWriteResolvers();
            });

            conn.db.benchmark_avatar_config.onUpdate(() => {
              this.flushPendingWriteResolvers();
            });

            conn
              .subscriptionBuilder()
              .onApplied(() => {
                resolve();
              })
              .onError((err: unknown) => {
                console.error("[SpacetimeDB] Subscription error:", err);
              })
              .subscribe([tables.benchmark_avatar_config]);
          })
          .onDisconnect(() => {
            this._connected = false;
            this.connection = null;
          })
          .onConnectError((err: unknown) => {
            this._connected = false;
            reject(new Error(`SpacetimeDB connection failed: ${err}`));
          })
          .build();
      } catch (error) {
        reject(error);
      }
    });
  }

  private flushPendingWriteResolvers(): void {
    const resolvers = [...this.pendingWriteResolvers];
    this.pendingWriteResolvers = [];
    resolvers.forEach((r) => r());
  }

  private waitForTableUpdate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingWriteResolvers = this.pendingWriteResolvers.filter(
          (r) => r !== wrappedResolve,
        );
        reject(new Error("SpacetimeDB write timeout"));
      }, SPACETIME_WRITE_TIMEOUT_MS);

      const wrappedResolve = () => {
        clearTimeout(timer);
        resolve();
      };
      this.pendingWriteResolvers.push(wrappedResolve);
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
      this._connected = false;
    }
  }

  isConnected(): boolean {
    return this._connected && this.connection !== null;
  }

  async equipGear(slot: GearSlot, item: GearItem): Promise<OperationResult> {
    return this.writeGear(slot, item.id, "equip", item);
  }

  async updateGear(slot: GearSlot, item: GearItem): Promise<OperationResult> {
    return this.writeGear(slot, item.id, "update", item);
  }

  async unequipGear(slot: GearSlot): Promise<OperationResult> {
    return this.writeGear(slot, undefined, "unequip", null);
  }

  private async writeGear(
    slot: GearSlot,
    gearId: string | undefined,
    type: OperationType,
    item: GearItem | null,
  ): Promise<OperationResult> {
    const startTime = preciseNow();
    const id = generateOperationId();

    try {
      if (!this.connection) {
        throw new Error("SpacetimeDB not connected");
      }

      const updatePromise = this.waitForTableUpdate();

      this.connection.reducers.updateBenchmarkAvatarGear({
        walletAddress: BENCHMARK_WALLET,
        category: GEAR_SLOT_TO_CATEGORY[slot],
        gearId,
      });

      await updatePromise;

      const rttMs = measureRtt(startTime);
      this.currentGear = { ...this.currentGear, [slot]: item };

      return {
        id,
        type,
        slot,
        startTime,
        endTime: preciseNow(),
        rttMs,
        success: true,
        backend: "spacetimedb",
      };
    } catch (error) {
      return {
        id,
        type,
        slot,
        startTime,
        endTime: preciseNow(),
        rttMs: measureRtt(startTime),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        backend: "spacetimedb",
      };
    }
  }

  async readGear(): Promise<{
    result: EquippedGear;
    operation: OperationResult;
  }> {
    const startTime = preciseNow();
    const id = generateOperationId();

    if (this.connection) {
      const row = this.connection.db
        .benchmark_avatar_config
        .walletAddress
        .find(BENCHMARK_WALLET);
      if (row) {
        this.currentGear = mapRowToEquippedGear(row);
      }
    }

    return {
      result: { ...this.currentGear },
      operation: {
        id,
        type: "read",
        slot: "all",
        startTime,
        endTime: preciseNow(),
        rttMs: measureRtt(startTime),
        success: true,
        backend: "spacetimedb",
      },
    };
  }

  seedGearDefs(): void {
    if (this.connection) {
      this.connection.reducers.seedBenchmarkGearDefs({});
    }
  }

  getRandomGearItem(slot: GearSlot): GearItem {
    return getRandomGearForSlot(slot);
  }

  getCurrentGear(): EquippedGear {
    return { ...this.currentGear };
  }
}

export class SupabaseService implements DatabaseService {
  readonly backendType: BackendType = "supabase";
  private _connected = false;
  private currentGear: EquippedGear = {};
  private client: SupabaseClient | null = null;

  async connect(): Promise<void> {
    const url = import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

    this.client = createClient(url, key);

    try {
      await this.client
        .from("benchmark_avatar_config")
        .select("wallet_address")
        .limit(1);
      this._connected = true;
    } catch (err) {
      this._connected = false;
      throw new Error(`Failed to connect to Supabase: ${err}`);
    }
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this.client = null;
  }

  isConnected(): boolean {
    return this._connected && this.client !== null;
  }

  async equipGear(slot: GearSlot, item: GearItem): Promise<OperationResult> {
    return this.writeGear(slot, item.id, "equip", item);
  }

  async updateGear(slot: GearSlot, item: GearItem): Promise<OperationResult> {
    return this.writeGear(slot, item.id, "update", item);
  }

  async unequipGear(slot: GearSlot): Promise<OperationResult> {
    return this.writeGear(slot, null, "unequip", null);
  }

  private async writeGear(
    slot: GearSlot,
    gearId: string | null,
    type: OperationType,
    item: GearItem | null,
  ): Promise<OperationResult> {
    const startTime = preciseNow();
    const id = generateOperationId();

    try {
      if (!this.client) throw new Error("Supabase not connected");

      const { error } = await this.client
        .from("benchmark_avatar_config")
        .upsert(
          {
            wallet_address: BENCHMARK_WALLET,
            [slot]: gearId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "wallet_address" },
        );

      const rttMs = measureRtt(startTime);
      const success = !error;
      if (success) {
        this.currentGear = { ...this.currentGear, [slot]: item };
      }

      return {
        id,
        type,
        slot,
        startTime,
        endTime: preciseNow(),
        rttMs,
        success,
        error: error ? error.message : undefined,
        backend: "supabase",
      };
    } catch (error) {
      return {
        id,
        type,
        slot,
        startTime,
        endTime: preciseNow(),
        rttMs: measureRtt(startTime),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        backend: "supabase",
      };
    }
  }

  async readGear(): Promise<{
    result: EquippedGear;
    operation: OperationResult;
  }> {
    const startTime = preciseNow();
    const id = generateOperationId();

    try {
      if (this.client) {
        const { data, error } = await this.client
          .from("benchmark_avatar_config")
          .select("*")
          .eq("wallet_address", BENCHMARK_WALLET)
          .single();

        if (!error && data) {
          this.currentGear = mapRowToEquippedGear(data);
        }
      }
    } catch {
      // Ignore read failures
    }

    return {
      result: { ...this.currentGear },
      operation: {
        id,
        type: "read",
        slot: "all",
        startTime,
        endTime: preciseNow(),
        rttMs: measureRtt(startTime),
        success: true,
        backend: "supabase",
      },
    };
  }

  getRandomGearItem(slot: GearSlot): GearItem {
    return getRandomGearForSlot(slot);
  }

  getCurrentGear(): EquippedGear {
    return { ...this.currentGear };
  }
}
