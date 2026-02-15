from pydantic import BaseModel
from typing import Optional, Literal
import time

class Rule(BaseModel):
    id: Optional[str] = None
    action: Literal["ALLOW", "BLOCK"]
    protocol: Literal["TCP", "UDP", "ICMP", "ANY"]
    source_ip: str # CIDR or single IP, e.g. "192.168.1.1" or "0.0.0.0/0"
    destination_ip: str
    port: int # 0 for any

class Packet(BaseModel):
    protocol: Literal["TCP", "UDP", "ICMP"]
    source_ip: str
    destination_ip: str
    port: int

class LogEntry(BaseModel):
    id: str
    timestamp: float
    packet: Packet
    action: Literal["ALLOWED", "BLOCKED"]
    matched_rule_id: Optional[str] = None
