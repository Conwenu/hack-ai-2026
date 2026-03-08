import os
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

LLM_BACKEND = os.getenv("LLM_BACKEND", "gemini")  # "gemini" (default) or "ollama"

if LLM_BACKEND == "ollama":
    from langchain_ollama import ChatOllama
    llm = ChatOllama(
        model="llama3.1:8b",
        callbacks=[StreamingStdOutCallbackHandler()],
        temperature=0.7
    )
else:
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )


def generate_text(prompt: str) -> str:
    response = llm.invoke(prompt)
    if hasattr(response, 'content'):
        return response.content
    return str(response)

     
async def stream_text(prompt: str):
    """Async generator that yields text chunks as strings."""
    async for chunk in llm.astream(prompt):
        if hasattr(chunk, 'content'):
            yield chunk.content
        else:
            yield str(chunk)