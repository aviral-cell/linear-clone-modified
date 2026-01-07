#!/bin/bash

echo "Setting up Flow..."

# Start MongoDB if not already running
echo "Checking MongoDB status..."
if pgrep mongod > /dev/null; then
  echo "MongoDB is already running"
else
  echo "Starting MongoDB..."
  mongod --config /etc/mongod.conf --fork > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "MongoDB started successfully"
  else
    echo "Warning: Could not start MongoDB. Please ensure MongoDB is installed and configured."
  fi
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Setup complete!"
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""

