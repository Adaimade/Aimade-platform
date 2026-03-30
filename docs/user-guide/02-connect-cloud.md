# Step 2: Connect Your Cloud Account

Your AI runs on **your own cloud account** — not ours. You control it.

## Cloudflare (Recommended for beginners)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. My Profile → API Tokens → Create Token
3. Use template: **Edit Cloudflare Workers**
4. Copy the token
5. Find your Account ID on the right sidebar of your Cloudflare dashboard
6. In Adaimade: Cloud Accounts → Connect → Cloudflare
7. Paste API Token + Account ID → Connect

## Zeabur

1. Go to [zeabur.com](https://zeabur.com) → Dashboard
2. Settings → Developer → Generate API Token
3. In Adaimade: Cloud Accounts → Connect → Zeabur
4. Paste token → Connect

## AWS

1. Go to IAM in AWS Console
2. Create a new user with programmatic access
3. Attach policy: `AmazonEC2ContainerRegistryFullAccess` + `AWSLambda_FullAccess`
4. Copy Access Key ID + Secret Access Key
5. In Adaimade: Cloud Accounts → Connect → AWS
6. Paste credentials + choose region → Connect

## Next Step

→ [Deploy Your Bot](./03-deploy-bot.md)
