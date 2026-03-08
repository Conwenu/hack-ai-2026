from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..services.generate_tasks import generate_tasks, StepNode

router = APIRouter(tags=["generate_tasks"])


class TaskStepNode(BaseModel):
    id: str
    prevStep: List[str] = []
    nextStep: List[str] = []
    title: str
    subtitle: str
    text: str


class GenerateTasksRequest(BaseModel):
    targetId: str
    steps: List[TaskStepNode]


@router.post("/generate-tasks")
def generate_tasks_endpoint(req: GenerateTasksRequest):
    # Convert Pydantic models to StepNode for the service function
    step_nodes = [
        StepNode(
            id=step.id,
            prevStep=step.prevStep,
            nextStep=step.nextStep,
            title=step.title,
            subtitle=step.subtitle,
            text=step.text
        )
        for step in req.steps
    ]
    
    try:
        tasks = generate_tasks(req.targetId, step_nodes)
        return tasks
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
