import json
import uuid
from typing import List
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.1:8b", 
    temperature=0
)

class StepNode(BaseModel):
    id: str
    prevStep: List[str] = Field(default_factory=list)
    nextStep: List[str] = Field(default_factory=list)
    title: str

class Plan(BaseModel):
    steps: List[StepNode]

planner_llm = llm.with_structured_output(Plan)


def new_id() -> str:
    return str(uuid.uuid4())

def generate_initial_steps(goal: str) -> dict:
    """
    Generate initial actionable steps for a goal with graph schema.
    
    Each step is a node with:
        - id: unique identifier
        - prevStep: list of ids pointing to previous nodes
        - nextStep: list of ids pointing to next nodes
        - title: step description
    
    The LLM decides how many steps are needed.
    
    Returns:
        {"steps": [StepNode, ...]}
    """

    prompt = f"""
Create a step-by-step plan to accomplish this goal.

Goal:
{goal}

Rules:
- generate a reasonable number of steps (typically 4-6)
- steps must be ordered
- each step must start with an action verb
- avoid vague steps like 'do research'
- return only steps with a 'title' field
"""
    plan = planner_llm.invoke(prompt)

    nodes = []
    prev_id = None
    for step in plan.steps:
        node_id = new_id()
        node = StepNode(
            id=node_id,
            prevStep=[prev_id] if prev_id else [],
            nextStep=[],
            title=step.title
        )
        if prev_id:

            nodes[-1].nextStep.append(node_id)
        nodes.append(node)
        prev_id = node_id

    return {"steps": [node.dict() for node in nodes]}
