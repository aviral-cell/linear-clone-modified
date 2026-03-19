#!/usr/bin/env bash

set -u

MODE="${1:---seed}"

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

install_dependencies() {
  echo "Installing workspace dependencies with Bun..."
  bun install
}

seed_database() {
  if ! ensure_mongo_running; then
    echo "Skipping seed because MongoDB is unavailable"
    return 0
  fi

  echo "Seeding database..."
  (cd backend && bun run seed)
}

case "$MODE" in
  --seed)
    install_dependencies
    seed_database
    ;;
  --ensure-seeded)
    if [ -d node_modules ] && [ -d backend/node_modules ] && [ -d frontend/node_modules ]; then
      echo "Dependencies already installed"
    else
      install_dependencies
    fi
    seed_database
    ;;
  --start)
    ensure_mongo_running || true
    ;;
  *)
    echo "Usage: $0 [--seed|--ensure-seeded|--start]" >&2
    exit 1
    ;;
esac

echo "Setup complete"
