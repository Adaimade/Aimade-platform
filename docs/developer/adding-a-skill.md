# How to Add a New Bot Skill

## 1. Create the Cog

Create `discord-engine/bot/cogs/yourskill_cog.py`:

```python
import discord
from discord.ext import commands
from discord import app_commands


class YourSkillCog(commands.Cog):
    """Skill: Description of what this skill does."""

    def __init__(self, bot: commands.Bot, config: dict):
        self.bot = bot
        self.config = config

    @app_commands.command(name="yourcommand", description="What it does")
    async def your_command(self, interaction: discord.Interaction):
        await interaction.response.send_message("Hello!")


async def setup(bot: commands.Bot, config: dict):
    await bot.add_cog(YourSkillCog(bot, config))
```

## 2. Register in Client

In `discord-engine/bot/client.py`, add to `skill_cog_map`:

```python
skill_cog_map = {
    ...
    "yourskill": "bot.cogs.yourskill_cog",
}
```

## 3. Add to Frontend Skill List

In `frontend/src/components/agents/AgentForm.tsx`:

```tsx
const SKILLS = [
  ...
  { id: "yourskill", label: "Your Skill", description: "What it does" },
]
```

## 4. Add Skill Requirements (if needed)

Create `agent-templates/skills/yourskill.txt`:

```
# pip packages required for this skill
some-package==1.0.0
```

That's all — the deployment engine automatically merges these requirements.
