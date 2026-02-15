from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Rule, Packet, LogEntry
from firewall import FirewallEngine
from typing import List
import uuid

app = FastAPI(title="Firewall Simulator API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

firewall = FirewallEngine()

# Initialize with a default rule
firewall.add_rule(Rule(
    id=str(uuid.uuid4()),
    action="BLOCK",
    protocol="TCP",
    source_ip="192.168.1.100", # Example malicious IP
    destination_ip="ANY",
    port=80
))

@app.get("/rules", response_model=List[Rule])
async def get_rules():
    return firewall.rules

@app.post("/rules", response_model=Rule)
async def add_rule(rule: Rule):
    # Ensure ID is set if not provided (though model requires it, client might send dummy)
    if not rule.id:
        rule.id = str(uuid.uuid4())
    firewall.add_rule(rule)
    return rule

@app.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str):
    firewall.delete_rule(rule_id)
    return {"status": "success", "message": f"Rule {rule_id} deleted"}

@app.post("/simulate", response_model=LogEntry)
async def simulate_traffic(packet: Packet):
    log = firewall.process_packet(packet)
    return log

@app.get("/logs", response_model=List[LogEntry])
async def get_logs():
    return firewall.logs
