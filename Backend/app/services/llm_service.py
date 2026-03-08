import os
from langchain_ollama import ChatOllama
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Use environment variable to switch between local and production
LLM_BACKEND = os.getenv("LLM_BACKEND", "ollama")  # "ollama" or "gemini"

if LLM_BACKEND == "ollama":
    llm = ChatOllama(
        model="llama3.1:8b",
        callbacks=[StreamingStdOutCallbackHandler()],
        temperature=0.7
    )
else:
    # For Gemini you'd use langchain-google-genai or direct API
    # This is a placeholder
    from langchain_google_genai import ChatGoogleGenerativeAI
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7,)
    

def generate_text(prompt: str) -> str:
    response = llm.invoke(prompt)
    # If it's an AIMessage, get its content
    if hasattr(response, 'content'):
        return response.content
    # Otherwise, convert to string
    return str(response)
     
async def stream_text(prompt: str):
    """Async generator that yields text chunks as strings."""
    async for chunk in llm.astream(prompt):
        # LangChain message chunks have a 'content' attribute
        if hasattr(chunk, 'content'):
            yield chunk.content
        else:
            # Fallback in case it's already a string
            yield str(chunk)