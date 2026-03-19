# Workflow

Project management app monorepo using React, Node, MongoDB, Bun, Vite, Jest, Vitest, ESLint, and Knip.

## Prerequisites

- Node.js `>=20`
- Bun `>=1.0`
- MongoDB available locally for seeding and backend tests

## Install

From the repo root:

```bash
bun install
```

For a reproducible install:

```bash
bun install --frozen-lockfile
```

## Running scripts

From the repo root:

- `bun run setup` to install and reseed
- `bun start` to run frontend and backend together
- `bun run dev:frontend` or `bun run dev:backend` for one workspace
- `bun run build` to build backend and frontend
- `bun run test` to run backend Jest and frontend Vitest
- `bun run test:task1` through `bun run test:task8` for task-scoped backend checks
- `bun run check:quality` for the candidate-safe lint, typecheck, and unused-code gates

## Quality model

`main` is the candidate branch. Its quality checks ignore the task solution surface by comparing `frontend/src` and `backend/src` against the solution repo at:

`/Users/aviralsrivastava/Desktop/Sanity-Pipeline/linear-solution/coderepo-mern-linear-clone`

Override that location with `LINEAR_SOLUTION_REPO` if needed.

Candidate-facing exports are also pinned through:

- `candidate-contracts/candidate-backend-contract.js`
- `candidate-contracts/candidate-frontend-contract.js`

Run the strict whole-repo variants with:

- `bun run lint:strict`
- `bun run typecheck:strict`
- `bun run unused:check:strict`

## Clean reinstall

```bash
bun run clear
bun install
```
