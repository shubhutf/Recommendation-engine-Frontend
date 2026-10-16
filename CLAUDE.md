# Frontend architecture and conventions

- React 19 / Vite / MUI 9 / React Router. `src/main.jsx` configures router/theme; `src/App.jsx` defines routes.
- Theme is `src/theme/theme.js`: ink #12201A, lime #C6FF4E, paper #F6F7F3. Reuse Layout, StatCard and MUI components.
- `src/mockApi/client.js` is historically named: it calls the real Express API via `src/api/axiosClient.js`. It must never supply fake metric fallbacks.
- Product IDs are normalized from Mongo `_id` into `id`. Categories/brands derive from live products.
- Use existing `...Outlined` MUI icons. MUI 9 Grid uses `size`, not removed `item/xs` props.
- Commands: `npm ci`, `npm run dev`, `npm run build`, `npm run lint`.
- Work on feature branches from `develop`; keep small phase commits. Never commit `.env`, tokens, or credentials.
- JWTs are session scoped; backend authorization remains authoritative. Hide admin controls for customers.
- Display model metrics only from backend artifact APIs, and always label simulated evaluations.

## Implemented auth and ML UI

- `src/auth/AuthProvider.jsx` restores `/auth/me`; `AuthContext.js` exports hook/context; `ProtectedRoute.jsx` protects Inventory by role. Login/register do not attach a stale bearer token.
- `src/pages/MLInsights.jsx` reads `/ml/insights`, displaying evaluated artifacts and raw gain importance. No chart dependency or fabricated fallback.
- Recommendation cards use returned product snapshots, exposure IDs, engine/version/fallback, raw model margin and simulated-training provenance. Rule scores alone use ScoreRing percentages. Product-detail clicks and helpful controls post owned outcomes.
- `src/pages/Analytics.jsx` shows real-only engine/position CTR from the API. The demo mode banner derives from health data.
- Page routes are lazy-loaded. Layout supports narrow screens. MUI 9 Stack alignment uses `sx`; all relevant Grid sizing uses `size`.
- API default uses explicit IPv4 loopback to avoid macOS AirPlay at localhost:5000. Production uses VITE_API_BASE_URL at build time.
- Lint/build and browser registration/customer nav/cold-start cards/detail click/feedback/Insights were verified locally. The subsequent authorized Vercel/Render rollout is recorded in RELEASE.md.
