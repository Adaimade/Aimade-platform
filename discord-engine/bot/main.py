import os
import asyncio
from dotenv import load_dotenv
from .config_loader import load_agent_config
from .client import AgentClient


async def main():
    load_dotenv()

    config = load_agent_config()
    token = os.environ.get("DISCORD_BOT_TOKEN")

    if not token:
        raise ValueError("DISCORD_BOT_TOKEN environment variable is required")

    bot = AgentClient(config)
    async with bot:
        await bot.start(token)


if __name__ == "__main__":
    asyncio.run(main())
