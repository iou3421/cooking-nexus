# Cooking Nexus — React frontend (Team Nexus, CSI 2999)

A complete **frontend starter** for the Cooking Nexus sophomore project, aligned to the team's Software Design Document v1.3.

The UI is modular, responsive, and prepared to connect to a **Python/FastAPI + MySQL** backend. Until the backend is ready, the project runs in an explicitly labeled **mock/demo mode** using browser `localStorage` and illustrative recipe records.

## Get started

Requirements: Node.js 20.19+ (Node 22 recommended), npm.

```bash
npm install
cp .env.example .env       # On Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Open **http://localhost:5173**.

On the login screen, click **Fill demo credentials** and sign in. In demo mode, the password is **not verified or stored**. This is intentional: real account protection will only exist when FastAPI is connected.

To check project structure and demo operations without installing packages:

```bash
npm run check
```

To create a production build after installing dependencies:

```bash
npm run build
npm run preview
```

## Frontend features

| Screen | Current frontend | Real backend connection |
| --- | --- | --- |
| Login / register | Interactive demo forms; no real security in mock mode | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me` |
| Dashboard | Live summary of mock pantry, favorites, shopping and community | Fetches aggregate data via existing REST endpoints |
| Pantry | Add, edit, delete, reduce quantities, search/filter; **manually entered expiration dates only** | Owner-scoped FastAPI CRUD |
| Discover | Search, dietary and practical filters, sample result cards | Cookbook retrieval and local LLM via `POST /recipes/discover` |
| Recipe details | Sample steps, ingredient availability, save and add missing items | `GET /recipes/{id}` and favorites/shopping APIs |
| Favorites | Save / remove bookmarks | Favorites API with uniqueness constraint |
| Shopping list | Add, check/uncheck, remove items; retailer button disabled | Owner-scoped shopping list API; retailer integration future-only |
| Community | Create private drafts, publish, edit, delete, like/unlike, comment | Community routes; **one additional endpoint** for private drafts (see below) |
| Profile | Display-name and dietary preference settings | `GET /me` and `PATCH /me` |

**Explicitly NOT implemented:** photo/receipt recognition, online-order imports, actual Walmart checkout, real cookbook ingestion, local-LLM inference, database persistence, and backend security. The frontend displays placeholders for relevant future work; it does not pretend these capabilities exist.

## Project layout

```text
src/
  api/
    index.js        # switch between mock and HTTP — single interface
    mock.js         # in-browser demo data service (no security)
    http.js         # fetch adapter, credentials: 'include', error handling
  demo/seed.js      # clearly marked synthetic sample recipes and posts
  context/
    AuthContext.jsx # session state and backend login/logout calls
    ToastContext.jsx
  components/
    Layout.jsx      # sidebar, navbar, routes
    RecipeCard.jsx
    UI.jsx          # shared UI building blocks
  lib/
    useResource.js  # loading/error/data lifecycle
    utils.js
  pages/
    DashboardPage.jsx, PantryPage.jsx, DiscoverPage.jsx,
    RecipePage.jsx, FavoritesPage.jsx, ShoppingPage.jsx,
    CommunityPage.jsx, ProfilePage.jsx, LoginPage.jsx
  App.jsx           # React Router routes and auth guard
  styles.css
public/images/      # sample recipe imagery
design-reference/   # five high-fidelity reference mockups (not application screenshots)
scripts/check-structure.mjs
BACKEND_INTEGRATION.md
```

## Connect FastAPI

1. Copy `.env.example` to `.env` and set:

   ```env
   VITE_DATA_MODE=http
   VITE_API_BASE_URL=/api
   ```

2. Start FastAPI at `http://127.0.0.1:8000`.
3. Start the frontend with `npm run dev`.
4. The development Vite proxy forwards **`/api/pantry` → `http://127.0.0.1:8000/pantry`** and similarly for other routes, keeping the SDD route names intact. Browser requests use `credentials: 'include'` to send the backend-issued cookie.
5. Implement the agreed endpoint bodies; see **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** for expected payloads and security responsibilities. If your FastAPI app uses an `/api` prefix natively, change the Vite proxy rewrite and/or `VITE_API_BASE_URL` accordingly.

**Do not add a JWT to localStorage.** The real backend should set an `HttpOnly`, `SameSite=Lax`, `Secure` cookie under HTTPS. React cannot read that cookie; `GET /me` restores UI session state. FastAPI must enforce all authorization even if React hides an Edit/Delete button. Add appropriate cross-site request protections on state-changing routes; `SameSite` alone is not a complete CSRF design.

## API design decisions

The API adapter is in **`src/api/http.js`**. If your teammates choose different response shapes, update **that file only** rather than editing every page.

Two additions beyond the SDD route list are required for the full UI:

- `GET /community/recipes/mine` — list **all of the current user's community recipes, including private drafts**. The existing public-feed route intentionally cannot expose drafts. The frontend displays a clear backend-endpoint warning if it is unavailable.
- `PATCH /me` accepts `dietary_preferences: string[]` in addition to `display_name`; otherwise leave the profile preferences as UI-only until the backend model has that field.

No cloud-hosted inference or external checkout is required for the demo.

## Testing / team handoff

- `npm run check` executes **built-in-Node mock API smoke checks** (login, pantry CRUD, null expiration, dietary filters, favorites, shopping list, drafts, likes/comments, owner isolation) without any npm dependencies.
- After `npm install`, run `npm run build` on each branch before merging.
- Test at desktop and narrow mobile widths.
- Test HTTP behavior using two real accounts: User B must not read or edit User A's private items or drafts.
- Do not put MySQL credentials, FastAPI auth secrets, cookbook copyright materials, or user passwords in this frontend repository.

This project is **an implementation starter**, not a claim that the complete FastAPI/MySQL/LLM system is built.
