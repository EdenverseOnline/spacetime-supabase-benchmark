use spacetimedb::{
    CaseConversionPolicy, ReducerContext, SpacetimeType, Table, Timestamp, reducer, table,
};

#[spacetimedb::settings]
const CASE_CONVERSION_POLICY: CaseConversionPolicy = CaseConversionPolicy::None;

#[derive(SpacetimeType, Clone, Debug)]
pub enum GearCategory {
    Hat,
    Hood,
    Shirt,
    Robe,
    Pants,
    Gloves,
    Shoes,
}

#[table(accessor = benchmark_gear_def, public)]
pub struct BenchmarkGearDef {
    #[primary_key]
    pub id: String,
    pub name: String,
    pub category: GearCategory,
    pub icon_path: String,
    pub sort_order: i32,
    pub active: bool,
}

#[table(accessor = benchmark_avatar_config, public)]
pub struct BenchmarkAvatarConfig {
    #[primary_key]
    pub wallet_address: String,
    pub hat: Option<String>,
    pub hood: Option<String>,
    pub shirt: Option<String>,
    pub robe: Option<String>,
    pub pants: Option<String>,
    pub gloves: Option<String>,
    pub shoes: Option<String>,
    pub updated_at: Timestamp,
}

fn set_gear_slot(
    config: &mut BenchmarkAvatarConfig,
    category: &GearCategory,
    gear_id: Option<String>,
) {
    match category {
        GearCategory::Hat => config.hat = gear_id,
        GearCategory::Hood => config.hood = gear_id,
        GearCategory::Shirt => config.shirt = gear_id,
        GearCategory::Robe => config.robe = gear_id,
        GearCategory::Pants => config.pants = gear_id,
        GearCategory::Gloves => config.gloves = gear_id,
        GearCategory::Shoes => config.shoes = gear_id,
    }
}

#[reducer]
pub fn update_benchmark_avatar_gear(
    ctx: &ReducerContext,
    wallet_address: String,
    category: GearCategory,
    gear_id: Option<String>,
) {
    let now = ctx.timestamp;

    if let Some(existing) = ctx
        .db
        .benchmark_avatar_config()
        .wallet_address()
        .find(&wallet_address)
    {
        let mut updated = BenchmarkAvatarConfig {
            wallet_address: existing.wallet_address.clone(),
            hat: existing.hat.clone(),
            hood: existing.hood.clone(),
            shirt: existing.shirt.clone(),
            robe: existing.robe.clone(),
            pants: existing.pants.clone(),
            gloves: existing.gloves.clone(),
            shoes: existing.shoes.clone(),
            updated_at: now,
        };

        set_gear_slot(&mut updated, &category, gear_id);

        ctx.db
            .benchmark_avatar_config()
            .wallet_address()
            .update(updated);
    } else {
        let mut config = BenchmarkAvatarConfig {
            wallet_address,
            hat: None,
            hood: None,
            shirt: None,
            robe: None,
            pants: None,
            gloves: None,
            shoes: None,
            updated_at: now,
        };

        set_gear_slot(&mut config, &category, gear_id);

        ctx.db.benchmark_avatar_config().insert(config);
    }
}

#[reducer]
pub fn seed_benchmark_gear_defs(ctx: &ReducerContext) {
    let gear_defs: Vec<(&str, &str, GearCategory, &str, i32)> = vec![
        (
            "hat_iron",
            "Iron Helm",
            GearCategory::Hat,
            "/gear/hat_iron.png",
            1,
        ),
        (
            "hat_gold",
            "Golden Crown",
            GearCategory::Hat,
            "/gear/hat_gold.png",
            2,
        ),
        (
            "hood_leather",
            "Leather Hood",
            GearCategory::Hood,
            "/gear/hood_leather.png",
            1,
        ),
        (
            "hood_shadow",
            "Shadow Cowl",
            GearCategory::Hood,
            "/gear/hood_shadow.png",
            2,
        ),
        (
            "shirt_chainmail",
            "Chainmail",
            GearCategory::Shirt,
            "/gear/shirt_chain.png",
            1,
        ),
        (
            "shirt_plate",
            "Plate Armor",
            GearCategory::Shirt,
            "/gear/shirt_plate.png",
            2,
        ),
        (
            "robe_mage",
            "Mage Robe",
            GearCategory::Robe,
            "/gear/robe_mage.png",
            1,
        ),
        (
            "robe_sage",
            "Sage Vestment",
            GearCategory::Robe,
            "/gear/robe_sage.png",
            2,
        ),
        (
            "pants_leather",
            "Leather Greaves",
            GearCategory::Pants,
            "/gear/pants_leather.png",
            1,
        ),
        (
            "pants_iron",
            "Iron Legguards",
            GearCategory::Pants,
            "/gear/pants_iron.png",
            2,
        ),
        (
            "gloves_hide",
            "Hide Gloves",
            GearCategory::Gloves,
            "/gear/gloves_hide.png",
            1,
        ),
        (
            "gloves_dragon",
            "Dragonscale Gauntlets",
            GearCategory::Gloves,
            "/gear/gloves_dragon.png",
            2,
        ),
        (
            "shoes_boot",
            "Traveler Boots",
            GearCategory::Shoes,
            "/gear/shoes_boot.png",
            1,
        ),
        (
            "shoes_winged",
            "Winged Sandals",
            GearCategory::Shoes,
            "/gear/shoes_winged.png",
            2,
        ),
    ];

    for (id, name, category, icon_path, sort_order) in gear_defs {
        if ctx
            .db
            .benchmark_gear_def()
            .id()
            .find(id.to_string())
            .is_none()
        {
            ctx.db.benchmark_gear_def().insert(BenchmarkGearDef {
                id: id.to_string(),
                name: name.to_string(),
                category,
                icon_path: icon_path.to_string(),
                sort_order,
                active: true,
            });
        }
    }
}

#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) {
    log::info!("Benchmark client connected: {:?}", ctx.sender());
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    log::info!("Benchmark client disconnected: {:?}", ctx.sender());
}
