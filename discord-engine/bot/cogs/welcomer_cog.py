import discord
from discord.ext import commands


class WelcomerCog(commands.Cog):
    """Skill: Custom welcome messages for new members."""

    def __init__(self, bot: commands.Bot, config: dict):
        self.bot = bot
        self.config = config
        name = config.get("agent_name", "AI Assistant")
        self.welcome_message = f"Welcome to the server! I'm {name}, your AI assistant. Feel free to mention me anytime!"

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        channel = member.guild.system_channel
        if channel:
            embed = discord.Embed(
                description=f"👋 {self.welcome_message}",
                color=0x0ea5e9,
            )
            embed.set_author(name=str(member), icon_url=member.display_avatar.url)
            await channel.send(embed=embed)


async def setup(bot: commands.Bot, config: dict):
    await bot.add_cog(WelcomerCog(bot, config))
