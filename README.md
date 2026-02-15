# Firewall Simulator Walkthrough

Welcome to the Firewall Simulator! This project allows you to simulate network traffic and define firewall rules to allow or block packets. It features a FastAPI backend and a responsive HTML/CSS/JS frontend.

## Project Structure

- **backend/**: Contains the Python FastAPI application.
  - `main.py`: Entry point for the backend API.
  - `firewall.py`: Core logic for packet filtering.
  - `models.py`: Data models for Rules, Packets, and Logs.
  - `requirements.txt`: Python dependencies.
- **frontend/**: Contains the user interface.
  - `index.html`: Main application page.
  - `style.css`: Stylesheet for the application.
  - `js/app.js`: Frontend logic for interacting with the API.
- **test_api.py**: A script to test the backend API endpoints programmatically.

## Prerequisites

- **Python 3.8+**: Required to run the backend.
- **Modern Web Browser**: Chrome, Firefox, Edge, etc.

## Running the Project

You will need to run the **Backend** and **Frontend** simultaneously. It is best to use two separate terminal windows.

### Quick Start Summary
1.  **Terminal 1 (Backend)**:
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    ```
2.  **Terminal 2 (Frontend)**:
    ```bash
    cd frontend
    python -m http.server 3000
    ```
3.  **Browser**: Open `http://localhost:3000`

---

### Detailed Steps

#### 1. Start the Backend Server
The backend powers the API and logic.

1.  Open your first terminal.
2.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
3.  Create and activate a virtual environment (Recommended):
    - **Windows**:
      ```bash
      python -m venv venv
      venv\Scripts\activate
      ```
    - **macOS/Linux**:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Run the server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *Success:* You should see `Uvicorn running on http://127.0.0.1:8000`.

#### 2. Start the Frontend
The frontend is the web interface.

1.  Open a **new** terminal window.
2.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
3.  Start a simple local web server on port 3000 (to avoid conflict with backend on 8000):
    ```bash
    python -m http.server 3000
    ```
    *Note: You can also just double-click `index.html` to open it, but some features might be limited by browser security policies.*

#### 3. Access the App
Open your web browser and go to:
[http://localhost:3000](http://localhost:3000)

If you didn't run the python server for the frontend, simply drag and drop `index.html` into your browser.

## Using the Application

### Adding Rules
1.  Click the **+ Add Rule** button in the **Firewall Rules** panel.
2.  Fill in the rule details:
    - **Action**: `ALLOW` or `BLOCK`.
    - **Protocol**: TCP, UDP, ICMP, or ANY.
    - **Source IP**: Specific IP (e.g., `192.168.1.5`), CIDR (e.g., `192.168.1.0/24`), or `ANY`.
    - **Destination IP**: Specific IP or `ANY`.
    - **Port**: Specific port number (e.g., `80`) or `0` for Any.
3.  Click **Add Rule**. The rule will appear in the list.

### Simulating Traffic
1.  In the **Traffic Simulator** panel, configure a packet:
    - Select a **Protocol**.
    - Enter a **Source IP** and **Destination IP**.
    - Enter a **Port**.
2.  Click **Send Packet**.
3.  The result (Allowed/Blocked) will be displayed below the button.

### Viewing Logs
- The **Traffic Logs** panel updates automatically every 5 seconds.
- It shows the history of allowed and blocked packets.
- You can manually refresh logs by clicking the **↻** button.

## Troubleshooting

- **Backend not connecting**: Ensure the backend server is running on port 8000. Check the terminal for errors.
- **CORS Issues**: If you encounter CORS errors in the browser console, try running the frontend using a local HTTP server (python `http.server`) instead of opening the file directly.
- **Rule not working**: Remember that valid rules are processed in order (top to bottom). The first matching rule determines the action.

## Testing

You can run the provided test script to verify the backend API is working correctly:

```bash
python test_api.py
```

This will run a series of automated tests against the running backend.
