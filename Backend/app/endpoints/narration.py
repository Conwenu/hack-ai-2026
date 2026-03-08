from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.services import llm_service
from app.services import tts_service
from app.services.prompts import START_PROMPT, FORWARD_PROMPT, BACKWARD_PROMPT
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import re

router = APIRouter(prefix="/narration", tags=["narration"])

class TimelineStep(BaseModel):
    id: str
    index: int
    title: str
    subtitle: str
    fullText: str
    
class NarrationResponse(BaseModel):
    text: str
    audio_base64: Optional[str] = None
    
class NarrationRequest(BaseModel):
    current: TimelineStep
    previous: Optional[TimelineStep] = None

def determine_direction(current, previous):
    if previous is None:
        return "start"

    if current.index ==  previous.index + 1:
        return "forward"

    if current.index == previous.index - 1:
        return "backward"

    return "start"

PROMPT_MAP = {
    "start": START_PROMPT,
    "forward": FORWARD_PROMPT,
    "backward": BACKWARD_PROMPT,
}

def build_prompt(current, previous=None):

    direction = determine_direction(current, previous)

    template = PROMPT_MAP.get(direction)

    if not template:
        raise HTTPException(status_code=400, detail="Invalid direction")

    return template.format(
        title=current.title,
        subtitle=current.subtitle,
        text=current.fullText,
        prev_title=previous.title if previous else ""
    )
    
def extract_chunks(buffer):

    sentences = re.split(r'(?<=[.!?])\s+', buffer.strip())

    if len(sentences) > 1:
        return sentences[:-1], sentences[-1]

    # early chunk if text grows too long
    if len(buffer) > 120:
        idx = buffer.rfind(" ")

        if idx != -1:
            return [buffer[:idx]], buffer[idx+1:]

    return [], buffer

@router.post("/", response_model=NarrationResponse)
async def narrate(req: NarrationRequest):

    prompt = build_prompt(req.current, req.previous)

    narration_text = llm_service.generate_text(prompt)

    audio_b64 = tts_service.text_to_speech_base64(narration_text)

    return NarrationResponse(
        text=narration_text,
        audio_base64=audio_b64
    )

@router.post("/stream")
async def narrate_stream(req: NarrationRequest, request: Request):

    prompt = build_prompt(req.current, req.previous)

    async def event_generator():
        buffer = ""
        
        yield f"data: {json.dumps({'type': 'start'})}\n\n"
        yield "retry: 1500\n\n"

        async for chunk in llm_service.stream_text(prompt):
            
            if await request.is_disconnected():
                return

            buffer += chunk

            chunks, buffer = extract_chunks(buffer)

            for piece in chunks:
                
                if await request.is_disconnected():
                    return

                audio_b64 = await asyncio.to_thread(
                    tts_service.text_to_speech_base64,
                    piece
                )

                event = {
                    "type": "chunk",
                    "text": piece,
                    "audio": audio_b64
                }

                yield f"data: {json.dumps(event)}\n\n"

        if buffer.strip():

            audio_b64 = await asyncio.to_thread(
                tts_service.text_to_speech_base64,
                buffer
            )

            yield f"data: {json.dumps({'type':'chunk','text':buffer,'audio':audio_b64})}\n\n"

        yield "data: {\"type\":\"done\"}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={ "Cache-Control": "no-cache", "Connection": "keep-alive"})
