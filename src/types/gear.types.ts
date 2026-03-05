import { z } from "zod";
import {
  GearSlotSchema,
  GearItemSchema,
  EquippedGearSchema,
  AvatarConfigSchema,
} from "../schemas/gear.schema";

export type GearSlot = z.infer<typeof GearSlotSchema>;
export type GearItem = z.infer<typeof GearItemSchema>;
export type EquippedGear = z.infer<typeof EquippedGearSchema>;
export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;
