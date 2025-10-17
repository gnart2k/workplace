# Gantt Chart Feature Development Plan

This document outlines the plan for implementing a new Gantt chart view to visualize the status and assignment of all tasks within a project.

## Goal
To provide a comprehensive, visual timeline of all project tasks, showing their duration, current status, and assigned user (or unassigned status).

## Scope
The implementation will involve changes to both the \`apps/api\` (backend) and \`apps/web\` (frontend) applications.

## 1. Backend API Development (\`apps/api\`)

The primary goal is to create a dedicated, performant endpoint to serve all necessary data for the Gantt chart visualization.

| Step | Description | Location |
| :--- | :--- | :--- |
| **1.1 Schema Review** | Verify that the task database schema includes necessary fields for a timeline view (e.g., \`start_date\`, \`due_date\` or \`end_date\`). If not present, a migration may be required (out of scope for this initial plan). | \`apps/api/drizzle/schema.ts\` |
| **1.2 Endpoint Creation** | Create a new GET endpoint, e.g., \`/api/v1/tasks/gantt\`, to fetch all relevant task data. | \`apps/api/src/task/\` |
| **1.3 Data Retrieval** | Implement a database query to fetch: Task ID, Task Name, Status, Start Date, End Date, and Assignee Information (User ID, User Name, or null if unassigned). This query must be optimized for large datasets. | \`apps/api/src/task/\` |
| **1.4 Response Format** | Define a clear, standardized JSON response format optimized for the frontend Gantt library. | \`apps/api/src/task/types.ts\` |

## 2. Frontend Web Development (\`apps/web\`)

The frontend will focus on consuming the new API, implementing the chart visualization, and integrating it into the application's navigation.

| Step | Description | Location |
| :--- | :--- | :--- |
| **2.1 Library Selection** | Research and select a suitable, performant React Gantt chart library (e.g., react-gantt-timeline, react-gantt-chart). | N/A |
| **2.2 Route Setup** | Create a new route and page component for the Gantt chart view. | \`apps/web/src/routes/gantt/index.tsx\` |
| **2.3 Data Fetching** | Implement a new TanStack Query hook/fetcher to call the \`/api/v1/tasks/gantt\` endpoint. | \`apps/web/src/fetchers/\` or \`apps/web/src/hooks/\` |
| **2.4 Component Implementation** | Develop the main Gantt chart component, mapping the API data to the library's required data structure. | \`apps/web/src/components/\` |
| **2.5 Navigation Integration** | Add a link to the new Gantt chart page in the main application navigation/sidebar. | \`apps/web/src/components/\` (e.g., \`Sidebar.tsx\`) |

## 3. Verification and Finalization

| Step | Description |
| :--- | :--- |
| **3.1 Testing** | Manually test the new endpoint and the frontend visualization with various data states (assigned, unassigned, different statuses). |
| **3.2 Code Quality** | Run \`pnpm run lint\` and \`pnpm run build\` to ensure code quality and no build errors. |