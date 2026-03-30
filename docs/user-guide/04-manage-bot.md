# Step 4: Managing Your Bot

## Check Bot Status

Dashboard → Agents → your agent shows:
- **Live** (green) — bot is running
- **Failed** (red) — check logs for error
- **Stopped** — bot is offline

## Using Your Bot in Discord

**Chat skill** — mention your bot to talk to it:
```
@YourBot what's the weather today?
```

**Slash commands** — type `/` to see available commands:
- `/ping` — check if bot is online
- `/about` — info about the bot
- `/poll` — create a poll (if polls skill enabled)
- `/remind` — set a reminder (if reminders skill enabled)

## Stopping Your Bot

Agent detail page → **Stop** button. This shuts down the container on your cloud.

## Updating Your Bot

1. Edit your Agent settings (name, skills, personality)
2. Click **Redeploy** — builds a new container with updated settings

## Troubleshooting

**Bot not responding:**
- Check that Message Content Intent is enabled in Discord Developer Portal
- Check deployment logs for errors

**Bot offline:**
- Go to Dashboard → your Agent → click Logs
- Look for error messages in red

**Permission errors:**
- Make sure you enabled the correct permissions when adding bot to server
