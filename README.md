# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # IauVacanță – Frontend

    React + TypeScript + Vite single-page app that now talks to the legacy Express/MySQL backend. Use this doc as a quick start for local development.

    ## Prerequisites

    - Node.js 20+
    - npm 10+
    - Running MySQL instance loaded with `backend/iauvacan_iauvacanta.sql`
    - Backend server from `backend/` in this repo (Express + mysql2)

    ## Environment variables

    Copy `.env.example` to `.env` and adjust if your backend runs on a different host/port:

    ```
    VITE_API_BASE_URL=http://localhost:4000/api
    ```

    The frontend uses this value for all API calls (auth, taxonomy, etc.). When deploying, point it to the public backend URL.

    ## Install & run

    ```bash
    npm install
    npm run dev
    ```

    The dev server expects the backend to be available at `VITE_API_BASE_URL`. Start the backend separately (`cd backend && npm install && npm run dev`).

    ## Production build

    ```bash
    npm run build
    npm run preview
    ```

    ## Legacy authentication flow

    - The login form now calls `POST /api/auth/login` on the backend.
    - Passwords are hashed with unsalted SHA-512 to match the historical `users` table inside `iauvacan_iauvacanta.sql`.
    - If the backend is unreachable you can still use the built-in demo accounts listed on the login screen.

    ## Troubleshooting

    - **401 errors** – ensure the email/password pair exists in the imported `users` table.
    - **Network errors** – verify `VITE_API_BASE_URL` matches the backend origin and that CORS is enabled (it is by default in `backend/src/app.ts`).
    - **Database issues** – re-import the SQL dump and confirm the backend `.env` points to the right database.
    },
