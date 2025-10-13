# Kaneo API Documentation (Hono)

The Kaneo API is built using the [Hono](https://hono.dev/) framework, providing a fast, lightweight, and type-safe backend.

## Core Structure

The API follows a modular, domain-driven structure where each major resource (e.g., `project`, `task`, `workspace`) is defined in its own directory and mounted as a sub-application onto the main Hono instance.

### 1. Entry Point

*   **Server:** Runs on port `1337` using `@hono/node-server`.
*   **Type Safety:** The entire API surface is exported as `AppType` (a union of all route types), which is used by the frontend client (`@kaneo/libs/hono.ts`) for end-to-end type safety.

### 2. Middleware and Authentication

All routes, except for a few public endpoints, are protected by a global authentication middleware.

| Feature | Path | Description |
| :--- | :--- | :--- |
| **CORS** | `*` | Configured to respect the `CORS_ORIGINS` environment variable. |
| **Auth Handler** | `/api/auth/*` | Routes for sign-in, sign-up, and session management, handled by `better-auth`. |
| **Auth Middleware** | `*` | Runs before all other routes. It checks for a valid session and sets `user`, `session`, and `userId` in the Hono context variables. If no user is found, it throws a `401 Unauthorized` exception. |

### 3. Modular Routes

The main application routes are mounted under their respective domain paths. These routes require the user to be authenticated.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Workspace** | `/workspace` | Management of user workspaces. |
| **Workspace User** | `/workspace-user` | Management of users within a workspace. |
| **Project** | `/project` | CRUD operations for projects. |
| **Task** | `/task` | CRUD operations for tasks. |
| **Activity** | `/activity` | Tracking and retrieval of user activity. |
| **Time Entry** | `/time-entry` | Management of time tracking entries. |
| **Label** | `/label` | Management of labels/tags. |
| **Notification** | `/notification` | User notification management. |
| **Search** | `/search` | Global search functionality. |

### 4. Public Routes (No Authentication Required)

| Route | Method | Description |
| :--- | :--- | :--- |
| `/config` | (Mounted) | Configuration endpoints. |
| `/github-integration` | (Mounted) | Endpoints for GitHub integration webhooks/callbacks. |
| `/public-project/:id` | `GET` | Retrieves a project that has been explicitly made public. |
