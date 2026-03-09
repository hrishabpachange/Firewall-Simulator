# Firewall Simulator - Comprehensive Documentation

The **Firewall Simulator** is a full-stack web application designed to demonstrate how a basic network firewall processes incoming packets based on an active set of rules. It allows you to add rules, simulate network traffic, and view the resulting logs (whether a packet was ALLOWED or BLOCKED).

Here is a comprehensive documentation of the project's architecture, components, and data flow.

---

## 🏗️ 1. High-Level Architecture

The project is split into two distinct tiers:
*   **Backend:** A RESTful API built with **Python** and **FastAPI**. It handles the core business logic (evaluating rules against packets).
*   **Frontend:** A standalone web interface built with **HTML5, CSS3, and Vanilla JavaScript**. It communicates with the backend asynchronously using the native `fetch` API.

**Directory Structure:**
```text
Firewall Simulator/
├── backend/
│   ├── main.py.......... # FastAPI application setup and API endpoints
│   ├── firewall.py...... # Core firewall engine logic (rule checking)
│   ├── models.py........ # Pydantic data models (Rule, Packet, LogEntry)
│   └── requirements.txt. # Python dependencies (fastapi, pydantic, uvicorn)
├── frontend/
│   ├── index.html....... # Main UI structure
│   ├── style.css........ # UI styling and animations
│   └── js/
│       └── app.js....... # UI interactivity and API communication
├── test_api.py.......... # Automated integration tests for the backend API
└── README.md............ # Project overview
```

---

## ⚙️ 2. The Backend (Python + FastAPI)

The backend is completely stateless across application restarts, storing rules and logs in memory. 

### Data Models (`backend/models.py`)
Using **Pydantic**, the application enforces strict type-checking on incoming requests:
*   **`Rule`:** Defines a firewall rule. It contains an `action` (ALLOW/BLOCK), `protocol` (TCP/UDP/ICMP/ANY), `source_ip` (supports standard IP strings and CIDR notations like `192.168.1.0/24`), `destination_ip`, and `port` (bounded to explicitly 0-65535, where 0 means ANY).
*   **`Packet`:** Defines simulated incoming traffic (protocol, source ip, destination ip, and port).
*   **`LogEntry`:** Stores the result of a simulation (timestamp, the packet payload, the action taken, and which rule triggered the action).

Both `Rule` and `Packet` evaluate their IP inputs structurally (validating them into actual `ipaddress.ip_network` or `ipaddress.ip_address` topologies) to gracefully catch badly formatted strings (e.g., throwing a `422 Unprocessable Entity` rather than silently malfunctioning).

### Core Logic (`backend/firewall.py`)
The `FirewallEngine` class is the brains of the operation. It maintains two lists: `self.rules` and `self.logs`.
When a packet is simulated via `process_packet()`:
1.  The engine iterates through the active `rules` sequentially (**First Match Strategy**).
2.  It checks for a protocol match, port match, and IP match (using Python's built-in `ipaddress` library to easily determine if an IP falls within a specific CIDR block).
3.  If a rule matches, the specified action (ALLOW or BLOCK) is applied. If no rules match, the packet is defaulted to **ALLOWED**.
4.  A `LogEntry` is generated and prepended to the `logs` list (capped at 100 entries max to prevent memory bloat).

### API Endpoints (`backend/main.py`)
FastAPI exposes the core engine to the web via CORS middleware to support the local frontend:
*   `GET /rules`: Returns all active firewall rules.
*   `POST /rules`: Adds a newly created `Rule` object to the engine.
*   `DELETE /rules/{rule_id}`: Deletes a specific rule.
*   `POST /simulate`: Submits a `Packet`, evaluates it, and returns the resulting `LogEntry`.
*   `GET /logs`: Fetches the timeline of evaluated simulation logs stringified from newest to oldest.

---

## 🖥️ 3. The Frontend (HTML / CSS / JS)

The frontend is a lightweight, responsive dashboard that does not rely on hefty JS frameworks.

### Structure (`frontend/index.html`)
The UI is divided into three main panels within a CSS Grid layout (`.dashboard-grid`):
1.  **Traffic Simulator:** A form containing inputs for Protocol, IPs, and Port. Used to generate a test packet.
2.  **Active Rules:** A dynamic table displaying current rules with an "+ Add Rule" button (which opens a modal overlay).
3.  **Traffic Logs:** A chronological feed of all simulated packets and their outcomes.

### Styling (`frontend/style.css`)
The application uses a modern "dark mode" aesthetic:
*   **CSS Variables (Custom Properties):** Define the color palette (`#050505` background, vibrant blues and violets for gradients, emerald/red for success/danger).
*   **Glassmorphism Effects:** Uses `backdrop-filter: blur(12px)` and semi-transparent backgrounds to give panels a floating, premium feel.

### Interactivity (`frontend/js/app.js`)
The JavaScript runs on DOM load and orchestrates UI rendering and backend communication:
*   **State Alignment:** On startup, `fetchRules()` and `fetchLogs()` pull the initial state from `http://127.0.0.1:8000`. The logs are additionally polled every 5 seconds mapping to `setInterval(fetchLogs, 5000)`.
*   **Simulating Packets:** `simulatePacket(event)` intercepts the form submission, reads the input fields, and `POST`s the JSON payload to the `/simulate` endpoint. If successful, it triggers a UI update showing the localized result.
*   **Rule Management:** Handles opening/closing the modal, and parsing user inputs to safely feed valid IPs or default wildcard `"ANY"` designations back to the `POST /rules` endpoint.
*   **422 Structural Validation & Error Handling:** The UI gracefully intercepts and translates complex Pydantic validation errors (like invalid IPs or Ports < 0) into easily readable visual alerts, preventing the backend from crashing while preserving user continuity.

---

## 🧪 4. Testing & Reliability

A dedicated test suite exists in `test_api.py`. Since the backend has no permanent database, testing can be done entirely on the fly safely without needing to spin up external containerized databases.
The script:
1.  Fires up a `requests` payload to add a rule blocking `TCP` traffic from `1.2.3.4`.
2.  Simulates a matching packet and asserts that it was **BLOCKED**.
3.  Simulates a non-matching packet (e.g., uses `UDP` instead of `TCP`) and asserts that it was **ALLOWED**.
4.  Fetches logs to assert that they correctly reflect the test sequence.

This structure allows users to build and test robust networking firewall policies without actually putting their real OS network stack at risk!
