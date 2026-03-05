use spacetimedb::{ReducerContext, Table, Timestamp, reducer, table};

#[table(name = benchmark_gear_def, public)]
pub struct BenchmarkGearDef {
    #[primary_key]
    pub id: String,
    pub name: String,
    pub category: String,
    pub icon_path: String,
    pub sort_order: i32,
    pub active: bool,
}

#[table(name = benchmark_avatar_config, public)]
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

#[reducer]
pub fn update_benchmark_avatar_gear(
    ctx: &ReducerContext,
    wallet_address: String,
    category: String,
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

        match category.as_str() {
            "hat" => updated.hat = gear_id,
            "hood" => updated.hood = gear_id,
            "shirt" => updated.shirt = gear_id,
            "robe" => updated.robe = gear_id,
            "pants" => updated.pants = gear_id,
            "gloves" => updated.gloves = gear_id,
            "shoes" => updated.shoes = gear_id,
            _ => {
                log::warn!("Unknown gear category: {}", category);
                return;
            }
        }

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

        match category.as_str() {
            "hat" => config.hat = gear_id,
            "hood" => config.hood = gear_id,
            "shirt" => config.shirt = gear_id,
            "robe" => config.robe = gear_id,
            "pants" => config.pants = gear_id,
            "gloves" => config.gloves = gear_id,
            "shoes" => config.shoes = gear_id,
            _ => {
                log::warn!("Unknown gear category: {}", category);
                return;
            }
        }

        ctx.db.benchmark_avatar_config().insert(config);
    }
}

#[reducer]
pub fn seed_benchmark_gear_defs(ctx: &ReducerContext) {
    let gear_defs = vec![
        ("hat_iron", "Iron Helm", "hat", "/gear/hat_iron.png", 1),
        ("hat_gold", "Golden Crown", "hat", "/gear/hat_gold.png", 2),
        (
            "hood_leather",
            "Leather Hood",
            "hood",
            "/gear/hood_leather.png",
            1,
        ),
        (
            "hood_shadow",
            "Shadow Cowl",
            "hood",
            "/gear/hood_shadow.png",
            2,
        ),
        (
            "shirt_chainmail",
            "Chainmail",
            "shirt",
            "/gear/shirt_chain.png",
            1,
        ),
        (
            "shirt_plate",
            "Plate Armor",
            "shirt",
            "/gear/shirt_plate.png",
            2,
        ),
        ("robe_mage", "Mage Robe", "robe", "/gear/robe_mage.png", 1),
        (
            "robe_sage",
            "Sage Vestment",
            "robe",
            "/gear/robe_sage.png",
            2,
        ),
        (
            "pants_leather",
            "Leather Greaves",
            "pants",
            "/gear/pants_leather.png",
            1,
        ),
        (
            "pants_iron",
            "Iron Legguards",
            "pants",
            "/gear/pants_iron.png",
            2,
        ),
        (
            "gloves_hide",
            "Hide Gloves",
            "gloves",
            "/gear/gloves_hide.png",
            1,
        ),
        (
            "gloves_dragon",
            "Dragonscale Gauntlets",
            "gloves",
            "/gear/gloves_dragon.png",
            2,
        ),
        (
            "shoes_boot",
            "Traveler Boots",
            "shoes",
            "/gear/shoes_boot.png",
            1,
        ),
        (
            "shoes_winged",
            "Winged Sandals",
            "shoes",
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
                category: category.to_string(),
                icon_path: icon_path.to_string(),
                sort_order,
                active: true,
            });
        }
    }
}

#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) {
    log::info!("Benchmark client connected: {:?}", ctx.sender);
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    log::info!("Benchmark client disconnected: {:?}", ctx.sender);
}
