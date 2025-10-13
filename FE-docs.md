# Frontend Web Application Structure (apps/web)

The main web application is a modern single-page application (SPA) built with **React** and **Vite**.

## Client-Side Rendering and Routing

*   **Rendering:** The application uses standard Client-Side Rendering (CSR) via `react-dom/client` in `src/main.tsx`.
*   **Routing:** **TanStack Router** is used for file-based routing, with the route tree generated in `src/routeTree.gen.ts`.
*   **Providers:** The root component is wrapped in essential providers for global state and functionality:
    *   `QueryClientProvider` (for data fetching)
    *   `ThemeProvider` (for theme management)
    *   `AuthProvider` (for user session and authentication state)
    *   `ErrorBoundary` (for graceful error handling)

## API Handling and Data Flow

The frontend achieves end-to-end type safety and robust data management using a combination of the Hono client and TanStack Query.

1.  **Type-Safe Client:** The `@kaneo/libs` package exports a Hono client (`hc`) that is automatically typed based on the backend's `AppType`. This ensures that all API endpoints, request bodies, and response types are checked at compile time.
2.  **Data Fetching:** **TanStack Query** is the primary tool for managing server state. Custom hooks (e.g., `useGetWorkspaces`) are created in the `src/fetchers` directory to:
    *   Call the type-safe Hono client.
    *   Handle loading, error, and success states.
    *   Cache and automatically refetch data.
3.  **Query Client Configuration:** The `QueryClient` is configured in `src/query-client/index.ts` with specific options, such as disabling retries for network-related errors (`Failed to fetch`, `CORS`) to provide immediate feedback to the user.


## Example API Visualization: Analytics Summary

This example illustrates the end-to-end type-safe flow from the Hono backend to a React component using TanStack Query.

### 1. Backend (Hono) - Type Definition and Route

The backend defines the route and its response type. The `AppType` union in `apps/api/src/index.ts` automatically includes this route, making it available to the Hono client.

```typescript
// Conceptual Backend Route (e.g., apps/api/src/analytics/index.ts)

// 1. Define the response type
type AnalyticsSummary = {
  totalTasks: number;
  completedTasks: number;
};

// 2. Define the Hono route
analytics.get("/summary", (c) => {
  // ... database logic to calculate summary
  return c.json({ totalTasks: 150, completedTasks: 120 } as AnalyticsSummary);
});
```

### 2. Frontend Fetcher (TanStack Query Hook)

A custom hook is created to encapsulate the data fetching logic. It uses the type-safe Hono client (`client`) and TanStack Query (`useQuery`).

```typescript
// apps/web/src/fetchers/use-analytics-summary.ts (Conceptual)
import { client } from "@kaneo/libs/hono";
import { useQuery } from "@tanstack/react-query";

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      // Type-safe call: client.analytics.summary.() is inferred from AppType
      const res = await client.analytics.summary.$get();
      
      if (!res.ok) {
        // Hono client returns a standard Response object
        throw new Error("Failed to fetch analytics summary");
      }
      
      // The return type of res.json() is automatically inferred as AnalyticsSummary
      return res.json();
    },
  });
};
```

### 3. Frontend Component Usage

The component consumes the hook, benefiting from automatic loading, error, and data state management provided by TanStack Query.

```tsx
// apps/web/src/components/AnalyticsCard.tsx (Conceptual)
import { useAnalyticsSummary } from "@/fetchers/use-analytics-summary";

export function AnalyticsCard() {
  const { data, isLoading, isError } = useAnalyticsSummary();

  if (isLoading) return <div>Loading analytics...</div>;
  if (isError) return <div>Error loading data.</div>;

  return (
    <div className="analytics-card">
      <h3>Project Summary</h3>
      <p>Total Tasks: {data.totalTasks}</p>
      <p>Completed: {data.completedTasks}</p>
    </div>
  );
}
```
