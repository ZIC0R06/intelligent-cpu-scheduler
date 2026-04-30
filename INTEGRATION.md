# Neuro-Sync Integration Guide

## Overview
This document outlines how to integrate and run the Neuro-Sync Intelligent CPU Scheduler backend and connect it to the frontend UI.

## Requirements
- Python 3.9+
- Node.js / HTTP Server (for frontend)

## 1. Setup Backend (FastAPI + ML Engine)

Navigate to the `backend` directory and install the dependencies (assuming you are at the project root):

```bash
pip install -r requirements.txt
cd backend
```

Run the backend server:

```bash
python api.py
```

The server will start on `http://localhost:3000`. You can test the health endpoint by visiting `http://localhost:3000/health`.

## 2. Setup Frontend

The frontend is built with pure HTML, CSS, and JS (no build step required).
Serve the root directory using any local web server. For example:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Open your browser and navigate to `http://localhost:8000`.

## 3. Architecture

- **Frontend (`js/simulation.js`)**: Gathers the workload config and attempts to POST to `http://localhost:3000/api/schedule`.
- **API Core (`backend/api.py`)**: Receives the payload and forwards it to the Machine Learning Engine.
- **ML Engine (`backend/scheduler_brain.py`)**: Computes the optimal execution sequence using heuristic AI scoring (simulated for now), generates Gantt blocks and metrics, and returns the JSON payload.
- **Fallback Mechanism**: If the backend is unreachable, the frontend automatically falls back to local execution of standard algorithms (FCFS/SJF/RR) and prints a warning to the System Terminal component.

## 4. Expanding the ML Engine

To upgrade from the placeholder model to a real TensorFlow/PyTorch model:
1. Export your trained model to `backend/models/`.
2. Update `MLPredictionEngine.__init__` in `scheduler_brain.py` to load the model.
3. Modify `predict_optimal_sequence()` to run inference on the tensor data representing the process queue.
