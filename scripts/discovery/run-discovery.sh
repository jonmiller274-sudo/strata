#!/bin/bash
# run-discovery.sh — entry point called by launchd every 2 hours at :50 past the hour
#
# This script launches a headless Claude Code session that executes the Discovery agent
# prompt at docs/agents/discovery-prompt.md. Discovery audits the Strata app from one
# angle per run and files new QR items to docs/quality-rubric.md — never touches src/.
#
# Triggered by: ~/Library/LaunchAgents/com.jonmiller.strata-discovery.plist
# Scheduled to fire at :50 past every even hour (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
# to avoid racing with the cloud Quality agent that runs at :00 every hour.
#
# Logs:
#   stdout -> /Users/JonMiller/strata/scripts/discovery/discovery.log
#   stderr -> /Users/JonMiller/strata/scripts/discovery/discovery-error.log
#
# Manual test:
#   /Users/JonMiller/strata/scripts/discovery/run-discovery.sh

set -euo pipefail

REPO_ROOT="/Users/JonMiller/strata"
PROMPT_FILE="$REPO_ROOT/docs/agents/discovery-prompt.md"
LOG_PREFIX="[discovery $(TZ="America/New_York" date +%Y-%m-%dT%H:%M:%S%z)]"

cd "$REPO_ROOT"

echo "$LOG_PREFIX starting Discovery run"

# Guard: abort cleanly if gh is not authenticated (launchd starts with a minimal env).
if ! gh auth status >/dev/null 2>&1; then
  echo "$LOG_PREFIX ERROR: gh CLI is not authenticated — aborting"
  exit 1
fi

# Pull latest main so the audit sees current state (Quality agent may have pushed new commits)
git checkout main
git pull --ff-only origin main || {
  echo "$LOG_PREFIX ERROR: git pull failed — aborting to avoid auditing stale code"
  exit 1
}

# Extract the pure prompt body from the markdown file (content between ``` markers).
# The discovery-prompt.md file has one code block containing the full agent prompt.
PROMPT_BODY=$(awk '/^```$/{p=!p;next}p' "$PROMPT_FILE")

if [ -z "$PROMPT_BODY" ]; then
  echo "$LOG_PREFIX ERROR: failed to extract prompt body from $PROMPT_FILE"
  exit 1
fi

# Launch headless Claude Code with the extracted prompt via stdin.
echo "$PROMPT_BODY" | claude --print

echo "$LOG_PREFIX Discovery run complete"
