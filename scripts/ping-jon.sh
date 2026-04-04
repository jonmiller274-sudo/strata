#!/bin/bash
# ping-jon.sh — send an iMessage to Jon via macOS Messages.app
#
# Usage:
#   ./scripts/ping-jon.sh "Your message here"
#   echo "Your message" | ./scripts/ping-jon.sh
#
# Requirements:
#   - Messages.app logged into iMessage on this Mac
#   - osascript automation permission (System Settings > Privacy > Automation > Terminal/iTerm > Messages)
#
# Used by: Director agent daily digest, manual Claude Code pings during autonomous work
# Handle: +19144060971 (Jon's phone — iMessage only, not SMS)

set -e

JON_HANDLE="+19144060971"

# Read from arg or stdin
if [ -n "$1" ]; then
  MSG="$1"
else
  MSG=$(cat)
fi

if [ -z "$MSG" ]; then
  echo "Error: no message provided" >&2
  echo "Usage: $0 \"message\"  OR  echo \"message\" | $0" >&2
  exit 1
fi

# Escape double quotes for AppleScript
ESCAPED=$(printf '%s' "$MSG" | sed 's/"/\\"/g')

osascript <<EOF
tell application "Messages"
    set targetService to 1st service whose service type = iMessage
    set targetBuddy to buddy "$JON_HANDLE" of targetService
    send "$ESCAPED" to targetBuddy
end tell
EOF

echo "✓ Pinged Jon: $MSG"
