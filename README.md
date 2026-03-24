# chronopay-backend

API backend for **ChronoPay** - time tokenization and scheduling marketplace on Stellar.

## What's in this repo

- **Express** API with TypeScript
- Health, slot, and booking-intent routes
- Ready for Stellar Horizon integration, token service, and scheduling logic

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
# Clone the repo (or use your fork)
git clone <repo-url>
cd chronopay-backend

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start dev server (with hot reload)
npm run dev

# Start production server
npm run start
```

## Environment validation

ChronoPay validates environment variables centrally at startup through `src/config/env.ts`.

Currently validated variables used by `src`:

- `NODE_ENV`
  - optional
  - default: `development`
  - allowed: `development`, `test`, `production`
- `PORT`
  - optional
  - default: `3001`
  - must be an integer in the range `1` to `65535`

### Startup failure behavior

If configuration is invalid, the app fails fast before serving requests. Errors are aggregated and sanitized so they identify variable names and reasons without echoing raw values.

Example:

```text
Invalid environment configuration:
- NODE_ENV must be one of: development, test, production.
- PORT must be a whole number between 1 and 65535.
```

### Security notes

- no partial startup on invalid configuration
- whitespace-only values are rejected
- numeric parsing is strict
- no raw env values are leaked in validation errors

Additional reviewer-focused notes live in:

- `docs/environment-validation.md`

## Scripts

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production server |
| `npm run dev` | Run dev server with tsx watch |
| `npm test` | Run Jest tests |

## API

- `GET /health` - Health check; returns `{ status: "ok", service: "chronopay-backend" }`
- `GET /api/v1/slots` - List the in-memory slot catalog
- `POST /api/v1/slots` - Create a stub slot record
- `POST /api/v1/booking-intents` - Create a booking intent for a bookable slot

## Booking Intent API

ChronoPay now includes a focused Booking Intent API that prepares a pending booking intent from a server-side slot catalog.

### Endpoint

- `POST /api/v1/booking-intents`

### Auth headers

- `x-chronopay-user-id` required
- `x-chronopay-role` optional, defaults to `customer`

Allowed roles:

- `customer`
- `admin`

### Request body

```json
{
  "slotId": "slot-100",
  "note": "Optional booking note"
}
```

### Response

Successful creation returns `201` with:

```json
{
  "success": true,
  "bookingIntent": {
    "id": "intent-1",
    "slotId": "slot-100",
    "professional": "alice",
    "customerId": "customer-1",
    "startTime": 1900000000000,
    "endTime": 1900000360000,
    "status": "pending",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Validation and failure behavior

- `slotId` is required and must match the expected identifier format
- `note` is optional but cannot be blank and must be at most 500 characters
- the authenticated customer identity is derived from headers, not the request body
- errors are explicit and sanitized:
  - `400` invalid input
  - `401` missing auth context
  - `403` unauthorized role or self-booking
  - `404` slot not found
  - `409` unbookable, duplicate, or conflicting slot state
  - `500` internal failure with a safe generic message

Detailed reviewer notes live in:

- `docs/booking-intent-api.md`
- `docs/environment-validation.md`

## Contributing

1. Fork the repo and create a branch from `main`.
2. Install deps and run tests: `npm install && npm test`.
3. Make changes; keep the build passing: `npm run build`.
4. Open a pull request. CI must pass (install, build, test).

## CI/CD

On every push and pull request to `main`, GitHub Actions runs:

- **Install**: `npm ci`
- **Build**: `npm run build`
- **Tests**: `npm test`

## License

MIT
