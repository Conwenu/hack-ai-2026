from fastapi import FastAPI
from .endpoints import test, steps, tasks
app = FastAPI(title="Ripple")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Ripple"}

app.include_router(test.router)
app.include_router(steps.router)
app.include_router(tasks.router)


