#!/usr/bin/env bash

set -uo pipefail

task="${1:-}"

if [[ -z "$task" ]]; then
  echo "Usage: $0 <task-name>" >&2
  exit 1
fi

backend_test="backend/test/${task}/app.spec.js"

if [[ ! -f "$backend_test" ]]; then
  echo "No tests found for ${task}" >&2
  exit 1
fi

mkdir -p output
JEST_JUNIT_OUTPUT_DIR=../output JEST_JUNIT_OUTPUT_NAME="${task}.xml" \
  bash -lc "cd backend && bun run test:junit -- test/${task}/app.spec.js"
