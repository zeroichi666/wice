# Plan 4 — Game State & World Endpoints

## Routes

| Method | Endpoint            | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| GET    | `/api/v1/game/state`| Yes  | Load full game state for user  |
| GET    | `/api/v1/game/world`| Yes  | Load map/world data            |

## Files Created

1. **`app/Services/CropService.php`** — Service perhitungan stage & water_level
   - `updateCropState()` — hitung stage berdasarkan elapsed time
   - `updateAllUserCrops()` — update semua crop user
   - Water decay: -5% per 10 detik
   - Stage: seed → sprout → growing → ready (berdasarkan % growth_time)

2. **`app/Http/Controllers/Api/V1/GameStateController.php`**
   - `state()` — return user, inventory, tools, crops (dengan time_to_ready)
   - `world()` — return map dimensions, tile layout, well & shop positions

## Logic CropService

```
planted_at + growth_time = total growth duration
elapsed / growth_time * 100 = progress %

Stage thresholds:
  0%  → seed
  25% → sprout
  50% → growing
  100% → ready

Water level:
  Decays 5% every 10 seconds since last_watered_at
  Minimum 0, maximum 100

time_to_ready:
  growth_time - elapsed (seconds remaining)
```

## Contoh Response `/api/v1/game/state`

```json
{
  "success": true,
  "message": "Game state loaded",
  "data": {
    "user": { "id": 1, "username": "farmer1", "coins": 100, "level": 1 },
    "inventory": [
      { "item_code": "carrot_seed", "name": "Carrot Seed", "type": "seed", "quantity": 3 },
      { "item_code": "hoe", "name": "Hoe", "type": "tool", "quantity": 1 }
    ],
    "tools": ["hoe", "watering_can"],
    "crops": [
      {
        "tile_x": 5, "tile_y": 3,
        "item_code": "carrot_seed",
        "stage": "growing",
        "water_level": 60,
        "planted_at": "2025-01-01T10:00:00.000000Z",
        "time_to_ready": 15
      }
    ]
  }
}
```

## Contoh Response `/api/v1/game/world`

```json
{
  "success": true,
  "message": "World data loaded",
  "data": {
    "width": 20,
    "height": 15,
    "tile_size": 32,
    "well": { "x": 0, "y": 7 },
    "shop": { "x": 19, "y": 7 },
    "tiles": [
      { "x": 3, "y": 2, "type": "soil" },
      { "x": 4, "y": 2, "type": "soil" }
    ]
  }
}
```
