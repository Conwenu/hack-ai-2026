from fastapi import APIRouter

router = APIRouter(tags=["test"])

@router.get("/test/")
async def list_items():
    return [{"name": "Ripple"}, {"name": "View"}]

@router.get("/test/{test_id}")
async def get_item(test_id: int):
    return {"test_id": test_id, "name": "Test Ripple View"}