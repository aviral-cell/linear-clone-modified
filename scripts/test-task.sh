#!/usr/bin/env bash

set -uo pipefail

task="${1:-}"

if [[ -z "$task" ]]; then
  echo "Usage: $0 <task-name>" >&2
  exit 1
fi

backend_path="backend/test/${task}"
frontend_path="frontend/__tests__/${task}"
commands=()
names=()
has_backend=false
has_frontend=false

if [[ -d "$backend_path" ]]; then
  has_backend=true
  commands+=("cd backend && NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --config jest.config.cjs --runInBand --runTestsByPath test/${task}/app.spec.js --passWithNoTests")
  names+=("backend")
fi

if [[ -d "$frontend_path" ]]; then
  has_frontend=true
  commands+=("vitest run --project frontend ${frontend_path}/")
  names+=("frontend")
fi

if [[ "$has_backend" == false && "$has_frontend" == false ]]; then
  echo "No tests found for ${task}" >&2
  exit 1
fi

if [[ "$has_backend" == true && "$has_frontend" == false ]]; then
  cd backend || exit 1
  exec env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest \
    --config jest.config.cjs \
    --runInBand \
    --runTestsByPath "test/${task}/app.spec.js" \
    --passWithNoTests
fi

if [[ "$has_frontend" == true && "$has_backend" == false ]]; then
  exec vitest run --project frontend "${frontend_path}/"
fi

name_list="$(IFS=,; echo "${names[*]}")"
concurrently --names "$name_list" "${commands[@]}"
