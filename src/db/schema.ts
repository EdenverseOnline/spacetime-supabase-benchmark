import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const benchmarkAvatarConfig = pgTable("benchmark_avatar_config", {
  walletAddress: text("wallet_address").primaryKey(),
  hat: text("hat"),
  hood: text("hood"),
  shirt: text("shirt"),
  robe: text("robe"),
  pants: text("pants"),
  gloves: text("gloves"),
  shoes: text("shoes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type BenchmarkAvatarConfig = typeof benchmarkAvatarConfig.$inferSelect;
export type InsertBenchmarkAvatarConfig =
  typeof benchmarkAvatarConfig.$inferInsert;
