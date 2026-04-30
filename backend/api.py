from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from scheduler_brain import MLPredictionEngine

app = FastAPI(
    title="Neuro-Sync API",
    description="Intelligent CPU Scheduler Backend",
    version="2.4.0"
)

# CORS Configuration - Production Ready
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MLPredictionEngine()

class Process(BaseModel):
    id: int
    at: int  # Arrival Time
    bt: int  # Burst Time
    prio: int  # Priority

class ScheduleRequest(BaseModel):
    algorithm: str
    timeQuantum: Optional[int] = 4
    processes: List[Process]

@app.get("/health")
async def health_check():
    return {"status": "System Online", "model_loaded": engine.model_loaded}

@app.post("/api/schedule")
async def generate_schedule(req: ScheduleRequest):
    if not req.processes:
        raise HTTPException(status_code=400, detail="Process queue is empty")
        
    try:
        # Currently, the brain runs the AI-SYNC logic regardless of algorithm requested
        # In a full implementation, it would branch based on req.algorithm
        # to offload standard RR/FCFS/SJF to backend instead of frontend fallback.
        processes_dict = [p.model_dump() for p in req.processes]
        
        result = engine.simulate_execution(processes_dict, req.timeQuantum)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=3000, reload=True)
