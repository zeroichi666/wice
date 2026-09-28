# 🌾 Wice Farming

Pixel art 2D farming game built with React + Phaser 3 (frontend) and Laravel 11 (backend).

## Architecture

- **Frontend**: React 18 + Phaser 3 + TypeScript + Vite
- **Backend**: Laravel 11 + Sanctum + MySQL
- **Design**: Server-authoritative (all game logic on backend)

## Project Structure

```
Wice/
├── frontend/          # React + Phaser 3 game client
│   ├── src/
│   │   ├── game/      # Phaser 3 game scenes & logic
│   │   ├── ui/        # React overlay UI components
│   │   ├── api/       # Axios API client
│   │   ├── stores/    # Zustand state management
│   │   ├── hooks/     # React custom hooks
│   │   ├── types/     # TypeScript type definitions
│   │   └── config/    # Game & app configuration
│   └── ...
├── backend/           # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   # API versioned controllers
│   │   ├── Services/                  # Game logic services
│   │   └── Traits/                    # Shared traits (ApiResponse)
│   └── ...
└── README.md
```

## API Convention

All API responses follow this format:

```json
{
  "success": true,
  "message": "Action completed",
  "data": { ... }
}
```

Every game action = 1 POST endpoint. API is versioned at `/api/v1/...`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Path Aliases

| Alias     | Path        |
|-----------|-------------|
| `@game`   | `src/game`  |
| `@ui`     | `src/ui`    |
| `@api`    | `src/api`   |
| `@stores` | `src/stores`|
| `@hooks`  | `src/hooks` |
| `@types`  | `src/types` |

## Backend Setup

### Prerequisites

- PHP 8.2+
- Composer
- MySQL 8.0+
- Node.js 18+

### Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend runs at `http://localhost:8000`.

### API Endpoints

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | `/api/v1/game/action` | Execute game action |
| GET    | `/api/v1/game/status` | Get game status     |
| POST   | `/api/v1/game/sync`   | Sync game state     |

## Development

```bash
# Run both frontend and backend
cd frontend && npm run dev &
cd backend && php artisan serve &

# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
```

## Tech Stack

- **Frontend**: React 18, Phaser 3, TypeScript, Vite, Zustand, Tailwind CSS, Axios
- **Backend**: Laravel 11, Sanctum, MySQL
- **Design Pattern**: Server-authoritative game logic

## Status

🚧 Setup & boilerplate only — no gameplay implemented yet.
