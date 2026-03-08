import uuid
from typing import List
from pydantic import BaseModel, Field
from .llm_service import llm


class BranchStepNode(BaseModel):
    id: str
    prevStep: List[str] = Field(default_factory=list)
    nextStep: List[str] = Field(default_factory=list)
    title: str
    subtitle: str
    text: str


class BranchPlan(BaseModel):
    steps: List[BranchStepNode]


branch_planner_llm = llm.with_structured_output(BranchPlan)


def new_id() -> str:
    return str(uuid.uuid4())


def generate_branch_steps(
    branch_prompt: str,
    node_title: str,
    node_subtitle: str,
    node_text: str,
) -> dict:
    """
    Generate branch steps using ONLY the context of the node being branched from.
    Does NOT include information from parent/ancestor nodes.
    """

    prompt = f"""
Create a step-by-step plan to accomplish this sub-goal.

The user wants to branch from the following step and explore a specific direction.

Step Being Branched From:
  Title: {node_title}
  Summary: {node_subtitle}
  Details: {node_text}

User's Branch Goal:
{branch_prompt}

Rules:
- Generate a reasonable number of steps (typically 3-6) that address the branch goal.
- Steps must be ordered sequentially.
- Each step must start with an action verb.
- **Each step must be actionable, measurable, and specific:**
    * Actionable: The user can clearly perform the step.
    * Measurable: Include specific numbers, quantities, durations, frequencies, or checkpoints.
    * Specific: The user knows exactly what to do without guessing.
- **Avoid vague advice:** Do not use words like "try", "consider", "focus on", "be mindful of", or "aim to". Use direct, concrete language.
- **Do NOT include general tips or motivational filler.** Every sentence should contribute directly to the step's execution.
- **Align title, subtitle, and text.** The title should capture the core action, the subtitle should provide a concise and concrete summary, and the text should elaborate with details.
- The branch steps should be self-contained — they explore the sub-goal without requiring context from steps above or below the branched node.

For each step, provide:
  * **title** - a short, action-oriented phrase (e.g., "Learn the Basics")
  * **subtitle** - a **concise, complete sentence** (maximum 15-20 words) that gives context or clarifies what the step entails.
  * **text** - a detailed description (half to one paragraph) explaining what the step involves, why it's important, and any key details.

Return the steps as a JSON object with a "steps" array, each containing "title", "subtitle", and "text".
"""

    plan = branch_planner_llm.invoke(prompt)

    nodes = []
    prev_id = None
    for step in plan.steps:
        node_id = new_id()
        node = BranchStepNode(
            id=node_id,
            prevStep=[prev_id] if prev_id else [],
            nextStep=[],
            title=step.title,
            subtitle=step.subtitle,
            text=step.text,
        )
        if prev_id:
            nodes[-1].nextStep.append(node_id)
        nodes.append(node)
        prev_id = node_id

    return {"steps": [node.dict() for node in nodes]}