from fastapi import APIRouter
from pydantic import BaseModel
from ..services.generate_steps import generate_initial_steps

router = APIRouter(tags=["generate_steps"])

class GoalRequest(BaseModel):
    goal: str

@router.post("/generate-steps")
def generate_steps(req: GoalRequest):
    steps = generate_initial_steps(req.goal)
    return steps