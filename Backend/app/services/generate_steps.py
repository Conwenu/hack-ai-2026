import json
import uuid
from typing import List
from pydantic import BaseModel, Field

from app.services.llm_service import llm

class StepNode(BaseModel):
    id: str
    prevStep: List[str] = Field(default_factory=list)
    nextStep: List[str] = Field(default_factory=list)
    title: str
    subtitle: str
    text: str

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
        - title: short action-oriented phrase (e.g., 'Learn the Basics')
        - subtitle: a concise, complete sentence (15-20 words max) that provides context or clarifies the step
        - text: a half to full paragraph describing the step in detail, including why it's important and any key details
    
    The LLM decides how many steps are needed.
    
    Returns:
        {"steps": [StepNode, ...]}
    """

    prompt = f"""
Create a step-by-step plan to accomplish this goal.

Goal:
{goal}

Rules:
- Generate a reasonable number of steps.
- Steps must be ordered.
- Each step must start with an action verb.
- **Each step must be actionable, measurable, and specific:**
    * Actionable: The user can clearly perform the step.
    * Measurable: Include specific numbers, quantities, durations, frequencies, or checkpoints.
    * Specific: The user knows exactly what to do without guessing.
- **Avoid vague advice:** Do not use words like "try", "consider", "focus on", "be mindful of", or "aim to". Use direct, concrete language.
- **Do NOT include general tips or motivational filler.** Every sentence should contribute directly to the step's execution.
- **Maintain consistent specificity across all parts of the step.** If a step mentions a particular resource (e.g., a book, a course, a dataset), ensure that any other actions in the same step are equally specific. Avoid mixing hyper-specific instructions with vague ones.
- **Choose resource names wisely.** If you refer to a book, course, or tool, use a well-known, plausible example that matches the goal. If no single resource is standard, describe the type of resource (e.g., "a beginner-friendly machine learning book") rather than inventing a title.
- **Align title, subtitle, and text.** The title should capture the core action, the subtitle should provide a concise and concrete summary, and the text should elaborate with details - all three should be consistent in tone and specificity.

For each step, provide:
  * **title** - a short, action-oriented phrase (e.g., "Learn the Basics")
  * **subtitle** - a **concise, complete sentence** (maximum 15-20 words) that gives context or clarifies what the step entails; this should be a single sentence, not a paragraph.
  * **text** - a detailed description (half to one paragraph) explaining what the step involves, why it's important, and any key details. Ensure the description meets the actionable, measurable, and specific criteria, and avoids vague language and filler.

Return the steps as a JSON object with a "steps" array, each containing "title", "subtitle", and "text".
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
            title=step.title,
            subtitle=step.subtitle,
            text=step.text
        )
        if prev_id:
            nodes[-1].nextStep.append(node_id)
        nodes.append(node)
        prev_id = node_id

    return {"steps": [node.dict() for node in nodes]}