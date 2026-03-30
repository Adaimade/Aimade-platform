import discord
from discord.ext import commands


class AgentClient(commands.Bot):

    def __init__(self, config: dict):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True

        super().__init__(
            command_prefix="!",
            intents=intents,
            help_command=None,
        )
        self.agent_config = config

    async def setup_hook(self):
        # Load cogs based on enabled skills
        skills = self.agent_config.get("skills", [])

        await self._load_cog("bot.cogs.base_cog")

        skill_cog_map = {
            "chat": "bot.cogs.chat_cog",
            "welcomer": "bot.cogs.welcomer_cog",
            "moderation": "bot.cogs.moderation_cog",
            "polls": "bot.cogs.polls_cog",
            "reminders": "bot.cogs.reminders_cog",
            "music": "bot.cogs.music_cog",
        }

        for skill in skills:
            cog_path = skill_cog_map.get(skill)
            if cog_path:
                await self._load_cog(cog_path)

        await self.tree.sync()

    async def _load_cog(self, cog_path: str):
        try:
            module = __import__(cog_path, fromlist=["setup"])
            await module.setup(self, self.agent_config)
            print(f"[bot] Loaded cog: {cog_path}")
        except Exception as e:
            print(f"[bot] Failed to load cog {cog_path}: {e}")

    async def on_ready(self):
        name = self.agent_config.get("agent_name", "AI Agent")
        print(f"[bot] {name} is online as {self.user}")
