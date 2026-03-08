from fastapi import APIRouter
from pydantic import BaseModel
from ..services.generate_branch import generate_branch_steps

router = APIRouter(tags=["generate_branch"])


class GenerateBranchRequest(BaseModel):
    branchPrompt: str
    nodeTitle: str
    nodeSubtitle: str
    nodeText: str


@router.post("/generate-branch")
def generate_branch_endpoint(req: GenerateBranchRequest):
    steps = generate_branch_steps(
        branch_prompt=req.branchPrompt,
        node_title=req.nodeTitle,
        node_subtitle=req.nodeSubtitle,
        node_text=req.nodeText,
    )
    return steps