import json
import uuid
from typing import List, Optional
from pydantic import BaseModel, Field

from app.services.llm_service import llm

class StepNode(BaseModel):
    id: str
    prevStep: List[str] = Field(default_factory=list)
    nextStep: List[str] = Field(default_factory=list)
    title: str
    subtitle: str
    text: str

class TaskNode(BaseModel):
    id: str
    prevStep: List[str] = Field(default_factory=list)
    nextStep: List[str] = Field(default_factory=list)
    title: str
    subtitle: str
    text: str

class TaskPlan(BaseModel):
    tasks: List[TaskNode]

task_planner_llm = llm.with_structured_output(TaskPlan)


def new_id() -> str:
    return str(uuid.uuid4())


def generate_tasks(user_input: str, target_id: str, steps: List[StepNode]) -> dict:
    """
    Generate initial actionable steps for a goal with graph schema.
    
    Each step is a node with:
        - id: unique identifier
        - prevStep: list of ids pointing to previous nodes
        - nextStep: list of ids pointing to next nodes
        - title: short action-oriented phrase
        - subtitle: a concise, complete sentence (15-20 words max) that provides context or clarifies the step
        - text: a half to full paragraph describing the step in detail, including why it's important and any key details
    
    The LLM decides how many steps are needed.
    
    Args:
        user_input: The original user prompt/goal that initiated this task generation
        target_id: The ID of the step to generate tasks for
        steps: List of all steps in the plan (for context)
    
    Returns:
        {"tasks": [TaskNode, ...]}
    """

    # Find the target step
    target_step = None
    step_index = -1
    for i, step in enumerate(steps):
        if step.id == target_id:
            target_step = step
            step_index = i
            break
    
    if not target_step:
        raise ValueError(f"Step with id {target_id} not found")
    
    # Build context: include previous and next steps for context
    context_parts = []
    if step_index > 0:
        prev_step = steps[step_index - 1]
        context_parts.append(f"Previous step: {prev_step.title} - {prev_step.subtitle}")
    
    context_parts.append(f"Current step: {target_step.title} - {target_step.subtitle} - {target_step.text}")
    
    if step_index < len(steps) - 1:
        next_step = steps[step_index + 1]
        context_parts.append(f"Next step: {next_step.title} - {next_step.subtitle}")
    
    context = "\n".join(context_parts)

    prompt = f"""
Break down the current step into more atomic, actionable tasks, keeping the user's original goal in mind.

User's Original Goal:
{user_input}

{context}

Rules:
- Generate a reasonable number of tasks that break down the step into executable sub-tasks.
- Each task must start with an action verb.
- **Each task must be actionable, measurable, and specific:**
    * Actionable: The user can clearly perform the task.
    * Measurable: Include specific numbers, quantities, durations, frequencies, or checkpoints.
    * Specific: The user knows exactly what to do without guessing.
- **Avoid vague advice:** Do not use words like "try", "consider", "focus on", "be mindful of", or "aim to". Use direct, concrete language.
- **Do NOT include general tips or motivational filler.** Every sentence should contribute directly to the task's execution.
- **Do NOT conclude with a review or reflection task unless explicitly included in the step.**
- **Align title, subtitle, and text.** The title should capture the core action, the subtitle should provide a concise and concrete summary, and the text should elaborate with details - all three should be consistent in tone and specificity.
- The tasks should be more granular/sub-atomic compared to steps - they break down a single step into smaller, more specific actions.
- Tasks are ultimately the necessary work packages to complete the single step.

For each task, provide:
  * **title** - a short, action-oriented phrase
  * **subtitle** - a **concise, complete sentence** (maximum 15-20 words) that gives context or clarifies what the task entails; this should be a single sentence, not a paragraph.
  * **text** - a detailed description (half to one paragraph) explaining what the task involves, why it's important, and any key details. Ensure the description meets the actionable, measurable, and specific criteria, and avoids vague language and filler.

Return the tasks as a JSON object with a "tasks" array, each containing "title", "subtitle", and "text".
"""

    task_plan = task_planner_llm.invoke(prompt)

    nodes = []
    prev_id = target_id
    for task in task_plan.tasks:
        node_id = new_id()
        node = TaskNode(
            id=node_id,
            prevStep=[prev_id] if prev_id else [],
            nextStep=[],
            title=task.title,
            subtitle=task.subtitle,
            text=task.text
        )
        if prev_id:
            nodes[-1].nextStep.append(node_id)
        nodes.append(node)
        prev_id = node_id

    return {"tasks": [node.dict() for node in nodes]}