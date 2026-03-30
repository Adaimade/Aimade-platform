import discord
from discord.ext import commands
from discord import app_commands


class BaseCog(commands.Cog):
    """Always-on: /ping, /help, /about"""

    def __init__(self, bot: commands.Bot, config: dict):
        self.bot = bot
        self.config = config

    @app_commands.command(name="ping", description="Check if the bot is online")
    async def ping(self, interaction: discord.Interaction):
        await interaction.response.send_message(
            f"Pong! Latency: {round(self.bot.latency * 1000)}ms"
        )

    @app_commands.command(name="about", description="About this AI agent")
    async def about(self, interaction: discord.Interaction):
        name = self.config.get("agent_name", "AI Assistant")
        skills = ", ".join(self.config.get("skills", []))
        embed = discord.Embed(
            title=f"About {name}",
            description=f"I'm an AI agent deployed via Adaimade.",
            color=0x0ea5e9,
        )
        embed.add_field(name="Skills", value=skills or "None", inline=False)
        await interaction.response.send_message(embed=embed)


async def setup(bot: commands.Bot, config: dict):
    await bot.add_cog(BaseCog(bot, config))
