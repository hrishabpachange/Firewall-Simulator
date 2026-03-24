# Firewall Simulator

A modern, interactive web-based Firewall Simulator that allows users to define network security rules, simulate traffic packets, and visualize how a firewall processes network requests in real-time.

## 🚀 Features

-   **Rule Management**: Create, view, and delete firewall rules based on Protocol, Source IP, Destination IP, and Port.
-   **Traffic Simulation**: Manually craft network packets (TCP/UDP/ICMP) to test against your active rules.
-   **Real-time Decision Engine**: Visual feedback on whether packets are **ALLOWED** or **BLOCKED**.
-   **Live Logging**: Automatically updates traffic logs to show a history of all simulation attempts.
-   **Modern UI**: A responsive, dark-themed dashboard built with Glassmorphism design principles.

---

## ⚙️ How It Works

The project is built on a **Client-Server Architecture**:

1.  **The Engine (Backend)**
    *   Written in **Python** using **FastAPI**.
    *   The core logic lies in `FirewallEngine` (in `firewall.py`).
    *   **First-Match Strategy**: When a packet is simulated, the engine iterates through the list of active rules from top to bottom.
    *   The **first rule** that matches the packet's criteria (Protocol, IP, Port) determines the action (`ALLOW` or `BLOCK`).
    *   If no rule matches, the default behavior is **ALLOW**.

2.  **The Interface (Frontend)**
    *   Built with **HTML5**, **CSS3**, and **Vanilla JavaScript**.
    *   Communicates with the backend via REST API endpoints.
    *   **Polling**: The frontend automatically fetches the latest logs every 5 seconds to keep the dashboard in sync.

3.  **Data Flow**
    *   **Adding a Rule**: User input -> Frontend `POST /rules` -> Rule added to Backend Memory.
    *   **Simulating Traffic**: User input -> Frontend `POST /simulate` -> Backend processes packet -> Returns `LogEntry` (Allowed/Blocked) -> Frontend displays result.

---

## 🛠️ Project Structure

```bash
Firewall Simulator/
├── backend/                # FastAPI logic
│   ├── main.py             # API Entry point
│   ├── firewall.py         # Packet filtering logic
│   ├── models.py           # Pydantic data models
│   └── requirements.txt    # Python dependencies
├── frontend/               # User Interface
│   ├── index.html          # Dashboard layout
│   ├── style.css           # Modern dark theme styles
│   └── js/
│       └── app.js          # API integration & UI logic
└── test_api.py             # Automated API tests
```

---

## 🏁 Getting Started

The easiest way to run the simulator is to use the included boot script on Windows.

### ⚡ 1-Click Launch (Windows)

Simply double-click the **`start_simulator.bat`** file in the root directory.
This script automatically:
1. Bootstraps the FastAPI backend server (and activates your `venv`).
2. Starts the frontend Python HTTP server.
3. Opens your default web browser directly to `http://localhost:3000`.

To stop the simulator later, simply close the two command prompt windows that appeared.

---

### Manual Launch (Cross-Platform)

If you aren't on Windows or prefer to run the components manually, you need to run the **Backend** and **Frontend** simultaneously in separate terminals.

#### Prerequisites
-   **Python 3.8+**
-   **Modern Web Browser**

#### 1. Start the Backend Server
This powers the API and firewall logic.

```bash
cd backend

# Create virtual environment (Optional but Recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```
> The API will be available at `http://127.0.0.1:8000`.

### 2. Start the Frontend
This serves the web interface.

```bash
cd frontend

# Run a simple Python HTTP server
python -m http.server 3000
```

### 3. Access the Application
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | **/rules** | Get all active firewall rules |
| `POST` | **/rules** | Add a new firewall rule |
| `DELETE` | **/rules/{id}** | Delete a specific rule |
| `POST` | **/simulate** | Send a packet to test against rules |
| `GET` | **/logs** | Get history of simulated traffic |

---

## 🧪 Testing

To run the automated backend tests:

```bash
# From the root directory
python test_api.py
```
