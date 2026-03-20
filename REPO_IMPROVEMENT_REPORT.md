# Workflow Repo Improvement Report

## Scope

This report compares:

- `Optimised Solution-Checker`: `/Users/aviralsrivastava/Desktop/Sanity-Pipeline/linear-clone-modified/coderepo-mern-linear-clone` on branch `solution-checker`
- `Actual Solution`: `/Users/aviralsrivastava/Desktop/Sanity-Pipeline/linear-solution/coderepo-mern-linear-clone`

The current repo `main` branch shares the same install, startup, build, lockfile, dependency, and frontend-test architecture. The benchmark numbers here use `solution-checker` because that is the solved branch and is the fair runtime comparison against the actual solution repo.

## Highlights

| Area | Older state | New state |
| --- | --- | --- |
| Package manager | npm-first repo | Bun-first repo with Bun declared in `packageManager` and `engines` |
| Install flow | install and setup were mixed into startup | install, start, and seed responsibilities are split more clearly |
| Lockfile | npm lockfile story | `bun.lock` is the main dependency contract |
| Root start flow | heavy `prestart` path that reinstalls and reseeds | lighter startup checks with cached seeding |
| Backend dev loop | `nodemon --delay 2500ms --exec babel-node` | `bun --watch` |
| Backend build | no modern bundle path | `bun build` output then Bun runtime |
| Backend tests | Mocha task scripts | Jest task scripts |
| Frontend tests | no dedicated frontend test runner | dedicated Vitest path |
| Quality checks | no repo-level lint, typecheck, or Knip gate | explicit lint, typecheck, and unused-code checks |
| Dependency upgrades | older runtime and frontend package set | upgraded app and tooling dependencies with exact pinning |
| Dependency lock | `package-lock.json` style story | Bun-first lockfile story with exact versions |

## Benchmark Snapshot

Method:

- cold install was measured from empty `node_modules`
- backend task timing was measured warm after one warm-up run
- frontend timing used a temporary 1-test dummy benchmark because this repo has no frontend task surface
- root start timing is time-to-ready for both `http://127.0.0.1:8080` and `http://127.0.0.1:8000`

| Metric | Optimised Solution-Checker | Actual Solution |
| --- | ---: | ---: |
| Cold install | `1.49s` | `11.96s` |
| Root start readiness | `1.18s` | `12.16s` |
| Backend task benchmark, task 3 (`1` suite / `10` tests) | `1.31s` | `1.21s` |
| Frontend dummy benchmark (`1` suite / `1` test) | `0.79s` | `0.96s` |
| Quality check | `5.14s` | `N/A` |

## Measured Averages

### 1. Installer

```text
Optimised Solution-Checker   1.49 s | ███
Actual Solution             11.96 s | ██████████████████████████
```

What this means:

- the Bun-first install path is much faster here
- the actual solution still pays the older npm workspace install cost

### 2. Root Start Readiness

```text
Optimised Solution-Checker   1.18 s | ███
Actual Solution             12.16 s | ██████████████████████████
```

What this means:

- the large startup win is real
- the actual solution still performs install and seed work in its normal startup path
- the optimised repo only performs startup checks and reuses cached seeding state

### 3. Backend Task Benchmark: Task 3 (`1` suite / `10` tests)

```text
Optimised Solution-Checker  1.31 s | ██████████
Actual Solution             1.21 s | █████████
```

What this means:

- this one backend task path is slightly faster in the actual solution repo
- that does not change the broader repo-level win on install, startup, and tooling hygiene
- it does mean the current Jest backend path is not automatically faster than the older Mocha path on every narrow test slice

### 4. Frontend Dummy Benchmark (`1` suite / `1` test)

```text
Optimised Solution-Checker  0.79 s | ███████
Actual Solution             0.96 s | ████████
```

What this means:

- this repo has no frontend tasks, so a small dummy test was used only to compare runner overhead
- the Vitest path is slightly faster than the older CRA/Jest path on this trivial benchmark

### 5. Quality Check

```text
Optimised Solution-Checker  5.14 s | █████████████
Actual Solution               N/A  | no equivalent repo-level gate
```

What this means:

- the optimised repo has a real quality gate
- the actual solution repo does not have an equivalent root lint + typecheck + unused-code command to compare directly

## Before vs Now

| Topic | Older state | Optimised Repo | Result |
| --- | --- | --- | --- |
| Package manager | npm-first | Bun-first | clearer install and run contract |
| Lockfile | `package-lock.json` flow | `bun.lock` is the main lockfile | dependency resolution is more predictable |
| Install flow | mixed with startup | explicit install/setup/start ownership | less surprise during setup |
| Start flow | heavy and reseeds often | lighter startup checks | much faster normal startup |
| Backend dev | `nodemon --delay 2500ms --exec babel-node` | `bun --watch` | faster save-and-refresh loop |
| Backend build | no Bun build path | `bun build` then Bun runtime | simpler backend toolchain |
| Frontend build | CRA | Vite | cleaner frontend toolchain |
| Frontend tests | no dedicated path | Vitest | explicit frontend test ownership |
| Backend tests | Mocha | Jest | single backend test runner contract |
| Quality checks | missing at repo level | lint + typecheck + Knip | better static-analysis signal |
| Versioning | `^` and `~` ranges | exact pins | more reproducible dependency graph |

## What Changed

### Installer, Startup, and Seed Flow

The older repo mixed setup work into normal startup more heavily.

What changed:

- Bun is the declared package manager
- `bun.lock` is the dependency source of truth
- `postinstall` runs `bash setup.sh --ensure-seeded`
- `prestart` runs `bash setup.sh --start`
- `setup.sh --start` only performs startup checks
- `setup.sh --ensure-seeded` seeds only when the seed signature changes
- `setup.sh --seed` remains the force-seed path
- build-related flows check lockfile consistency with `bun install --frozen-lockfile --ignore-scripts`

This makes install and run behavior more predictable and removes unnecessary work from the normal start path.

### Backend Tooling

Backend changes were some of the most important improvements.

- dev refresh moved from `nodemon + babel-node` to Bun watch mode
- backend build moved to `bun build`
- backend runtime now stays aligned with Bun
- app startup is split into `app.js` and `server.js`

The practical result is a simpler backend toolchain and a much faster normal development loop.

### Frontend Tooling

Frontend work was about replacing the older CRA path with a Vite-based path and modernising the supporting stack.

- frontend runtime and build moved to Vite
- Tailwind moved to v4
- React moved to v19
- React Router moved to v7
- frontend tests now use Vitest

This repo has no frontend candidate tasks, so the frontend contract is intentionally empty and the benchmark section uses a dummy timing test instead of a task benchmark.

### Backend Test Changes

The backend test setup changed in meaningful ways.

- backend tests moved from task-scoped Mocha commands to Jest
- task-level runs still exist and are easy to target
- the solved branch passes all backend task suites under the new test path

One important repo-specific note:

- this repo intentionally stays on Jest without `@swc/jest`
- that was a deliberate decision here and not a missing migration item

### Frontend Test Changes

Frontend testing now has a dedicated path.

- frontend tests use Vitest
- the config is tuned for VM speed with `happy-dom`
- file parallelism is disabled
- a single worker thread is used
- Vitest is scoped to `frontend` so it does not walk backend or spec folders during discovery

### Lint, Typecheck, and Unused Dependency Checks

Quality checks are much clearer now.

- lint flow is explicit
- typecheck flow is explicit
- Knip is part of the repo-level quality story
- question and solution branch behavior is intentionally different

Branch difference:

| Check | `main` | `solution-checker` |
| --- | --- | --- |
| Lint | solution-aware wrapper | direct `eslint` |
| Typecheck | solution-aware wrapper | direct `tsc --noEmit` |
| Unused dependency check | solution-aware wrapper | direct `knip` |

This matches the golden-set pattern:

- `main` is candidate-safe
- `solution-checker` is strict

## Dependency Lock Story

Older state:

- npm-driven install story
- `package-lock.json` was the normal lockfile shape
- package manager choice was less explicit

Current state:

- Bun is declared in `packageManager`
- Bun is also declared in `engines`
- `bun.lock` is committed and used as the main lockfile
- version ranges were pinned to exact values

Practical result:

- installs are more repeatable
- package manager expectations are clearer
- dependency resolution is easier to reason about

## Dependency Upgrades

### Backend Packages

| Package | Actual Solution version | Optimised Repo version |
| --- | --- | --- |
| `bcrypt` | `^6.0.0` | `6.0.0` |
| `dotenv` | `^16.0.3` | `16.6.1` |
| `express` | `4.18.2` | `5.2.1` |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` |
| `mongoose` | `^8.7.0` | `8.23.0` |

Backend dependency cleanup also included:

- `express-async-errors` removed from the active path
- `nodemon` removed from the active dev path
- Babel-based backend startup removed from the active path
- Mocha removed from the active backend test path

### Frontend Packages

| Package | Actual Solution version | Optimised Repo version |
| --- | --- | --- |
| `react` | `18.2.0` | `19.2.4` |
| `react-dom` | `18.2.0` | `19.2.4` |
| `react-router-dom` | `^6.11.1` | `7.13.1` |
| `tailwindcss` | `^3.4.17` | `4.2.1` |
| `postcss` | `^8.5.6` | `8.5.8` |
| `tailwind-merge` | `^3.4.0` | `2.6.1` |
| frontend build/test runner | CRA + implicit Jest | Vite + Vitest |

### Root Tooling

| Package / Tool | Actual Solution | Optimised Repo |
| --- | --- | --- |
| package manager contract | npm-based | Bun-based |
| frontend test tooling | none at repo root | Vitest |
| lint tooling | none at repo root | ESLint |
| typecheck tooling | none at repo root | `tsc --noEmit` |
| unused dependency tooling | none | Knip |
| lockfile | npm-style | `bun.lock` |

## Repo-Specific Notes vs Melodio

This repo intentionally differs from Melodio in a few ways.

- there are no frontend tasks here, so the frontend candidate contract is intentionally empty
- the frontend benchmark uses a temporary dummy test instead of a task benchmark
- backend stays on Jest without `@swc/jest` by explicit decision for this repo

These are intentional repo-specific choices, not missing migration items.

## Final Summary

Compared with the actual solution repo, the optimised repo is clearly ahead on install speed, startup speed, dependency hygiene, lockfile clarity, and repo-level quality tooling.

- cold install is much faster
- normal root startup is dramatically faster
- frontend test-runner overhead is lower
- quality checks now exist and are explicit
- dependency ownership and version pinning are much cleaner

One honest note:

- the representative backend task 3 benchmark was slightly faster in the actual solution repo on this machine

That does not change the broader result: install, startup, modern toolchain structure, lockfile handling, and static-analysis quality are all in a much better state in the optimised repo than in the older actual solution repo.
