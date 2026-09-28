# 🌾 Wice Farming

Pixel art 2D farming game. Tanam, siram, panen, jual!

## Tech Stack

- **Frontend**: React 18 + Phaser 3 + TypeScript + Vite + Zustand + Tailwind CSS
- **Backend**: Laravel 11 + Sanctum + MySQL
- **Design**: Server-authoritative (semua game logic di backend)

## Fitur (Plan 1-13)

| # | Fitur | Status |
|---|-------|--------|
| 1-2 | Setup project + Database & models | ✅ |
| 3 | Auth (register, login, logout) | ✅ |
| 4 | Game state endpoints | ✅ |
| 5 | Phaser 3 game engine (map, player, camera) | ✅ |
| 6 | UI overlay (HUD, Hotbar, Inventory, Shop, Toast) | ✅ |
| 7 | Cangkul tanah (hoe) | ✅ |
| 8 | Tanam bibit (plant) | ✅ |
| 9 | Sistem air (water) | ✅ |
| 10 | Panen (harvest) | ✅ |
| 11 | Beli di toko (buy) | ✅ |
| 12 | Jual di toko (sell) | ✅ |
| 13 | Polish (Toast, Auto-sync, Settings) | ✅ |

## Cara Bermain

### Kontrol

| Tombol | Fungsi |
|--------|--------|
| WASD / Arrow Keys | Gerak |
| E | Interaksi (cangkul, tanam, siram, panen, buka toko/sumur) |
| I | Buka/tutup Inventory |
| 1-9 | Pilih slot di Hotbar |
| ESC | Buka Settings / Tutup panel |

### Loop Permainan

1. **Beli bibit** → E di toko → tab Beli → pilih bibit → Beli
2. **Cangkul tanah** → Pilih hoe di hotbar → E di tanah → tanah jadi coklat
3. **Tanam bibit** → Pilih bibit di hotbar → E di tanah yang sudah dicangkul
4. **Isi air** → Pilih watering can → E di sumur → capacity = 5/5
5. **Siram tanaman** → Pilih watering can → E di tanaman → air berkurang
6. **Tunggu tumbuh** → Tanaman bertahap: seed → sprout → growing → ready
7. **Panen** → E di tanaman yang sudah ready → product masuk inventory
8. **Jual** → E di toko → tab Jual → pilih quantity → Jual

### Tips

- Tanaman hanya tumbuh jika water_level > 0 (siram secara berkala!)
- Meter air di atas tanaman menunjukkan sisa air
- Jual hasil panen untuk dapat koin, beli lebih banyak bibit

## Setup

### Prerequisites

- PHP 8.2+
- Composer
- MySQL (via XAMPP)
- Node.js 18+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan serve
```

Backend: `http://localhost:8000`

### Database

Buat database `wice_farming` di MySQL, lalu jalankan migrasi & seeder.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/register` | No | Register |
| POST | `/api/v1/login` | No | Login |
| POST | `/api/v1/logout` | Yes | Logout |
| GET | `/api/v1/me` | Yes | User profile |
| GET | `/api/v1/game/state` | Yes | Game state |
| GET | `/api/v1/game/world` | Yes | World data |
| POST | `/api/v1/game/till` | Yes | Cangkul tanah |
| GET | `/api/v1/game/tilled` | Yes | List tile yang sudah dicangkul |
| POST | `/api/v1/game/plant` | Yes | Tanam bibit |
| POST | `/api/v1/game/refill-water` | Yes | Isi air di sumur |
| POST | `/api/v1/game/water` | Yes | Siram tanaman |
| POST | `/api/v1/game/harvest` | Yes | Panen |
| GET | `/api/v1/shop/items` | Yes | List item toko |
| POST | `/api/v1/shop/buy` | Yes | Beli item |
| POST | `/api/v1/shop/sell` | Yes | Jual item |

## Project Structure

```
Wice/
├── frontend/              # React + Phaser 3
│   ├── src/
│   │   ├── game/          # Phaser scenes & entities
│   │   ├── ui/            # React UI components
│   │   ├── api/           # API client
│   │   ├── stores/        # Zustand stores
│   │   ├── hooks/         # Custom hooks (useAutoSync)
│   │   └── types/         # TypeScript types
│   └── ...
├── backend/               # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/
│   │   ├── Services/      # Game logic
│   │   └── Models/        # Eloquent models
│   └── ...
└── README.md
```
