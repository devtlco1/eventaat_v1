# API reference

Base URL: configured per environment; local default is `http://localhost:3000` (see
[`../apps/api/.env.example`](../apps/api/.env.example)). With the default port, you can also use
`http://127.0.0.1:3000`.

**Phase 1A:** No new API routes were added; the backend remains **mock-first** in the client
packages. Only **`GET /health`** is implemented. **Phase 1B** adds **no** new API endpoints; only
**`GET /health`** still exists.

**API Docs Foundation** adds **Swagger/OpenAPI documentation only** (interactive UI and machine-readable
spec). **No business endpoints were added.** The only **functional** API route remains **`GET /health`**.

## OpenAPI & Swagger (NestJS)

| URL | Description |
|-----|-------------|
| `GET /docs` | **Swagger UI** (interactive API documentation) |
| `GET /openapi.json` | **OpenAPI 3** document (JSON) |

- **Title:** eventaat API  
- **Description:** Restaurant reservation platform API for eventaat.  
- **Version:** 0.1.0  

Implementation: `@nestjs/swagger` in `apps/api` — `DocumentBuilder` + `SwaggerModule`, shared helper
`apps/api/src/openapi.setup.ts` (used from `main.ts` and e2e so tests match production).

### Rule for all future API work (required)

Do **not** consider any backend change complete if API documentation is out of date.

**Whenever any API endpoint is added, changed, or removed, the same implementation step must update:**

1. **Swagger / OpenAPI** — controller decorators and DTOs so **`/docs`** and **`/openapi.json`** stay
   accurate.
2. **This file** — [`docs/api-reference.md`](./api-reference.md) with the same endpoint changes.

## `GET /health`

**Tag:** `health`  
**Summary (Swagger):** API health check

Returns service liveness and app identifier.

**Response 200 (JSON)**

| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| `status`    | string | e.g. `"ok"`                 |
| `app`       | string | application name `eventaat` |
| `timestamp` | string | ISO 8601 time              |

**Example**

```http
GET /health HTTP/1.1
Host: localhost:3000
```

```json
{
  "status": "ok",
  "app": "eventaat",
  "timestamp": "2026-04-27T12:00:00.000Z"
}
```

---

Future blueprint phases will add customer auth, reservations, restaurant operations, WhatsApp, and
payments; each must follow the **Swagger + `api-reference.md`** rule above when routes ship.
