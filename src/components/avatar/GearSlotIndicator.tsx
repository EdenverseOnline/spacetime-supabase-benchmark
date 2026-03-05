import type { GearSlot, GearItem } from "../../types/gear.types";
import {
  GiCrown,
  GiHood,
  GiShirt,
  GiRobe,
  GiTrousers,
  GiGloves,
  GiBoots,
} from "react-icons/gi";
import type { IconType } from "react-icons";

interface GearSlotIndicatorProps {
  slot: GearSlot;
  item: GearItem | null | undefined;
  accentClass: string;
}

const SLOT_ICONS: Record<GearSlot, IconType> = {
  hat: GiCrown,
  hood: GiHood,
  shirt: GiShirt,
  robe: GiRobe,
  pants: GiTrousers,
  gloves: GiGloves,
  shoes: GiBoots,
};

const SLOT_LABELS: Record<GearSlot, string> = {
  hat: "Hat",
  hood: "Hood",
  shirt: "Shirt",
  robe: "Robe",
  pants: "Pants",
  gloves: "Gloves",
  shoes: "Shoes",
};

export function GearSlotIndicator({
  slot,
  item,
  accentClass,
}: GearSlotIndicatorProps) {
  const isEquipped = !!item;
  const Icon = SLOT_ICONS[slot];

  return (
    <div
      className={`gear-slot ${accentClass} ${isEquipped ? "gear-slot--equipped" : "gear-slot--empty"}`}
      aria-label={`${SLOT_LABELS[slot]}: ${item?.name ?? "Empty"}`}
    >
      <span className="gear-slot__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="gear-slot__label">{SLOT_LABELS[slot]}</span>
      <span className="gear-slot__value">{item?.name ?? "—"}</span>
    </div>
  );
}
