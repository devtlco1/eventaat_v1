# API reference

Base URL: configured per environment; local default is `http://localhost:3000` (see
[`../apps/api/.env.example`](../apps/api/.env.example)).

**Note:** The API currently exposes a single health check. All reservation, auth, and WhatsApp
endpoints will be added in later blueprint phases.

## `GET /health`

Returns service liveness and app identifier.

**Response 200 (JSON)**

| Field       | Type   | Description                |
|-------------|--------|----------------------------|
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
