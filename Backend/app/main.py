from fastapi import FastAPI
from .endpoints import test, steps, tasks
app = FastAPI(title="Ripple")

@app.get("/")
async def root():
    return {"message": "Ripple"}


app.include_router(test.router)
app.include_router(steps.router)
app.include_router(tasks.router)


