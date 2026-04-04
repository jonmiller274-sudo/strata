#!/bin/bash
# run-director.sh — entry point called by launchd every morning at 07:00 America/New_York
#
# This script launches a headless Claude Code session that executes the Director agent
# prompt at docs/agents/director-prompt.md. The session's single output is a daily digest
# markdown file and a corresponding GitHub issue.
#
# Triggered by: ~/Library/LaunchAgents/com.jonmiller.strata-director.plist
#
# Logs:
#   stdout -> /Users/JonMiller/strata/scripts/director/director.log
#   stderr -> /Users/JonMiller/strata/scripts/director/director-error.log
#
# Manual test:
#   /Users/JonMiller/strata/scripts/director/run-director.sh

set -euo pipefail

REPO_ROOT="/Users/JonMiller/strata"
PROMPT_FILE="$REPO_ROOT/docs/agents/director-prompt.md"
TODAY_ET=$(TZ="America/New_York" date +%Y-%m-%d)
LOG_PREFIX="[director $(TZ="America/New_York" date +%Y-%m-%dT%H:%M:%S%z)]"

cd "$REPO_ROOT"

echo "$LOG_PREFIX starting Director run for $TODAY_ET"

# Guard: do not run the Director twice in a single day. If today's digest already
# exists, skip — this prevents accidental duplicate GitHub issues if launchd retries.
if [ -f "$REPO_ROOT/docs/digest/$TODAY_ET.md" ]; then
  echo "$LOG_PREFIX digest for $TODAY_ET already exists — skipping"
  exit 0
fi

# Guard: abort cleanly if gh is not authenticated (launchd starts with a minimal env).
if ! gh auth status >/dev/null 2>&1; then
  echo "$LOG_PREFIX ERROR: gh CLI is not authenticated — aborting"
  exit 1
fi

# Launch a headless Claude Code session. --print runs non-interactively, reads the
# prompt from stdin, and exits when the agent is done. The Director prompt itself
# tells the agent to stop after producing the digest + issue.
claude --print < "$PROMPT_FILE"

echo "$LOG_PREFIX Director run for $TODAY_ET complete"
