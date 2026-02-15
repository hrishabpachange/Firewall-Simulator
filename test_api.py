import requests
import uuid
import time

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Testing Firewall API...")

    # 1. Add a Rule
    rule = {
        "id": str(uuid.uuid4()),
        "action": "BLOCK",
        "protocol": "TCP",
        "source_ip": "1.2.3.4",
        "destination_ip": "ANY",
        "port": 8080
    }
    r = requests.post(f"{BASE_URL}/rules", json=rule)
    assert r.status_code == 200, f"Failed to add rule: {r.text}"
    print(f"[PASS] Added Rule: {rule['id']}")

    # 2. Simulate Matching Packet (Should be BLOCKED)
    packet_block = {
        "protocol": "TCP",
        "source_ip": "1.2.3.4",
        "destination_ip": "192.168.1.1",
        "port": 8080
    }
    r = requests.post(f"{BASE_URL}/simulate", json=packet_block)
    log = r.json()
    assert log['action'] == "BLOCKED", f"Packet should be BLOCKED but was {log['action']}"
    print(f"[PASS] Simulation (Blocked): {log['action']}")

    # 3. Simulate Non-Matching Packet (Should be ALLOWED)
    packet_allow = {
        "protocol": "UDP", # Different protocol
        "source_ip": "1.2.3.4",
        "destination_ip": "192.168.1.1",
        "port": 8080
    }
    r = requests.post(f"{BASE_URL}/simulate", json=packet_allow)
    log = r.json()
    assert log['action'] == "ALLOWED", f"Packet should be ALLOWED but was {log['action']}"
    print(f"[PASS] Simulation (Allowed): {log['action']}")

    # 4. Check Logs
    r = requests.get(f"{BASE_URL}/logs")
    logs = r.json()
    assert len(logs) >= 2, "Logs should have at least 2 entries"
    print(f"[PASS] Logs match: Found {len(logs)} entries")

    print("\nAll Backend Tests Passed!")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend. Is it running?")
