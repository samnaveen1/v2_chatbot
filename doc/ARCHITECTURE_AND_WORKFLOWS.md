# Architecture & High-Level Workflows

This document visualizes the internal logic and deployment strategies of the InvyPro AI Chatbot.

---

## 🏗️ High-Level System Architecture

The following diagram illustrates the interaction between the frontend, backend, LLM providers, and the ERP database.

```mermaid
graph TD
    Client["Company Website (Widget)"] -- "Sends Message" --> Frontend["Next.js Application"]
    Frontend -- "Auth/Query (Axios)" --> Backend["FastAPI Server"]
    
    subgraph "Backend Engine"
        Guard["Guardrails Layer (RBAC/Soft-Delete)"]
        LLM["LiteLLM Orchestrator"]
        Query["Query Builder"]
    end
    
    Backend --> Guard
    Guard --> LLM
    LLM -- "Natural Language" --> Azure["Azure OpenAI"]
    Azure -- "Structured JSON (Pipeline)" --> Query
    Query -- "Validated Aggregate" --> MongoDB[("ERP MongoDB")]
    MongoDB -- "Raw Records" --> Backend
    Backend -- "Markdown Table" --> Frontend
    Frontend -- "Renders Chat" --> Client
```

---

## ⚡ Data Flow Workflow

How a user question (e.g., *"Show me sales for store X"*) becomes a formatted data table.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant L as LLM (Azure)
    participant D as DB (MongoDB)

    U->>F: "Give me duraisamy details"
    F->>B: POST /api/chat/message
    B->>B: Check Rate Limit & Quota
    B->>B: Identify Greeting (Fast-Track)
    B->>L: Generate MongoDB Pipeline (Schema Context)
    L-->>B: { collection: "customers", pipeline: [...] }
    B->>B: Inject { isDeleted: false }
    B->>D: Aggregate (Pipeline)
    D-->>B: [ { Name: "DURAISAMY", ... }, ... ]
    B-->>F: Markdown Table + 189 Records
    F->>U: Display Table (3/4 View Recommended)
```

---

## 🌐 Deployment & Integration Workflow

The process for taking the chatbot from development to a production company website.

```mermaid
graph LR
    Dev["Developer Setup (npm dev / uvicorn)"] --> Build["Next.js Build (Static Export Ready)"]
    Build --> Host["Host on Vercel/S3/VPS"]
    
    subgraph "External Integration"
        Host --> GTM["Google Tag Manager Container"]
        GTM -- "Embed script/iframe" --> Corp["Company Website"]
    end
```

### **Google Tag Manager Execution Steps**
1. **Container Ready**: Manager creates a GTM account and retrieves the Container ID.
2. **Implementation**: Container ID is placed in `layout.tsx`.
3. **Trigger**: GTM is configured to fire the Chatbot Loader script on all pages of `companywebsite.com`.
4. **Visibility**: The floating Chatbot bubble appears automatically for all site visitors.

---

## 📐 UI Resizing States

```mermaid
stateDiagram-v2
    [*] --> Compact: Default Toggle
    Compact --> Medium: Expand Button Click 1
    Medium --> FullScreen: Expand Button Click 2
    FullScreen --> Compact: Expand Button Click 3
```
