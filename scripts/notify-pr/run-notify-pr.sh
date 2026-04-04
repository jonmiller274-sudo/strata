#!/bin/bash
# run-notify-pr.sh — poll GitHub for new PRs and ping Jon via iMessage
#
# Runs every 2 minutes via launchd. Maintains a state file of PR numbers
# already seen. For each new open PR since the last check, sends an iMessage
# via scripts/ping-jon.sh.
#
# Triggered by: ~/Library/LaunchAgents/com.jonmiller.strata-notify-pr.plist
#
# Tier filter knob:
#   MIN_TIER below sets the minimum tier that triggers a notification.
#     0 = notify on every PR (loud; 100+/day at steady state)
#     1 = skip Tier 0 auto-merges (quieter)
#     2 = only PRs needing Jon's review (quietest signal)
#   Edit this line and reload the LaunchAgent to change behavior.
#
# Logs:
#   stdout -> scripts/notify-pr/notify-pr.log
#   stderr -> scripts/notify-pr/notify-pr-error.log
#
# Manual test:
#   /Users/JonMiller/strata/scripts/notify-pr/run-notify-pr.sh

set -euo pipefail

# ══════════════════════════════════════════════════════════════
# CONFIG — edit this value if iMessage volume is too high
MIN_TIER=0   # 0=all, 1=skip tier-0, 2=only tier-2+ (needing Jon review)
# ══════════════════════════════════════════════════════════════

REPO="jonmiller274-sudo/strata"
REPO_ROOT="/Users/JonMiller/strata"
STATE_DIR="$REPO_ROOT/scripts/notify-pr"
STATE_FILE="$STATE_DIR/seen-prs.txt"
PING_SCRIPT="$REPO_ROOT/scripts/ping-jon.sh"
LOG_PREFIX="[notify-pr $(date +%Y-%m-%dT%H:%M:%S%z)]"

mkdir -p "$STATE_DIR"

# Abort cleanly if gh not authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "$LOG_PREFIX gh not authenticated — aborting"
  exit 1
fi

# Get currently open PRs as JSON
CURRENT=$(gh pr list --repo "$REPO" --state open --limit 100 --json number,title,author,url,labels 2>/dev/null || echo "[]")
CURRENT_NUMBERS=$(echo "$CURRENT" | jq -r '.[].number')

# First run: baseline (don't ping for existing open PRs)
if [ ! -f "$STATE_FILE" ]; then
  echo "$CURRENT_NUMBERS" > "$STATE_FILE"
  COUNT=$(echo "$CURRENT_NUMBERS" | grep -c . || echo 0)
  echo "$LOG_PREFIX first run — baselined $COUNT open PRs, no notifications sent"
  exit 0
fi

# Find and notify new PRs
NOTIFIED=0
SKIPPED_TIER=0
for PR_NUM in $CURRENT_NUMBERS; do
  if ! grep -qx "$PR_NUM" "$STATE_FILE"; then
    # New PR — extract details
    PR_JSON=$(echo "$CURRENT" | jq -r --argjson n "$PR_NUM" '.[] | select(.number == $n)')
    TITLE=$(echo "$PR_JSON" | jq -r '.title')
    AUTHOR=$(echo "$PR_JSON" | jq -r '.author.login')
    URL=$(echo "$PR_JSON" | jq -r '.url')
    TIER_LABEL=$(echo "$PR_JSON" | jq -r '[.labels[]? | select(.name | startswith("tier-")) | .name] | .[0] // "untiered"')

    # Extract tier number for comparison (tier-0 -> 0, untiered -> 99)
    if [[ "$TIER_LABEL" =~ ^tier-([0-9])$ ]]; then
      TIER_NUM="${BASH_REMATCH[1]}"
    else
      TIER_NUM=99  # untiered PRs always notify (they're unusual and worth seeing)
    fi

    # Add to state regardless of whether we notify (so next run doesn't see it)
    echo "$PR_NUM" >> "$STATE_FILE"

    # Apply tier filter
    if [ "$TIER_NUM" -lt "$MIN_TIER" ]; then
      SKIPPED_TIER=$((SKIPPED_TIER + 1))
      echo "$LOG_PREFIX PR #$PR_NUM skipped (tier $TIER_NUM < MIN_TIER $MIN_TIER)"
      continue
    fi

    # Truncate long titles
    if [ ${#TITLE} -gt 80 ]; then
      TITLE="${TITLE:0:77}..."
    fi

    MSG="🔀 PR #$PR_NUM by @$AUTHOR ($TIER_LABEL): $TITLE"$'\n'"$URL"
    "$PING_SCRIPT" "$MSG" >/dev/null
    NOTIFIED=$((NOTIFIED + 1))
    echo "$LOG_PREFIX notified about PR #$PR_NUM ($TIER_LABEL)"
  fi
done

if [ "$NOTIFIED" -gt 0 ] || [ "$SKIPPED_TIER" -gt 0 ]; then
  echo "$LOG_PREFIX run complete — notified=$NOTIFIED skipped_by_tier=$SKIPPED_TIER"
fi
