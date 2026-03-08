import os  
import base64
import random
from dotenv import load_dotenv  
  
load_dotenv()  
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  

# Gracefully degrade — client only initialises if key is present
_client = None
if ELEVENLABS_API_KEY:
    try:
        from elevenlabs import ElevenLabs, VoiceSettings  
        _client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    except Exception:
        _client = None


def humanize(text: str):
    text = text.replace(". ", ".\n\n")
    text = text.replace("—", "\n— ")
    return text

voice_ids = ["PawMsb9h2MWDsRgzCXzT", "Q0Et7LOU7VpeoeCRQAVS"]

  
def text_to_speech_base64(text: str) -> str | None:
    """Generate speech and return base64-encoded MP3, or None if TTS is unavailable."""

    if _client is None:
        return None

    from elevenlabs import VoiceSettings
    
    voice_id = random.choice(voice_ids)
    
    audio_generator = _client.text_to_speech.convert(
        text=humanize(text),
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.38,
            similarity_boost=0.78,
            style=0.28,
            use_speaker_boost=True
        )
    )

    audio_bytes = b"".join(audio_generator)

    return base64.b64encode(audio_bytes).decode("utf-8")