# Firewall Simulator - Architecture Diagrams

This document contains standardized UML and system diagrams illustrating the architecture, behavior, and logic structure of the Firewall Simulator project.

## 1. Data Flow Diagram (DFD - Level 1)
```mermaid
graph TD
    User([User])
    UI[Frontend Dashboard UI]
    API[FastAPI Backend]
    Engine[(Firewall Engine Memory)]
    
    User -->|Defines Rules & Packets| UI
    UI -->|POST /rules| API
    UI -->|POST /simulate| API
    UI -->|GET /logs| API
    API -->|Validates Data| Engine
    Engine -->|Evaluates Packets| API
    API -->|JSON Responses| UI
    UI -->|Updates View| User
```

## 2. Use Case Diagram
```mermaid
flowchart LR
    User([System Administrator])
    
    subgraph Firewall Simulator
        UC1(Add New Rule)
        UC2(Toggle Rule Action)
        UC3(Delete Rule)
        UC4(Simulate Traffic Packet)
        UC5(View Active Rules)
        UC6(View Real-Time Logs)
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
```

## 3. Class Diagram
```mermaid
classDiagram
    class FirewallEngine {
        +List~Rule~ rules
        +List~LogEntry~ logs
        +add_rule(rule: Rule)
        +delete_rule(rule_id: str)
        +update_rule_action(rule_id: str, new_action: str)
        +process_packet(packet: Packet) LogEntry
        -_check_ip_match(rule_ip: str, packet_ip: str) bool
    }

    class Rule {
        +String id
        +String action
        +String protocol
        +String source_ip
        +String destination_ip
        +int port
    }

    class Packet {
        +String protocol
        +String source_ip
        +String destination_ip
        +int port
    }

    class LogEntry {
        +String id
        +float timestamp
        +Packet packet
        +String action
        +String matched_rule_id
    }

    FirewallEngine "1" *-- "many" Rule : manages
    FirewallEngine "1" *-- "many" LogEntry : records
    LogEntry "1" *-- "1" Packet : contains
```

## 4. Sequence Diagram (Simulating Traffic)
```mermaid
sequenceDiagram
    actor User
    participant AppJS as Frontend (app.js)
    participant FastAPI as Backend (main.py)
    participant Engine as FirewallEngine

    User->>AppJS: Clicks "Send Packet"
    AppJS->>FastAPI: POST /simulate (JSON Packet)
    FastAPI->>Engine: process_packet(packet)
    activate Engine
    loop Rule Evaluation (Top to Bottom)
        Engine->>Engine: Check Protocol, Ports, IPs
        opt On First Match
            Engine-->>Engine: Determine Action (ALLOW/BLOCK)
        end
    end
    Engine->>Engine: Generate & Save LogEntry
    Engine-->>FastAPI: Return LogEntry
    deactivate Engine
    FastAPI-->>AppJS: HTTP 200 OK (JSON LogEntry)
    AppJS->>AppJS: Display Result Box
    AppJS->>AppJS: fetchLogs()
    AppJS->>User: Visually Confirm Packet Status
```

## 5. Activity Diagram (Packet Processing Strategy)
```mermaid
flowchart TD
    Start([Receive Packet]) --> Init[Set Default Action: ALLOWED]
    Init --> Eval[Evaluate Rules]
    
    Eval --> CheckLoop{Are there more<br/>rules to check?}
    CheckLoop -- Yes --> CheckRule[Check packet against next rule]
    CheckRule --> MatchCondition{Does packet match<br/>Rule conditions?}
    
    MatchCondition -- No --> CheckLoop
    MatchCondition -- Yes --> SetAction[Apply Rule Action: ALLOW or BLOCK]
    SetAction --> LogEvent[Create Log Entry]
    
    CheckLoop -- No (End of list) --> DefaultLog[Create Log Entry using Default Action]
    DefaultLog --> Ret[Return Log Result]
    LogEvent --> Ret
    Ret --> Done([End Process])
```

## 6. Collaboration Diagram
```mermaid
flowchart TD
    User([User])
    subgraph Client
        UI_Component[Web Interface Panel]
        JS_Network[app.js Network layer]
    end
    
    subgraph Server
        Router[main.py Endpoint router]
        Core[firewall.py Engine Logic]
    end

    User -- "1: inputs packet parameters" --> UI_Component
    UI_Component -- "2: triggers simulate()" --> JS_Network
    JS_Network -- "3: POST /simulate" --> Router
    Router -- "4: calls process_packet()" --> Core
    Core -- "5: returns decision object" --> Router
    Router -- "6: HTTP 200 response" --> JS_Network
    JS_Network -- "7: displaySimulationResult()" --> UI_Component
```

## 7. Component Diagram
```mermaid
flowchart TB
    subgraph Frontend Subsystem
        HTML[UI Layout - index.html]
        CSS[Styling - style.css]
        JS[Logic & API Calls - app.js]
        
        HTML --> CSS
        HTML --> JS
    end
    
    subgraph Backend Subsystem
        API[FastAPI Router - main.py]
        Models[Pydantic Validation - models.py]
        Engine[Logic & State - firewall.py]
        
        API --> Models
        API --> Engine
        Engine --> Models
    end

    JS <-->|REST API over HTTP| API
```

## 8. Deployment Diagram
```mermaid
flowchart TD
    subgraph Client Device
        Browser[Modern Web Browser]
        SPA[Firewall Simulator SPA]
        Browser --- SPA
    end

    subgraph Host Machine / Server
        ServerEnv[Python Runtime Environment]
        subgraph Ports
            Port3000(Port 3000: Frontend Server)
            Port8000(Port 8000: API Server)
        end
        PythonWeb[python -m http.server]
        Uvicorn[uvicorn main:app]
        
        ServerEnv --- PythonWeb
        ServerEnv --- Uvicorn
        PythonWeb --- Port3000
        Uvicorn --- Port8000
    end

    SPA -.->|HTTP GET /index.html| Port3000
    SPA -.->|REST API calls| Port8000
```
