import os
from typing import AsyncIterator


async def chat(
    messages: list[dict],
    system_prompt: str,
    provider: str = None,
    model: str = None,
) -> str:
    provider = provider or os.environ.get("LLM_PROVIDER", "openai")
    model = model or os.environ.get("LLM_MODEL", "gpt-4o")
    api_key = os.environ.get("LLM_API_KEY", "")

    if provider == "openai":
        return await _openai_chat(messages, system_prompt, model, api_key)
    elif provider == "gemini":
        return await _gemini_chat(messages, system_prompt, model, api_key)
    elif provider == "anthropic":
        return await _anthropic_chat(messages, system_prompt, model, api_key)
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


async def _openai_chat(messages, system_prompt, model, api_key) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=api_key)
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    response = await client.chat.completions.create(model=model, messages=full_messages)
    return response.choices[0].message.content


async def _gemini_chat(messages, system_prompt, model, api_key) -> str:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    gemini = genai.GenerativeModel(model, system_instruction=system_prompt)
    history = [
        {"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]}
        for m in messages[:-1]
    ]
    chat = gemini.start_chat(history=history)
    response = await chat.send_message_async(messages[-1]["content"])
    return response.text


async def _anthropic_chat(messages, system_prompt, model, api_key) -> str:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model=model,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text
