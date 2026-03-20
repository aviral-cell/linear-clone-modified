#!/usr/bin/env bash

set -uo pipefail

task="${1:-}"

if [[ -z "$task" ]]; then
  echo "Usage: $0 <task-name>" >&2
  exit 1
fi

backend_test="backend/test/${task}/app.spec.js"
backend_jest="backend/node_modules/.bin/jest"

if [[ ! -f "$backend_test" ]]; then
  echo "No tests found for ${task}" >&2
  exit 1
fi

if [[ ! -x "$backend_jest" ]]; then
  echo "Backend test dependencies are not installed. Run bun install first." >&2
  exit 1
fi

mkdir -p output
(
  cd backend || exit 1
  JEST_JUNIT_OUTPUT_DIR=../output JEST_JUNIT_OUTPUT_NAME="${task}.xml" \
    NODE_OPTIONS=--experimental-vm-modules \
    ./node_modules/.bin/jest \
      --config jest.config.cjs \
      --runInBand \
      --runTestsByPath "test/${task}/app.spec.js" \
      --reporters=default \
      --reporters=jest-junit \
      --passWithNoTests
)
