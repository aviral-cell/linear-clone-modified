#!/usr/bin/env bash

set -u

MODE="${1:---seed}"
STATE_DIR=".cache"
STATE_FILE="$STATE_DIR/workflow-seed-signature"
SEED_ENTRYPOINT="backend/src/utils/seed.js"
SEED_ROOT="backend/src/utils/seeders"
BACKEND_ENV_FILE="backend/.env"
BACKEND_ENV_EXAMPLE="backend/.env.example"
FRONTEND_ENV_FILE="frontend/.env"
FRONTEND_ENV_EXAMPLE="frontend/.env.example"

echo "Setting up Workflow..."

ensure_mongo_running() {
  echo "Checking MongoDB status..."
  if pgrep mongod >/dev/null 2>&1; then
    echo "MongoDB is already running"
    return 0
  fi

  if ! command -v mongod >/dev/null 2>&1; then
    echo "Warning: mongod is not installed; skipping MongoDB startup"
    return 1
  fi

  echo "Starting MongoDB..."
  mongod --config /etc/mongod.conf --fork >/dev/null 2>&1
  if pgrep mongod >/dev/null 2>&1; then
    echo "MongoDB started successfully"
    return 0
  fi

  echo "Warning: Could not start MongoDB automatically"
  return 1
}

ensure_env_files() {
  if [ ! -f "$BACKEND_ENV_FILE" ]; then
    cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV_FILE"
  fi

  if [ ! -f "$FRONTEND_ENV_FILE" ]; then
    cp "$FRONTEND_ENV_EXAMPLE" "$FRONTEND_ENV_FILE"
  fi
}

get_mongodb_uri() {
  if [ ! -f "$BACKEND_ENV_FILE" ]; then
    printf '%s\n' "mongodb://127.0.0.1:27017/workflow_db?directConnection=true&serverSelectionTimeoutMS=2000"
    return 0
  fi

  local mongodb_uri
  mongodb_uri="$(sed -n 's/^MONGODB_URI=//p' "$BACKEND_ENV_FILE" | tail -n 1)"

  if [ -n "$mongodb_uri" ]; then
    printf '%s\n' "$mongodb_uri"
    return 0
  fi

  printf '%s\n' "mongodb://127.0.0.1:27017/workflow_db?directConnection=true&serverSelectionTimeoutMS=2000"
}

get_seed_source_hash() {
  {
    if [ -f "$SEED_ENTRYPOINT" ]; then
      printf '%s\n' "$SEED_ENTRYPOINT"
      cat "$SEED_ENTRYPOINT"
    fi

    if [ -d "$SEED_ROOT" ]; then
      while IFS= read -r file_path; do
        printf '%s\n' "$file_path"
        cat "$file_path"
      done < <(find "$SEED_ROOT" -type f | sort)
    fi
  } | shasum -a 256 | awk '{print $1}'
}

get_seed_signature() {
  local mongodb_uri
  local seed_hash

  mongodb_uri="$(get_mongodb_uri)"
  seed_hash="$(get_seed_source_hash)"

  printf '%s\n%s\n' "$mongodb_uri" "$seed_hash" | shasum -a 256 | awk '{print $1}'
}

record_seed_signature() {
  mkdir -p "$STATE_DIR"
  get_seed_signature >"$STATE_FILE"
}

should_seed() {
  local current_signature
  current_signature="$(get_seed_signature)"

  if [ ! -f "$STATE_FILE" ]; then
    return 0
  fi

  local previous_signature
  previous_signature="$(cat "$STATE_FILE")"

  if [ "$current_signature" != "$previous_signature" ]; then
    return 0
  fi

  return 1
}

run_seed() {
  echo "Seeding database..."
  (cd backend && bun run seed)
  if [ $? -ne 0 ]; then
    echo "Warning: Database seeding failed. The application may start with an empty database."
    return 1
  fi

  record_seed_signature

  echo "Setup complete!"
  echo ""
  echo "Login credentials:"
  echo "  Email: alice@workflow.dev"
  echo "  Password: Password@123"
  echo ""
  echo "To start the application, run:"
  echo "  bun start"
  echo ""

  return 0
}

ensure_mongo_running
ensure_env_files

if [ "$MODE" = "--start" ]; then
  echo "Startup checks complete."
  exit 0
fi

if [ "$MODE" = "--ensure-seeded" ]; then
  if should_seed; then
    run_seed
  else
    echo "Seed unchanged. Skipping database seed."
  fi
  exit 0
fi

if [ "$MODE" = "--seed" ]; then
  run_seed
  exit 0
fi

echo "Unknown setup mode: $MODE"
exit 1
