# Step 3: Deploy Your Bot to Discord

## Before You Start

You need a Discord Bot Token. Here's how to get one:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it
3. Go to **Bot** → click **Add Bot**
4. Under Token, click **Reset Token** → copy it
5. Under **Privileged Gateway Intents**, enable:
   - Server Members Intent
   - Message Content Intent
6. Go to **OAuth2 → URL Generator**
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`
7. Copy the generated URL → open it → add bot to your server

## Deploy

1. In Adaimade, go to your Agent → click **Deploy**
2. Choose your cloud provider
3. Paste your Discord Bot Token
4. Click **Deploy**
5. Watch the live deployment logs
6. When you see **"Discord bot is now online"** — you're done!

## What happens behind the scenes

1. Platform builds a Docker image with your AI settings
2. Pushes to a container registry
3. Deploys to your cloud account
4. Bot connects to Discord using your token

The entire process takes about 30-60 seconds.

## Next Step

→ [Manage Your Bot](./04-manage-bot.md)
