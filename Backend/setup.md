# Backend Setup

## Prerequisites

- A Google account
- An ElevenLabs account
- Ollama w/llama3.1:8b (for local testing/development)

#### **goto Backend**
```bash
cd Backend/
```

#### **Create .env file**
```bash
copy .env.example .env
```

## API secrets

#### **Obtain a Google AI API key**
- Sign in [mlh.link/aistudio](https://mlh.link/aistudio) or directly go to [https://aistudio.google.com](https://aistudio.google.com)

#### **Configure Environment Variables** (.env)
```md
# api
## Google AI Studio
GOOGLE_API_KEY='INSERT_GOOGLE_API_KEY'
## ElevenLabs
ELEVENLABS_API_KEY='INSERT_ELEVENLABS_API_KEY'

## config
#LLM_BACKEND="ollama"
LLM_BACKEND="gemini"
```

## Environment (run once)
```bash
uv init
uv add -r requirements.txt
```

## Run
```bash
uv run --env-file .env uvicorn app.main:app --reload
```

## Notes

- ...
