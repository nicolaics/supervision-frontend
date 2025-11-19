# Space Vision Frontend

Executive-facing dashboard for the Space Vision signage interview task. The application ingests KPI payloads produced by the backend, lets reviewers upload the two CSV datasets, and renders attention/entrance insights through a curated set of charts built with Recharts and shadcn/ui.

---

## 1. Running the project

### Local development workflow

1. **Install prerequisites**
   - Node.js 20 or newer (aligns with the backend and Vite 5 requirements).
   - npm 10 or newer.
2. **Install dependencies**
   ```powershell
   npm install
   ```
3. **Configure the backend endpoint**
   - Copy `.env.example` to `.env` (create the file if it does not exist) and set `VITE_API_BASE_URL`.
   - Default: `http://localhost:3000`, which matches the Next.js backend running on port 3000.
4. **Start the development server**
   ```powershell
   npm run dev
   ```
   - Vite hosts the app on `http://localhost:5173` by default. Ensure the backend’s CORS whitelist includes this origin.

### Production build

```powershell
npm run build
npm run preview
```

The `dist/` output is a static asset bundle that can be hosted behind any CDN or static file host. Configure `VITE_API_BASE_URL` at build time to point to the deployed backend.

---

## 2. Architecture & technology rationale

- **React 18 + TypeScript**  
  Provides a strongly typed UI layer with hooks-based composition. Type safety is essential because most components render derived metrics (rates, percentiles) that must stay consistent with backend calculations.

- **Vite 5 + SWC plugin**  
  Delivers sub-second startup times and HMR for data-heavy views. Vite’s environment variable system (`import.meta.env`) exposes the backend base URL cleanly.

- **shadcn/ui + Tailwind CSS**  
  Supplies an accessible component library (cards, dialogs, tables) with consistent design tokens. Tailwind keeps layout definitions colocated with JSX, which is useful for rapidly iterating on dashboard compositions.

- **Recharts**  
  Handles visualizations that require custom tooltips, gradients, and responsive containers. Compared to lower-level charting libraries, it strikes a balance between declarative syntax and customization, which is ideal for the scatter and bar plots in this project.

- **React Query (@tanstack/react-query)**  
  Centralizes data fetching, caching, and retry logic for `/api/performance` and `/api/performance/group`. This avoids duplicated state handling across charts and ensures cache invalidation after CSV uploads is trivial.

- **Axios API client** (`src/lib/api.ts`)  
  Wraps HTTP calls with interceptors that handle FormData uploads, standardized error handling, and consistent response typing against the backend’s `ApiResponse<T>` envelope.

- **Zustand store** (`src/store/upload-store.ts`)  
  Keeps lightweight UI state (whether upload cards should remain visible after data arrives) outside of React Query caches, preventing unnecessary rerenders.

**Data flow summary**

```
User uploads CSV → frontend FormData request → backend /api/process-csv/*
                                      ↘ dataset status refetch (React Query)

React Query fetches /api/performance → components render KPIs
React Query fetches /api/performance/group → group-level charts
```

---

## 3. Environment variables

| Variable            | Default                   | Purpose                                            |
| ------------------- | ------------------------- | -------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000`   | Base URL for all Axios requests to the backend API |

All variables must use the `VITE_` prefix to be injected into the Vite build. During development, place them in `.env.local`; for production, define them in your hosting provider’s build configuration.

---

## 4. API integration & state management

- `src/lib/api.ts` centralizes:
  - KPI fetchers (`fetchContentPerformance`, `fetchGroupPerformance`), which unwrap the backend response and throw typed errors when `success` is false.
  - CSV upload helpers (`uploadContentPerformanceCSV`, `uploadPlayerHistoryCSV`) that stream files via multipart FormData, apply dynamic timeouts based on payload size, and log diagnostics for interview reviewers.
  - Dataset health checks (`fetchDatasetStatus`) shown in the upload cards.
- `src/hooks/use-performance-data.ts` exposes memoized hooks that transform backend KPIs into the typed `AdPerformanceData` model consumed by all charts.
- `QueryClient` in `src/App.tsx` scopes React Query caching at the application level. Components call `queryClient.invalidateQueries` after uploads to refresh charts automatically.

---

## 5. Chart descriptions & rationale

- **Dashboard Stats (`DashboardStats.tsx`)**  
  Four KPIs derived client-side: total impressions, average attention rate, average entrance rate, and count of S/A-grade creatives. These tiles provide a rapid health check before diving into detailed visuals.

- **Attention–Entrance Scatter (`AttentionEntranceScatter.tsx`)**  
  Plots each creative’s attention rate (x-axis) against its entrance rate (y-axis) while color-coding the percentile grade calculated on the backend. The scatter makes it easy to spot content that attracts views but fails to convert.

- **Average Entrance Rate by Group (`EntranceRateByGroup.tsx`)**  
  Aggregates entries by `content_group` and renders a descending bar chart. This helps stakeholders compare categories such as demographic segments or product families without exporting data to a spreadsheet.

- **Performance Leaderboard (`PerformanceLeaderboard.tsx`)**  
  Sortable table built with shadcn table primitives. Users can rank creatives by impressions, rates, or grades, enabling deeper inspection after trends are spotted in the charts.

- **CSV Upload Cards (`CsvUploadCard.tsx`)**  
  Paired cards for the two datasets. They provide mode toggles (`replace` vs `append`), upload progress feedback, and pull status metrics (`records_count`, `last_updated_at`) from `/api/dataset-status` so operators know whether fresh data is available.

Each visualization consumes the same React Query cache, which guarantees that filters, dates, and aggregates stay synchronized across the UI.

---

## 6. Troubleshooting

- **CORS errors when calling the backend**  
  Ensure `VITE_API_BASE_URL` matches the backend origin and that the backend’s `CORS_ALLOWED_ORIGINS` list includes the frontend host (e.g., `http://localhost:5173`).

- **Uploads timing out**  
  The frontend increases Axios timeouts for files larger than 10 MB, but extremely large CSVs may still fail on slower connections. Consider switching to `append` mode with smaller batches during testing.

- **Empty dashboard despite uploads**  
  Confirm both datasets have been ingested: the KPIs require player impressions and content performance flags. Check the record counts surfaced in the upload cards, or hit `/api/dataset-status` directly.

- **Environment variable not picked up**  
  Vite only injects variables prefixed with `VITE_`. After changing `.env`, restart `npm run dev`.

---

## 7. Next steps

- Add automated smoke tests (Playwright or Cypress) that validate chart rendering against mocked API responses.
- Introduce persisted filters (grade, sort order) so analysts can bookmark specific dashboard states.
- Package the dashboard as a deployable static artifact (e.g., Docker Nginx image) once backend endpoints are hosted publicly.
