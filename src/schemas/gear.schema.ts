import { z } from "zod";

export const GEAR_SLOTS = [
  "hat",
  "hood",
  "shirt",
  "robe",
  "pants",
  "gloves",
  "shoes",
] as const;

export const GearSlotSchema = z.enum(GEAR_SLOTS);

export const GearItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slot: GearSlotSchema,
  iconPath: z.string(),
});

export const EquippedGearSchema = z.object({
  hat: GearItemSchema.nullable().optional(),
  hood: GearItemSchema.nullable().optional(),
  shirt: GearItemSchema.nullable().optional(),
  robe: GearItemSchema.nullable().optional(),
  pants: GearItemSchema.nullable().optional(),
  gloves: GearItemSchema.nullable().optional(),
  shoes: GearItemSchema.nullable().optional(),
});

export const AvatarConfigSchema = z.object({
  walletAddress: z.string().min(1),
  equippedGear: EquippedGearSchema,
  updatedAt: z.number(),
});
