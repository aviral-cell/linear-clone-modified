# Workflow Repo Improvement Report

## Highlights

| Area | Older state | New state |
| --- | --- | --- |
| Package manager | npm-first repo | Bun-first repo with Bun declared in `packageManager` and `engines` |
| Install flow | setup, install, and seed work were mixed together | install, start, env bootstrap, and seed responsibilities are clearer |
| Lockfile | npm lockfile story with range-based manifests | `bun.lock` is the main dependency contract and manifests are pinned |
| Backend dev loop | `nodemon --delay 2500ms --exec babel-node` | `bun --watch` |
| Backend build | no dedicated backend build artifact path | `bun build` output then Bun runtime |
| Backend tests | Mocha + Chai task scripts | Jest with focused backend behavior matching |
| Frontend tests | no dedicated frontend test runner | dedicated Vitest path |
| Task test runs | backend task scripts only | backend task scripts stay intact and frontend test flow is isolated |
| Quality checks | no root lint, typecheck, or unused-code contract | better signal from Knip, lint, and typecheck |
| Dependency upgrades | older package versions across the stack | upgraded core tooling and app dependencies |
| Dependency lock | npm lockfile style story | Bun-first lockfile story with `bun.lock` |

## Benchmark Snapshot

Method: the current numbers are being updated with VM measurements as they arrive. Cold install was measured from empty `node_modules` in the VM. Task timings are warm timings after one warm-up run. The frontend benchmark uses a temporary dummy test because this repo has no frontend task tests. Backend refresh and frontend refresh were measured by editing a temp-copy source file and waiting for the dev server to serve the updated result.

| Metric | Optimised Solution | Actual Solution |
| --- | ---: | ---: |
| Cold install | `5.5s` | `17s` |
| Backend task benchmark, task 3 (`1` suite / `3` tests) | `1.17s` | `1.17s` |
| Frontend dummy benchmark (`1` suite / `1` test) | `0.69s` | `0.86s` |
| Backend dev refresh | `304ms` | `3034ms` |
| Frontend HMR | `547ms` | `382ms` |

## Measured Averages

This section compares `Optimised Solution` and `Actual Solution`.

### 1. Installer

```text
Optimised Solution   5.5 s | █████████
Actual Solution      17.0 s | ████████████████████████████
```

What this means in simple words:

- The cold install path is much faster in `Optimised Solution` on the VM as well.
- `Actual Solution` is slower on install because it still pays the older npm workspace install cost.
- On the current VM measurement, `Optimised Solution` is about `3.1x` faster.

### 2. Backend Task Benchmark: Task 3 (`1` suite / `3` tests)

```text
Optimised Solution  1.17 s | ██████████
Actual Solution     1.17 s | ██████████
```

What this means:

- This comparison uses the stable backend sub-issue hierarchy task.
- This comparison uses the optimized direct-Jest task runner path.
- The two repos are effectively tied on this narrow task path in the current measurement.

### 3. Frontend Dummy Benchmark (`1` suite / `1` test)

```text
Optimised Solution  0.69 s | ████████
Actual Solution     0.86 s | ██████████
```

What this means:

- This repo does not have frontend candidate tasks, so the comparison uses a temporary dummy frontend test.
- `Optimised Solution` is faster than `Actual Solution` on this frontend test path.

### 4. Backend HMR / Refresh Time

This is really restart-on-save, not true backend HMR.

```text
Optimised Solution   304 ms | ███
Actual Solution     3034 ms | ███████████████████████████████
```

What this means:

- The big backend speed win is real.
- Moving away from `nodemon --delay 2500ms --exec babel-node` removed most of the waiting after each save.
- `Optimised Solution` is dramatically faster than `Actual Solution` for backend save-and-refresh.

### 5. Frontend HMR

```text
Optimised Solution   547 ms | ██████████████
Actual Solution     382 ms | ██████████
```

What this means:

- Frontend HMR is the noisiest measurement in this report.
- In this run, `Actual Solution` refreshed slightly faster than `Optimised Solution`.
- The more stable wins in this repo are install, backend task targeting, frontend test startup, and backend save-and-refresh.

## Before vs Now

| Topic | Older state | Optimised Question | Result |
| --- | --- | --- | --- |
| Package manager | npm-first | Bun-first | clearer install and run contract |
| Lockfile | `package-lock.json` style flow with version ranges | `bun.lock` is the main lockfile and manifests are pinned | dependency resolution is more predictable |
| Install flow | setup script reinstalled everything and startup mixed in more work | Bun install flow with clearer ownership | less surprise during setup |
| Start flow | `prestart` ran a broad setup script and backend `prestart` reinstalled and re-seeded | lighter startup path with explicit `--start` checks | faster normal app startup |
| Backend dev | `nodemon --delay 2500ms --exec babel-node src/app.js` | `bun --watch src/server.js` | much faster save-and-refresh loop |
| Backend build | no dedicated backend build artifact | `bun build` then Bun runtime | simpler backend toolchain |
| Frontend build | CRA build path | Vite build path | cleaner frontend tooling |
| Frontend tests | no dedicated frontend runner | dedicated Vitest path | cleaner frontend test ownership |
| Backend tests | Mocha task scripts | Jest behavior test path | simpler root test targeting |
| Task tests | backend-only task scripts | backend task scripts plus isolated frontend Vitest flow | better test ownership without adding fake frontend tasks |
| Unused dependency checks | no root unused-dependency gate | cleaner Knip output | better tooling signal |
| Dependency upgrades | older versions across tooling and app packages | upgraded package set | better alignment with the current stack |

## What Changed

### Installer, Startup, and Seed Flow

The repo used to blur setup work and normal app startup more heavily.

What changed exactly:

- old root `prestart` ran `bash setup.sh`
- old `setup.sh` always did all of this together:
  - Mongo check/start
  - root `npm install`
  - backend `npm install`
  - frontend `npm install`
- old backend `prestart` then did `npm install && node src/utils/seed.js`
- old root `start` launched frontend and backend through npm scripts

The new flow splits those responsibilities:

- Bun is the declared package manager
- `bun.lock` is the dependency source of truth
- `postinstall` runs `bash setup.sh --ensure-seeded`
- `prestart` runs `bash setup.sh --start`
- `setup.sh --start` only does Mongo and env-file checks
- `setup.sh --ensure-seeded` seeds only when the seed signature changed
- `setup.sh --seed` is the force-seed path
- build-related checks use `bun install --frozen-lockfile --ignore-scripts`
- root `start` launches frontend and backend through Bun scripts instead of npm workspace calls

This makes install and run behavior more predictable.

### Backend Tooling

Backend changes were some of the most important improvements.

- dev refresh moved from `nodemon + babel-node` to Bun watch mode
- backend build moved from no dedicated build output to `bun build`
- backend runtime also stayed aligned with Bun
- the backend entry was split into `app.js` and `server.js`
- `express-async-errors` was removed because Express 5 handles async middleware errors cleanly

The practical result is simple:

- much faster save-and-refresh time
- fewer moving parts in backend local development
- a simpler backend toolchain overall

### Frontend Tooling

Frontend work was mostly about keeping the modern Vite path while cleaning up the supporting stack.

- CRA was replaced with Vite
- frontend tests were split into a dedicated Vitest path
- Vitest was tuned for VM-friendly runs with `happy-dom`, `fileParallelism: false`, and a single thread
- Tailwind moved to v4
- the Workflow theme colors were restored in the Tailwind 4 setup
- the Vite dev server now allows VM `.internal` hosts

Frontend HMR is still fast in practice, but it is the most variable benchmark in this report. The bigger frontend story was test tooling, Tailwind 4 alignment, and keeping the styling stack stable without changing page layout.

### Backend Test Changes

The backend test setup changed in meaningful ways.

- older backend task tests used Mocha, Chai, Chai HTTP, and XML reporter wiring
- backend tests now use Jest
- tests run with `NODE_ENV=test`
- worker count is controlled with `maxWorkers: 1`
- root test entry points are clearer
- task-level backend runs are still supported

In easy words: backend tests became more targeted and easier to run from the root repo, and the optimized task runner now brings the representative task path roughly in line with the actual solution.

### Frontend Test Changes

Frontend testing was separated cleanly from backend testing.

- the older repo had no dedicated frontend test runner
- frontend package tests now use Vitest
- the Vitest config is optimized for VM runs
- frontend tests can run through root scripts without borrowing backend tooling

One honest note:

- this repo has no frontend candidate tasks
- the frontend benchmark in this report therefore uses a temporary dummy test instead of a task suite

### Lint, Typecheck, and Unused Dependency Checks

Quality checks are clearer now.

- lint flow is explicit
- typecheck flow is explicit
- Knip signal improved after cleanup
- duplicate package declarations were removed
- stale ignore rules were reduced
- manifests were pinned so dependency drift is easier to spot

This matters because it improves trust in the tooling output. A clean report now means more than it did earlier.

There is also one important branch difference here:

| Check | Optimised Question | Optimised Solution |
| --- | --- | --- |
| Lint | runs through `lint-solution-diff.mjs`, which is solution-aware | runs direct `eslint . --ext .js,.jsx,.mjs,.cjs` |
| Typecheck | runs through `typecheck-solution-diff.mjs`, which is solution-aware | runs direct frontend and backend `tsc --noEmit` |
| Unused dependency check | runs through `knip-solution-baseline.mjs`, which is solution-aware and uses candidate contracts | runs direct `knip` |

In easy words:

- `Optimised Question` uses wrapper scripts so the quality checks stay aware of the expected question-vs-solution baseline.
- `Optimised Solution` uses the stricter direct tool commands.
- the backend candidate contract exists on `main`
- the frontend candidate contract is intentionally empty on `main` because there are no frontend tasks in this repo

## Dependency Lock Story

This part is important because it affects every install.

Older state:

- npm-driven install story
- lockfile behavior was npm-first
- manifests still used `^` version ranges
- package manager choice was less explicit

Current state:

- Bun is declared in `packageManager`
- Bun is also declared in `engines`
- `bun.lock` is committed and used as the main lockfile
- manifests were pinned and `^` / `~` were removed
- build-related flows check lockfile consistency

Practical result:

- installs are more repeatable
- package manager expectations are clearer
- dependency resolution is easier to reason about

## Dependency Upgrades

### Root-Level Tooling

| Package / Tool | Older state | Optimised Question |
| --- | --- | --- |
| package manager contract | npm-based | Bun-based |
| root frontend test tooling | none | Vitest added |
| lint tooling | not part of the old baseline | ESLint + `typescript-eslint` + `globals` |
| unused dependency tooling | not part of the old baseline | Knip added |
| lockfile | npm-style | `bun.lock` |

### Backend Packages

| Package | Older version | Optimised Question version |
| --- | --- | --- |
| `bcrypt` | `^6.0.0` | `6.0.0` |
| `dotenv` | `^16.0.3` | `16.6.1` |
| `express` | `4.18.2` | `5.2.1` |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` |
| `mongoose` | `^8.7.0` | `8.23.0` |

Backend dependency cleanup also included:

- `nodemon` removed from the active dev path
- `babel-node` removed from the active dev path
- `express-async-errors` removed
- Mocha task-runner dependency path replaced by Jest on the optimised branches

### Frontend Packages

| Package | Older version | Optimised Question version |
| --- | --- | --- |
| `tailwindcss` | `^3.4.17` | `4.2.1` |
| `@tailwindcss/postcss` | not in old setup | `4.2.1` |
| `vite` | not in old setup | `6.4.1` |
| `@vitejs/plugin-react` | not in old setup | `4.7.0` |
| `typescript` | not in old setup | `5.9.3` |
| `react` | `18.2.0` | `19.2.4` |
| `react-dom` | `18.2.0` | `19.2.4` |
| `react-router-dom` | `^6.11.1` | `7.13.1` |
| frontend test runner | none | Vitest |

### Dependency Cleanup

Not all dependency work was about upgrades. Some of it was cleanup.

- npm-first root install scripts were removed from the active path
- frontend-owned and backend-owned packages were kept in the right workspace
- manifests were pinned instead of using `^` and `~`
- Knip ignore rules were cleaned up
- the repo now has a more honest unused-dependency signal

## Styling and Library Upgrade Work

The frontend styling stack was brought back into a healthier state.

- Tailwind was upgraded to v4
- the Workflow color palette was restored
- the theme setup was aligned with what the app expects
- Vite host allowlisting was aligned for VM access
- the Tailwind 4 cascade issue was fixed by moving the global reset into `@layer base`

This was important because it fixed the gap between the intended design system and the actual generated classes without changing the app layout.

## Small Code-Side Cleanup

Along with the tooling work, a small amount of code-side cleanup was also done.

- script entry points were simplified so install, start, seed, build, and test responsibilities are easier to follow
- backend startup was split cleanly into app boot and server boot
- redundant dependency declarations at the root were removed so workspace ownership is clearer
- stale Knip ignore rules were cleaned up so unused dependency reporting is more honest
- frontend and backend test entry points were aligned so each side is easier to target
- candidate-contract handling was made honest for this repo by keeping the frontend contract empty on `main`

## Final Summary

Compared with `Actual Solution`, `Optimised Solution` is clearly ahead on most of the tooling and workflow benchmarks in this report.

- cold install is much faster
- the dummy frontend test benchmark is faster
- backend save-and-refresh time is dramatically faster
- the representative backend task benchmark is now effectively tied
- frontend HMR is more variable, and this measurement favored the actual solution

At the repo level, the important result is that install, lockfile handling, backend dev, backend build, frontend build, test targeting, dependency pinning, and dependency hygiene are all in a cleaner state than the older npm-first setup. The repo is easier to reason about, faster in most of the day-to-day loops that matter, and has better signal from quality checks.
