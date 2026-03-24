from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import time
import ipaddress

class Rule(BaseModel):
    id: Optional[str] = None
    action: Literal["ALLOW", "BLOCK"]
    protocol: Literal["TCP", "UDP", "ICMP", "ANY"]
    source_ip: str # CIDR or single IP, e.g. "192.168.1.1" or "0.0.0.0/0"
    destination_ip: str
    port: int = Field(ge=0, le=65535)

    @field_validator('source_ip', 'destination_ip')
    @classmethod
    def validate_ips(cls, v: str) -> str:
        if v == "ANY":
            return v
        try:
            if '/' in v:
                ipaddress.ip_network(v, strict=False)
            else:
                ipaddress.ip_address(v)
            return v
        except ValueError:
            raise ValueError(f"Invalid IP or CIDR notation: {v}")

class Packet(BaseModel):
    protocol: Literal["TCP", "UDP", "ICMP"]
    source_ip: str
    destination_ip: str
    port: int = Field(ge=0, le=65535)

    @field_validator('source_ip', 'destination_ip')
    @classmethod
    def validate_packet_ips(cls, v: str) -> str:
        try:
            ipaddress.ip_address(v)
            return v
        except ValueError:
            raise ValueError(f"Invalid IP address: {v}")

class LogEntry(BaseModel):
    id: str
    timestamp: float
    packet: Packet
    action: Literal["ALLOWED", "BLOCKED"]
    matched_rule_id: Optional[str] = None

class RuleActionUpdate(BaseModel):
    action: Literal["ALLOW", "BLOCK"]
