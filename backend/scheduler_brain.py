import random
from typing import List, Dict, Any

class MLPredictionEngine:
    """
    Placeholder for the Intelligent CPU Scheduler ML Engine.
    Simulates predicting optimal execution sequence and burst times.
    """
    def __init__(self):
        self.model_loaded = True
        self.training_epochs = 6
        self.loss = 0.08

    def predict_optimal_sequence(self, processes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        AI Predictive Orchestration.
        Sorts processes based on a simulated intelligent heuristic:
        A combination of Shortest Job First with Priority weight and Arrival Time.
        """
        # Score calculation: lower is better
        # Score = (Burst Time * 0.5) - (Priority * 2) + (Arrival Time * 0.1)
        sorted_processes = sorted(
            processes,
            key=lambda p: (p['bt'] * 0.5) - (p['prio'] * 2.0) + (p['at'] * 0.1)
        )
        return sorted_processes

    def simulate_execution(self, processes: List[Dict[str, Any]], tq: int = 4) -> Dict[str, Any]:
        """
        Simulates the execution based on the predicted sequence.
        Returns the schedule block and calculated metrics.
        """
        # We will do a non-preemptive run based on the predicted optimal sequence for simplicity.
        # This acts as our "AI-SYNC" algorithm.
        time = 0
        schedule = []
        
        # Sort by arrival time initially to find the first process
        procs = sorted(processes, key=lambda x: x['at'])
        
        predicted_queue = self.predict_optimal_sequence(procs)
        
        completed_procs = []
        while len(predicted_queue) > 0:
            # Find the best process that has arrived
            available = [p for p in predicted_queue if p['at'] <= time]
            
            if not available:
                # Idle CPU
                time += 1
                continue
                
            # The available process with the best score (first in available since it's pre-sorted)
            current_p = available[0]
            predicted_queue.remove(current_p)
            
            start_time = time
            end_time = time + current_p['bt']
            
            schedule.append({
                "id": current_p['id'],
                "start": start_time,
                "end": end_time
            })
            
            time = end_time
            
            # Calculate metrics for this process
            ct = time
            tat = ct - current_p['at']
            wt = tat - current_p['bt']
            
            completed_procs.append({
                "id": current_p['id'],
                "wt": wt,
                "tat": tat
            })

        if not completed_procs:
            return {"schedule": [], "metrics": {"avgWt": 0, "avgTat": 0, "utilization": 0}}
            
        avg_wt = sum(p['wt'] for p in completed_procs) / len(completed_procs)
        avg_tat = sum(p['tat'] for p in completed_procs) / len(completed_procs)
        
        total_time = time
        idle_time = total_time - sum(p['bt'] for p in processes)
        utilization = ((total_time - idle_time) / total_time) * 100 if total_time > 0 else 0

        # Simulate ML metrics for the dashboard
        ml_metrics = {
            "avgWt": avg_wt,
            "avgTat": avg_tat,
            "utilization": utilization,
            "confidence_score": random.uniform(0.85, 0.99),
            "anomalies_detected": random.randint(0, 2)
        }

        return {
            "schedule": schedule,
            "metrics": ml_metrics
        }
