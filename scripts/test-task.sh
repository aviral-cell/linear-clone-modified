#!/usr/bin/env bash

set -uo pipefail

task="${1:-}"

if [[ -z "$task" ]]; then
  echo "Usage: $0 <task-name>" >&2
  exit 1
fi

backend_path="backend/test/${task}"
frontend_path="frontend/__tests__/${task}"
ran_any=false
commands=()
names=()

if [[ -d "$backend_path" ]]; then
  ran_any=true
  commands+=("cd backend && NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --config jest.config.cjs --runInBand --runTestsByPath test/${task}/app.spec.js --passWithNoTests")
  names+=("backend")
fi

if [[ -d "$frontend_path" ]]; then
  ran_any=true
  commands+=("vitest run --project frontend ${frontend_path}/")
  names+=("frontend")
fi

if [[ "$ran_any" == false ]]; then
  echo "No tests found for ${task}" >&2
  exit 1
fi

if [[ "${#commands[@]}" -eq 1 ]]; then
  bash -lc "${commands[0]}"
  exit $?
fi

name_list="$(IFS=,; echo "${names[*]}")"
concurrently --names "$name_list" "${commands[@]}"
