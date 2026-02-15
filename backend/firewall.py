import ipaddress
from typing import List
from models import Rule, Packet, LogEntry
import uuid
import time

class FirewallEngine:
    def __init__(self):
        self.rules: List[Rule] = []
        self.logs: List[LogEntry] = []

    def add_rule(self, rule: Rule):
        self.rules.append(rule)

    def delete_rule(self, rule_id: str):
        self.rules = [r for r in self.rules if r.id != rule_id]

    def _check_ip_match(self, rule_ip: str, packet_ip: str) -> bool:
        if rule_ip == "ANY" or rule_ip == "0.0.0.0/0":
            return True
        try:
            # Check if it's a network or single IP
            if '/' in rule_ip:
                network = ipaddress.ip_network(rule_ip, strict=False)
                address = ipaddress.ip_address(packet_ip)
                return address in network
            else:
                return rule_ip == packet_ip
        except ValueError:
            return False

    def process_packet(self, packet: Packet) -> LogEntry:
        action = "ALLOWED" # Default action
        matched_rule_id = None

        # Check against rules (First Match Strategy)
        for rule in self.rules:
            # Protocol match
            if rule.protocol != "ANY" and rule.protocol != packet.protocol:
                continue

            # Port match (0 means any port in our simplified model, or typically implied ANY)
            if rule.port != 0 and rule.port != packet.port:
                continue

            # IP match
            if not self._check_ip_match(rule.source_ip, packet.source_ip):
                continue
            if not self._check_ip_match(rule.destination_ip, packet.destination_ip):
                continue

            # If we reached here, rule matches
            action = "ALLOWED" if rule.action == "ALLOW" else "BLOCKED"
            matched_rule_id = rule.id
            break # First match prevails

        log_entry = LogEntry(
            id=str(uuid.uuid4()),
            timestamp=time.time(),
            packet=packet,
            action=action,
            matched_rule_id=matched_rule_id
        )
        self.logs.insert(0, log_entry) # Add to beginning
        # Keep logs limit to 100 for now
        if len(self.logs) > 100:
            self.logs.pop()
        
        return log_entry
