def build_system_prompt(personality: dict, agent_name: str) -> str:
    tone = personality.get("tone", "friendly")
    verbosity = personality.get("verbosity", "concise")
    emoji = personality.get("emoji", True)
    custom = personality.get("custom_instructions", "")

    tone_desc = {
        "casual": "You are casual and relaxed. Use informal language.",
        "formal": "You are formal and professional. Use polished language.",
        "friendly": "You are warm, approachable, and helpful.",
        "professional": "You are professional and precise.",
    }.get(tone, "You are helpful.")

    verbosity_desc = {
        "concise": "Keep responses brief and to the point.",
        "detailed": "Provide thorough, detailed responses.",
    }.get(verbosity, "Keep responses concise.")

    emoji_desc = "You may use emojis to enhance your messages." if emoji else "Do not use emojis."

    parts = [
        f"You are {agent_name}, a helpful Discord assistant.",
        tone_desc,
        verbosity_desc,
        emoji_desc,
    ]

    if custom:
        parts.append(custom)

    return " ".join(parts)
