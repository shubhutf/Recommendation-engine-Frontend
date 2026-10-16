# Restock frontend

React 19, Vite, MUI and the original lime/ink theme. Browse the catalog, register/sign in, view ranked substitutes, submit helpful/not-helpful feedback, and inspect actual model artifacts and interaction analytics.

The backend now integrates an evaluated XGBoost ranker over pretrained MiniLM and historical interaction features. Its checked-in training/evaluation data is **simulated**; the UI labels it explicitly. Gemini only describes product facts after ranking.

## Run locally (PowerShell)

From the parent folder containing both repos:

```powershell
Set-Location .\Recommendation-engine-Frontend
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. The default API is `http://127.0.0.1:5000/api/v1`. To change it:

```powershell
Copy-Item .env.example .env
# Edit VITE_API_BASE_URL in .env, then restart Vite.
```

Start the API/disposable MongoDB and Python scorer using the [backend setup](https://github.com/shubhutf/Recommendation-engine-backend#readme). The demo requires no Atlas credentials and displays a visible simulated-catalog banner. Register a customer through the UI; optional local-admin provisioning is explained in the backend README. Local QA uses disposable MongoDB. The authorized production rollout is recorded in [RELEASE](RELEASE.md); the existing production catalog was not reseeded.

```powershell
npm run lint
npm run build
npm run preview -- --host 127.0.0.1
```

Both lint and production build were run successfully. Backend/Python/integration checks and measured metrics are documented in [phase results](https://github.com/shubhutf/Recommendation-engine-backend/blob/main/docs/PHASES.md).

## Pages and access

- **Dashboard / Products:** live API catalog, stock and real recommendation totals. Product mutation controls appear only for admins, and the API enforces the role independently.
- **Inventory:** protected admin route for current stock updates.
- **Login / Register:** customer-only registration, expiring bearer sessions, current-user lookup and logout. Tokens live in `sessionStorage` and are cleared on 401/logout; passwords are never stored by the frontend.
- **Recommendations:** deliberate product selection, source VIEW events, tracked product/detail clicks, helpful/not-helpful feedback and exposure attribution. Anonymous users can browse; saving outcomes requires sign-in.
- **ML Insights:** baseline-vs-ML metrics, gain-importance bars, dataset summary, simulated-data label, version, trained-at and cold-start explanation. Every displayed value comes from `/ml/insights` and saved artifacts.
- **Analytics:** real-provenance events and CTR by serving engine/position. Simulated training events and old seed rows are excluded. These observational CTRs do not demonstrate causal lift.

Recommendation cards distinguish `ML v1` from `Rule-based (cold start / fallback)`. ML scores are uncalibrated ranking margins, including possible negative values; they are displayed as raw scores, not percentages. Only rule scores use the original 0–100 ring. The exact model version and simulated-training provenance are shown on ML results.

Anonymous users and customers with fewer than five distinct positively interacted products use the permanent rules baseline. Python timeouts/errors also use rules automatically. The UI displays whichever engine the API actually served.

## Structure and conventions

`src/main.jsx` sets up the theme/router/auth provider; `App.jsx` lazy loads page routes. `src/api/axiosClient.js` attaches the session token and handles expiration. `src/mockApi/client.js` is a historical filename: it calls the real API and contains no fake metric fallback. Products normalize Mongo `_id` to `id`, and categories/brands derive from live products. MUI 9 uses `Grid size` and Outlined icons, with styles in `sx`.

No new chart library was added. Insight importance bars use MUI and values from the trained model. Loading/errors are visible rather than replaced with invented data. Vercel uses `npm run build`, output `dist`, and the included `vercel.json` SPA rewrite so direct links and refreshes reach React Router. The API timeout allows the existing free Render backend to wake after inactivity. Set the production API URL at build time; deployment status is recorded with the release verification.

[Interview notes](INTERVIEW_NOTES.md) explain the architecture and measured results in plain English/Hinglish. The [backend data documentation](https://github.com/shubhutf/Recommendation-engine-backend/blob/main/docs/DATA.md) details simulator assumptions and future real-data training.
