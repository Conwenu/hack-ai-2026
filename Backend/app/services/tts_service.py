import os  
import base64  
from elevenlabs import ElevenLabs, VoiceSettings  
from dotenv import load_dotenv  
  
load_dotenv()  
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  
if not ELEVENLABS_API_KEY:  
    raise ValueError("ELEVENLABS_API_KEY environment variable is not set.")  
  
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)  

def humanize(text: str):
    text = text.replace(". ", ".\n\n")
    text = text.replace("—", "\n— ")
    return text
  
def text_to_speech_base64(text: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb") -> str:
    """Generate speech and return base64-encoded MP3."""

    audio_generator = client.text_to_speech.convert(
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