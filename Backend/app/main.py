from fastapi import FastAPI, Request
from .endpoints import test, steps, narration

from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
app = FastAPI(title="Ripple")

@app.get("/ripple")
async def root():
    return {"message": "Ripple"}

app.include_router(test.router)
app.include_router(steps.router)
app.include_router(narration.router)

templates = Jinja2Templates(directory="templates")


@app.get("/test")
async def test_page(request: Request):
    """Render the Jinja2 template with the tester UI."""
    return templates.TemplateResponse("index.html", {"request": request})