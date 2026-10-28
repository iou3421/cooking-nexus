# FastAPI integration contract — Cooking Nexus frontend

This is a practical **proposed response contract** for connecting the frontend to the SDD v1.3 FastAPI routes. The SDD defines route purposes and security rules but does not fully specify JSON response schemas. This file makes the frontend's assumptions explicit. You can choose different shapes; adapt them in `src/api/http.js`.

## Runtime

- Frontend: React SPA; Vite dev server at `http://localhost:5173`.
- Backend: FastAPI at `http://127.0.0.1:8000`.
- Frontend calls `/api/*`; Vite strips `/api` and forwards to FastAPI.
- Deployed setup: prefer **same-origin**, serving built React assets and API behind one host/reverse proxy.
- All requests use `credentials: 'include'`, JSON request/response, HTTP status codes.
- Unauthenticated endpoint: return 401. For a private object belonging to someone else, prefer 404 to avoid leaking object existence. Invalid input: 422; service offline: 503.
- `Content-Type: application/json` on request bodies.

## Authentication

`POST /auth/register`:

```json
{"email":"cook@example.com","password":"a-strong-password","display_name":"Home Cook"}
```

`POST /auth/login`: `{ "email": "...", "password": "..." }`. Backend sets an `HttpOnly`, `SameSite=Lax` signed JWT cookie. 60-minute baseline. `POST /auth/logout` invalidates/clears it. Implement origin checks / CSRF defenses for state-changing cookie-authenticated endpoints.

`GET /me`, `PATCH /me` return:

```json
{"id": 12, "email":"cook@example.com", "display_name":"Home Cook", "dietary_preferences":["Vegetarian"]}
```

Profile dietary preferences are a **small extension** to the SDD; add DB column/related table or omit persistence until added. `PATCH /me` request: `{ "display_name": "...", "dietary_preferences": ["..."] }`.

**Security:** hash passwords with Argon2 (or maintained adaptive hash), validate JWT on each request, and check row ownership using the authenticated `current_user.id`. A React route guard is **not** access control.

## Pantry

`GET /pantry` returns an array. Example:

```json
[
  {"id":1,"user_id":12,"name":"Rice","quantity":2,"unit":"lb","expiration_date":null},
  {"id":2,"user_id":12,"name":"Milk","quantity":1,"unit":"gal","expiration_date":"2026-11-01"}
]
```

`POST /pantry`, `PATCH /pantry/{id}` accept a subset of `{ name, quantity, unit, expiration_date }` and return the saved object. `DELETE /pantry/{id}` may return HTTP 204. Filter every row by `current_user.id`; never trust a client-supplied `user_id`.

The expiration date must remain **optional** and **never inferred**. UI computes `Not tracked` if null, `Expired` if past, `Expiring soon` if within 3 days, `Normal` otherwise; backend should use the same rule if it returns a status.

## Cookbook-grounded recipes

`POST /recipes/discover` input:

```json
{"search":"tomato","dietary_tags":["Vegetarian"],"quick":true,"budget":false}
```

Response is an array or `{ "recipes": [...] }`. Individual recipe:

```json
{
  "id": 35,
  "title": "Tomato Spinach Pasta",
  "description": "A pasta recipe retrieved from the permitted local index.",
  "source_type": "cookbook",
  "source_label": "Cookbook A — page 42",
  "prep_time_minutes": 25,
  "cost_band": "low",
  "dietary_tags": ["Vegetarian"],
  "image_url": null,
  "ingredients": [{"name":"Spinach"},{"name":"Tomatoes"},{"name":"Pasta"}],
  "instructions": ["First instruction","Second instruction"]
}
```

`GET /recipes/{id}` returns one such object. The backend owns recipe retrieval, filter validation, LLM calls and **source grounding**. It must not return fabricated cookbook citations. Unknown dietary metadata cannot be treated as allergy-safe. The demo images are not a cookbook ingestion system.

## Favorites and shopping

`GET /favorites`: return **hydrated recipe objects** (not just `{ user_id, recipe_id }` join rows), so cards can display details. Or modify `httpApi.favorites.list` to map/join IDs through `GET /recipes/{id}`. `POST /favorites/{recipeId}`, `DELETE /favorites/{recipeId}` mutate an owner-scoped favorite. Enforce `UNIQUE(user_id, recipe_id)`.

`GET /shopping-list` returns:

```json
[{"id": 42,"user_id":12,"name":"Garlic","quantity":1,"unit":"","is_checked":false}]
```

`POST /shopping-list` accepts `{ name, quantity, unit }`; `PATCH /shopping-list/{id}` accepts `{ is_checked }` and other editable fields; `DELETE /shopping-list/{id}` removes only owner items. The frontend's **Add missing ingredients** calls existing `POST /shopping-list` for each missing ingredient: no new bulk endpoint required.

## Community and drafts

`GET /community/recipes` returns **published recipes only**, with fields:

```json
[
  {
    "id": 11,
    "author_user_id": 7,
    "author_name": "Morgan",
    "title": "Quick Veggie Wrap",
    "description": "A simple lunch",
    "image_url": null,
    "ingredients": [{"name":"Tortilla"},{"name":"Hummus"}],
    "instructions": ["Spread hummus", "Roll wrap"],
    "prep_time_minutes": 15,
    "dietary_tags": ["Vegetarian"],
    "is_published": true,
    "like_count": 4,
    "liked_by_me": false,
    "comments": [{"id":14,"user_id":5,"author_name":"Alex","body":"Great idea!"}]
  }
]
```

`POST /community/recipes` creates a **private draft**. `PATCH /community/recipes/{id}` updates only the author. `POST /community/recipes/{id}/publish` accepts `{ "is_published": true | false }`. `DELETE /community/recipes/{id}` deletes only the author's recipe. `POST/DELETE /community/recipes/{id}/like` toggles one like per user. `POST /community/recipes/{id}/comments` accepts `{ body }`, and `DELETE /comments/{id}` removes only a comment owned by the caller.

**Additional endpoint needed for the My recipes & drafts tab:** `GET /community/recipes/mine`. It must return both unpublished and published records **owned by current_user only**. The SDD did not explicitly list a private-drafts retrieval route; this addition preserves the SDD's rule that private drafts must not appear in the published feed.

For security, don't render user-provided HTML. Validate post/comment lengths; the frontend renders text in JSX, so untrusted markup is not injected as HTML. Backend still validates input and ownership.

## Team implementation order

1. Backend models + migrations: `users`, `pantry_items`.
2. Auth: `register`, `login`, `logout`, `me` and owned pantry endpoints. Test with two users.
3. Favorites and shopping list; test unique constraints and private rows.
4. Community drafts/publish/likes/comments plus `mine` endpoint.
5. Cookbook index and search baseline; only then integrate the optional local LLM adapter.
6. Automated tests for registration, cookie expiry, ownership, duplicate likes/favorites, null expiration, recipe grounding, and graceful 503 behavior.

## Out of scope

No real Walmart ordering or checkout, scanning photos/receipts/barcodes, external cloud model, social followers/messages, media uploads, or administrator console. Keep them disabled/hidden until explicitly approved and implemented.
