#!/bin/bash
# .claude-hooks-config.sh
# Place this file in your project root: /Users/ossieirondi/Projects/kamdental/dental-dashboard/.claude-hooks-config.sh

# =============================================================================
# PROJECT-SPECIFIC CLAUDE HOOKS CONFIGURATION
# =============================================================================
# This file allows you to override global hook settings for this specific project

# Global Control
export CLAUDE_HOOKS_ENABLED=true
export CLAUDE_HOOKS_ZERO_TOLERANCE=true  # Block ALL operations if ANY issues found
export CLAUDE_HOOKS_DEBUG=0              # Set to 1 for debug output

# Performance Settings
export CLAUDE_HOOKS_FAST_MODE=false      # Set to true to skip slow checks

# Language-specific enables (for TypeScript-only project)
export CLAUDE_HOOKS_TYPESCRIPT_ENABLED=true
export CLAUDE_HOOKS_GO_ENABLED=false     # Disable since you don't use Go
export CLAUDE_HOOKS_PYTHON_ENABLED=false # Disable since you don't use Python  
export CLAUDE_HOOKS_RUST_ENABLED=false   # Disable since you don't use Rust
export CLAUDE_HOOKS_NIX_ENABLED=false    # Disable since you don't use Nix

# TypeScript-specific settings
export CLAUDE_HOOKS_TYPESCRIPT_STRICT=true
export CLAUDE_HOOKS_API_STANDARDS=true
export CLAUDE_HOOKS_AUTO_ORGANIZE_IMPORTS=true

# Notification settings
export CLAUDE_HOOKS_NOTIFICATIONS=true
export CLAUDE_HOOKS_NTFY_ENABLED=false   # Set to true if you want push notifications

# Project-specific overrides
# Uncomment and modify as needed:

# export CLAUDE_HOOKS_FAIL_FAST=true     # Stop on first error
# export CLAUDE_HOOKS_SHOW_TIMING=true   # Show execution times
# export CLAUDE_HOOKS_MAX_FILE_SIZE=1048576  # Skip files larger than 1MB