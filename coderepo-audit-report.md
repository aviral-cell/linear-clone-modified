# CodeRepo Audit Report

**Codebase:** coderepo-mern-linear-clone (Workflow)
**Branch Audited:** enhancements (with solution-prod and base-prod checked)
**Date:** 2026-02-16

---

> **Detected Stack:** React (CRA) + Node.js/Express + MongoDB/Mongoose

---

## Audit Results

| Rule | Status | Finding |
|------|--------|---------|
| A1 | FAIL | Remote name is `coderepo-mern-linear-clone`. Format should be `coderepo-{frontend}-{backend}-{appname}` (e.g., `coderepo-react-node-workflow`). "mern" is not `{frontend}-{backend}` and "linear-clone" references a copyrighted brand. |
| A2 | FAIL | Root `package.json` has no `workspaces` field. Both `frontend/` and `backend/` have their own `package-lock.json` and `node_modules/`. Not using npm workspaces. |
| A3 | FAIL | Backend uses layer-based structure: `src/controllers/`, `src/models/`, `src/routes/`, `src/services/`. Frontend uses `components/`, `pages/`, `services/`. Should be feature-based: `src/features/{feature}/`. |
| A4 | FAIL | No repository layer exists. Services make direct Mongoose calls (e.g., `Issue.find()` in `backend/src/services/issue/issueService.js`). Pattern should be Controller → Service → Repository → DB. |
| A5 | PASS | Both `solution-prod` and `base-prod` branches exist. Test files are identical between branches (zero diff on `backend/test/`). |
| A6 | MANUAL | Phase-based workflow is a process requirement. Curator must verify that phase branches were created and merged per the guidelines. |
| A7 | FAIL | No `problem-statements/` folder exists in the repository. |
| A8 | PASS | `technical-specs/` exists with 6 PascalCase spec files: AdvancedIssueFilters.md, ApiLogger.md, CommentsAccessControl.md, IssueActivityTracker.md, IssueSubscribe.md, SubIssueHierarchy.md. |
| A9 | PASS | Tests at workspace level (`backend/test/task{1-6}/app.spec.js`). Consistent location. |
| A10 | FAIL | No `output/` directory exists at project root. Missing `.gitkeep` file. Test scripts write XML to `../output/taskN.xml` but the directory doesn't exist. |
| A11 | FAIL | DB names are `WorkflowDB` / `WorkflowDB_Test` (in `backend/src/config/database.js:3`). Convention requires `workflow_db` / `workflow_db_test` (snake_case with `_test` suffix). Also, `setup.sh` does not seed the DB — seeding only happens via backend's `prestart` script, so DB reset on restart depends on the start flow. |
| A12 | FAIL | No `.gitattributes` file exists at project root. Should exclude `problem-statements/` and `docs/` from .zip archive via `export-ignore`. `.gitignore` exists but is missing `.env` as a standalone entry (has `.env.local` variants but `.env` is present). |
| A13 | MANUAL | Curator must download .zip from GitHub and verify size is under 5MB. |
| A14 | FAIL | `hackerrank.yml` issues: (1) `readonly_paths` uses `backend/test/*` (single wildcard) — should be `backend/test/**` to match subdirectories. (2) Seeder files (`backend/src/utils/seeders/`) are not protected. (3) `install` command (`npm run prestart` → `setup.sh`) does not seed the database — seeding only happens on `npm start` via backend's prestart. |
| A15 | PASS | Frontend=8000 (`frontend/package.json`), Backend=8080 (`backend/src/app.js:18`). Both are allowed ports. |
| A16 | PASS | Backend uses `nodemon --delay 2500ms` (`backend/package.json:8`). Frontend uses CRA dev server (hot reload by default). |
| A17 | MANUAL | Curator must upload .zip to HackerRank platform and verify both branches run without errors. |
| A18 | PASS / MANUAL | **Diff rule PASS:** `git diff solution-prod base-prod` only shows business logic files (10 files in `backend/src/`). No config, dependency, or structural differences. **PR comment format: MANUAL** — curator must add the PR comment per the guidelines image. |
| B1 | FAIL | (1) `README.md` exists at root (should be removed). (2) Extensive comments in application code across 40+ files in both `backend/src/` and `frontend/src/` (e.g., `backend/src/utils/seed.js:1`, `frontend/src/services/api.js:1`, all `frontend/src/components/ui/*.js` files, all `frontend/src/constants/*.js` files). |
| B2 | PASS | No British English spellings found in application code. |
| B3 | FAIL | `var` declaration found in `backend/src/middleware/auth.js:15`: `var decoded = jwt.verify(token, JWT_SECRET)`. Should use `const`. |
| B4 | PASS | Dark theme is default (`<html class="dark">` in `index.html`, `darkMode: 'class'` in `tailwind.config.js`). Uses Tailwind CSS. No banned UI libraries (Material UI, Chakra, etc.). |
| B5 | PASS | No external CDN links, no external image URLs, no copyrighted brand names in application code. |
| B6 | PASS | "Workflow" appears only in UI branding (`LoginPage.js`, `Sidebar.js`), console logs, and DB name. No "Linear" or "linear-clone" references in source code. Login emails not checked but fall under exception rule. |
| B7 | FAIL | Zero `data-testid` attributes found in any frontend component under `frontend/src/`. No test hook infrastructure for frontend DOM testing. |
| B8 | PASS | Backend tests use `chai-http` to make real HTTP requests against the API with a real test database (`WorkflowDB_Test`). No internal mocking. Behavioral/integration testing approach. |
| B9 | PASS | No WebSocket, file upload, audio playback, or email sending functionality in application code. |
| B10 | PASS | All 6 tasks touch 2+ backend files each (verified via `git diff solution-prod base-prod --stat`). Task 6 touches 4 files. |
| B11 | MANUAL | Requires functional testing to verify each task is independently solvable. |
| B12 | MANUAL | Requires running the `base-prod` branch to verify the app loads without crashing. |
| B13 | PASS | Test counts per task: Task1=6, Task2=8, Task3=9, Task4=7, Task5=6, Task6=12. All exceed minimum of 5 for medium difficulty. |
| B14 | FAIL | Test scripts correctly configure `MOCHA_FILE=../output/taskN.xml` with `mocha-junit-reporter`, but the `output/` directory does not exist at project root (no `.gitkeep`). Overlaps with A10. |
| B15 | FAIL | `frontend/src/pages/LoginPage.js:125` uses `type="password"`. Should use `type="text"` with CSS `-webkit-text-security: disc` to avoid browser password manager popups. Seed user names are gender-neutral (PASS). |
| B16 | FAIL | Frontend uses Create React App (`react-scripts`) instead of React + Vite as required. Backend (Express + Mongoose) and state management (React built-ins only) and HTTP client (native `fetch`) are correct. |
| B17 | PASS | `.vscode/launch.json` exists with Node.js debug configuration. |

---

## Audit Summary

> **Audit Summary:** 16 passed, 15 failed, 6 manual checks needed, 0 not applicable.

---

## Failures to Fix

| Rule | Action Required |
|------|----------------|
| **A1** | Rename repository to `coderepo-react-node-workflow` format. |
| **A2** | Add `"workspaces": ["frontend", "backend"]` to root `package.json`. Remove individual `package-lock.json` and `node_modules/` from frontend and backend. Maintain single `package-lock.json` at root. |
| **A3** | Restructure both frontend and backend to feature-based: `src/features/{feature}/` with `src/shared/` for cross-cutting concerns. |
| **A4** | Add a repository layer per feature (e.g., `issue.repository.js`) for DB queries. Services should not call Mongoose models directly. |
| **A7** | Create `problem-statements/` folder with candidate-facing problem descriptions. |
| **A10** | Create `output/` directory at project root with an empty `.gitkeep` file. |
| **A11** | Rename databases to `workflow_db` and `workflow_db_test` in `backend/src/config/database.js`. |
| **A12** | Create `.gitattributes` at project root with `**/problem-statements/ export-ignore` and `**/docs/ export-ignore`. |
| **A14** | Fix `hackerrank.yml`: (1) Change `backend/test/*` to `backend/test/**`. (2) Add seeder files to `readonly_paths`. (3) Ensure install command seeds the database. |
| **B1** | Remove `README.md`. Remove all comments from application code in `backend/src/` and `frontend/src/` (~40+ files). |
| **B3** | Change `var decoded` to `const decoded` in `backend/src/middleware/auth.js:15`. |
| **B7** | Add `data-testid` attributes (kebab-case) to all testable interactive elements in frontend components. |
| **B14** | Create `output/` directory at project root with `.gitkeep` (same fix as A10). |
| **B15** | Change `type="password"` to `type="text"` with `style={{ WebkitTextSecurity: 'disc' }}` and `autoComplete="off"` in `frontend/src/pages/LoginPage.js`. |
| **B16** | Migrate frontend from Create React App (`react-scripts`) to React + Vite. |
