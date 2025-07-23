#!/bin/bash
# Runs Biome with the appropriate config based on current branch

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Determine which config to use
if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "develop" ]]; then
  CONFIG="biome.json"
  echo "🔒 Using strict config for $BRANCH branch"
else
  CONFIG="biome.feature.json"
  echo "🔧 Using relaxed config for feature branch: $BRANCH"
fi

# Run Biome with the appropriate config
echo "Running: biome check --config-path=$CONFIG ."
pnpm biome check --config-path="$CONFIG" .