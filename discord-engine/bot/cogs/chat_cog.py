import discord
from discord.ext import commands
from collections import defaultdict

from ..ai.llm_client import chat
from ..ai.personality import build_system_prompt


class ChatCog(commands.Cog):
    """Skill: AI-powered conversation. Responds when mentioned."""

    def __init__(self, bot: commands.Bot, config: dict):
        self.bot = bot
        self.config = config
        self.system_prompt = build_system_prompt(
            config.get("personality", {}),
            config.get("agent_name", "AI Assistant"),
        )
        llm = config.get("llm", {})
        self.llm_provider = llm.get("provider", "openai")
        self.llm_model    = llm.get("model", "gpt-4o")
        # Per-channel conversation history (last 10 messages)
        self.history: dict[int, list[dict]] = defaultdict(list)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return
        if self.bot.user not in message.mentions and not isinstance(message.channel, discord.DMChannel):
            return

        content = message.content.replace(f"<@{self.bot.user.id}>", "").strip()
        if not content:
            return

        channel_id = message.channel.id
        self.history[channel_id].append({"role": "user", "content": content})

        async with message.channel.typing():
            try:
                response = await chat(
                    messages=self.history[channel_id][-10:],
                    system_prompt=self.system_prompt,
                    provider=self.llm_provider,
                    model=self.llm_model,
                )
                self.history[channel_id].append({"role": "assistant", "content": response})
                # Trim history
                if len(self.history[channel_id]) > 20:
                    self.history[channel_id] = self.history[channel_id][-20:]
            except Exception as e:
                response = f"Sorry, I encountered an error: {e}"

        await message.reply(response)


async def setup(bot: commands.Bot, config: dict):
    await bot.add_cog(ChatCog(bot, config))
