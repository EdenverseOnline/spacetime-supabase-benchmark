import type { GearSlot } from "../types/gear.types";

export type GearCategory = GearSlot;

const GEAR_FILE_NAMES: Record<string, string> = {
  cshat: "CShat.png",
  cglasses: "Cglasses.png",
  dkhelm: "DKhelm.png",
  gkhelm: "GKhelm.png",
  hat1: "Hat1.png",
  hat2: "Hat2.png",
  kfhat: "KFhat.png",
  khelm: "Khelm.png",
  plhelm: "PLhelm.png",
  svhat: "SVhat.png",
  vhelm: "Vhelm.png",
  what: "What.png",
  ashood: "AShood.png",
  cshood: "CShood.png",
  ehood: "Ehood.png",
  fhood: "Fhood.png",
  hchood: "HChood.png",
  hood: "Hood.png",
  mysthood: "MystHood.png",
  rrhood: "RRhood.png",
  tmhood: "TMhood.png",
  asshirt: "ASshirt.png",
  csshirt: "CSshirt.png",
  cclothes: "Cshirt.png",
  dkshirt: "DKshirt.png",
  fshirt: "Fshirt.png",
  gkshirt: "GKshirt.png",
  hcshirt: "HCshirt.png",
  kfshirt: "KFshirt.png",
  kshirt: "Kshirt.png",
  mystshirt: "MystShirt.png",
  plshirt: "PLshirt.png",
  svshirt: "SVshirt.png",
  shirt1: "Shirt1.png",
  shirt2: "Shirt2.png",
  tmshirt: "TMshirt.png",
  vshirt: "Vshirt.png",
  erobe: "Erobe.png",
  rrrobe: "RRrobe.png",
  wrobe: "Wrobe.png",
  aspants: "ASpants.png",
  cspants: "CSpants.png",
  cpants: "Cpants.png",
  dkpants: "DKpants.png",
  fpants: "Fpants.png",
  gkpants: "GKpants.png",
  hcpants: "HCpants.png",
  kfpants: "KFpants.png",
  kpants: "Kpants.png",
  plpants: "PLpants.png",
  svpants: "SVpants.png",
  tmpants: "TMpants.png",
  vpants: "Vpants.png",
  egloves: "Egloves.png",
  mystgloves: "MystGloves.png",
  tmgloves: "TMgloves.png",
  kfshoes: "KFshoes.png",
  mystboots: "MystBoots.png",
  rrshoes: "RRshoes.png",
};

const CATEGORY_FOLDER_MAP: Record<GearCategory, string> = {
  hat: "Hat",
  hood: "Hood",
  shirt: "Shirt",
  robe: "Robe",
  pants: "Pants",
  gloves: "Gloves",
  shoes: "Shoes",
};

export const LAYER_ORDER: GearCategory[] = [
  "shoes",
  "pants",
  "shirt",
  "robe",
  "gloves",
  "hood",
  "hat",
];

export const FRAME_COUNTS: Record<string, number> = {
  idle: 4,
  walk: 6,
  attack: 8,
};

export const FRAME_RATES: Record<string, number> = {
  idle: 3,
  walk: 8,
  attack: 6,
};

export const SPRITE_SIZE = 64;

export function getBaseSpritePath(): string {
  return "/gears/Idle/Front/Base.png";
}

export function getGearSpritePath(
  gearId: string,
  category: GearCategory,
): string {
  const catFolder = CATEGORY_FOLDER_MAP[category];
  const fileName = GEAR_FILE_NAMES[gearId] || `${gearId}.png`;
  return `/gears/Idle/Front/${catFolder}/${fileName}`;
}

export function getGearIconPath(
  gearId: string,
  category: GearCategory,
): string {
  return getGearSpritePath(gearId, category);
}

export interface AvatarGearItem {
  id: string;
  name: string;
  category: GearCategory;
  iconPath: string;
}

export const AVATAR_GEAR_ITEMS: AvatarGearItem[] = [
  {
    id: "cshat",
    name: "Black Skullcap",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/CShat.png",
  },
  {
    id: "cglasses",
    name: "Glasses",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/Cglasses.png",
  },
  {
    id: "dkhelm",
    name: "Dragoon's Helm",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/DKhelm.png",
  },
  {
    id: "gkhelm",
    name: "Pebblestone Cap",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/GKhelm.png",
  },
  {
    id: "hat1",
    name: "Miner's Cap",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/Hat1.png",
  },
  {
    id: "hat2",
    name: "Pickpocket's Hat",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/Hat2.png",
  },
  {
    id: "kfhat",
    name: "Explorer's Cap",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/KFhat.png",
  },
  {
    id: "khelm",
    name: "Darkmetal Crown",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/Khelm.png",
  },
  {
    id: "plhelm",
    name: "Mask of the Scarab",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/PLhelm.png",
  },
  {
    id: "svhat",
    name: "Caliphate's Cap",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/SVhat.png",
  },
  {
    id: "vhelm",
    name: "Rockglass Helmet",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/Vhelm.png",
  },
  {
    id: "what",
    name: "Wizard's Hat",
    category: "hat",
    iconPath: "/gears/Idle/Front/Hat/What.png",
  },
  {
    id: "ashood",
    name: "Assassin's Cowl",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/AShood.png",
  },
  {
    id: "cshood",
    name: "Cotton Scarf",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/CShood.png",
  },
  {
    id: "ehood",
    name: "Necrocowl",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/Ehood.png",
  },
  {
    id: "fhood",
    name: "Sunseeker Cowl",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/Fhood.png",
  },
  {
    id: "hchood",
    name: "Trainer's Hood",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/HChood.png",
  },
  {
    id: "hood",
    name: "Skycowl",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/Hood.png",
  },
  {
    id: "mysthood",
    name: "Mystic's Hood",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/MystHood.png",
  },
  {
    id: "rrhood",
    name: "Crimson Cowl",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/RRhood.png",
  },
  {
    id: "tmhood",
    name: "Holyshroud",
    category: "hood",
    iconPath: "/gears/Idle/Front/Hood/TMhood.png",
  },
  {
    id: "asshirt",
    name: "Guild Jacket",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/ASshirt.png",
  },
  {
    id: "csshirt",
    name: "Suncloak",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/CSshirt.png",
  },
  {
    id: "cclothes",
    name: "Vampiric Cloak",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/Cshirt.png",
  },
  {
    id: "kfshirt",
    name: "Monk Gi",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/KFshirt.png",
  },
  {
    id: "mystshirt",
    name: "Mystic Tunic",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/MystShirt.png",
  },
  {
    id: "shirt1",
    name: "Azure Top",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/Shirt1.png",
  },
  {
    id: "shirt2",
    name: "Vagabond's Shirt",
    category: "shirt",
    iconPath: "/gears/Idle/Front/Shirt/Shirt2.png",
  },
  {
    id: "erobe",
    name: "Necrobe",
    category: "robe",
    iconPath: "/gears/Idle/Front/Robe/Erobe.png",
  },
  {
    id: "rrrobe",
    name: "Royal Robe",
    category: "robe",
    iconPath: "/gears/Idle/Front/Robe/RRrobe.png",
  },
  {
    id: "wrobe",
    name: "Silk Robe",
    category: "robe",
    iconPath: "/gears/Idle/Front/Robe/Wrobe.png",
  },
  {
    id: "hcpants",
    name: "Shinobi Leggings",
    category: "pants",
    iconPath: "/gears/Idle/Front/Pants/HCpants.png",
  },
  {
    id: "kfpants",
    name: "Monk Pants",
    category: "pants",
    iconPath: "/gears/Idle/Front/Pants/KFpants.png",
  },
  {
    id: "plpants",
    name: "Woodsman's Pants",
    category: "pants",
    iconPath: "/gears/Idle/Front/Pants/PLpants.png",
  },
  {
    id: "vpants",
    name: "Adventurer's Longjohns",
    category: "pants",
    iconPath: "/gears/Idle/Front/Pants/Vpants.png",
  },
  {
    id: "egloves",
    name: "Shadefire Gauntlets",
    category: "gloves",
    iconPath: "/gears/Idle/Front/Gloves/Egloves.png",
  },
  {
    id: "mystgloves",
    name: "Mystic Gloves",
    category: "gloves",
    iconPath: "/gears/Idle/Front/Gloves/MystGloves.png",
  },
  {
    id: "tmgloves",
    name: "Haloguard Gauntlets",
    category: "gloves",
    iconPath: "/gears/Idle/Front/Gloves/TMgloves.png",
  },
  {
    id: "kfshoes",
    name: "Shinobi Shoes",
    category: "shoes",
    iconPath: "/gears/Idle/Front/Shoes/KFshoes.png",
  },
  {
    id: "mystboots",
    name: "Mystic Boots",
    category: "shoes",
    iconPath: "/gears/Idle/Front/Shoes/MystBoots.png",
  },
  {
    id: "rrshoes",
    name: "Drakken Boots",
    category: "shoes",
    iconPath: "/gears/Idle/Front/Shoes/RRshoes.png",
  },
];

export function getGearItemsByCategory(
  category: GearCategory,
): AvatarGearItem[] {
  return AVATAR_GEAR_ITEMS.filter((item) => item.category === category);
}

export function getRandomGearItemForSlot(slot: GearCategory): AvatarGearItem {
  const items = getGearItemsByCategory(slot);
  if (items.length === 0) {
    return { id: slot, name: slot, category: slot, iconPath: "" };
  }
  return items[Math.floor(Math.random() * items.length)];
}
