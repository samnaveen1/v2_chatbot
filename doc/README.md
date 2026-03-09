# INVYPRO AI Chatbot Ecosystem

A professional, enterprise-grade AI chatbot system integrated with ERP data. This project enables business users to query complex transactional data (Sales, Products, Customers, Vendors, etc.) using natural language.

---

## 📂 Project Overview

The ecosystem is divided into two main components:
- **Backend (FastAPI)**: The brain of the system. It handles LLM orchestration, MongoDB query generation, security (RBAC), and multi-tenant data isolation.
- **Frontend (Next.js)**: A sleek, professional chat widget designed to be embedded on any corporate website via Google Tag Manager (GTM).

---

## 🚀 Key Features

- 🧠 **AI-Powered Querying**: Converts natural language into optimized MongoDB aggregation pipelines.
- 🛡️ **Enterprise Security**: 5-layer guardrails and RBAC (Role-Based Access Control) to ensure data safety.
- 🏢 **Multi-Tenant Ready**: Built-in support for organizational isolation and user quotas.
- 📊 **Rich Data Display**: Markdown tables with support for up to 500 records and CSV downloads.
- 📐 **Tri-State UI**: Flexible interface with Compact, Medium (3/4), and Full Screen modes.
- 🏷️ **GTM Integration**: Effortless deployment to any website using Google Tag Manager.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB 6.0+

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows)
pip install -r requirements.txt
# Configure .env based on .env.example
python app/main.py  # or uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Further Documentation

For more in-depth information, please refer to:
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**: Detailed technical specifications, features, and setup guides.
- **[ARCHITECTURE_AND_WORKFLOWS.md](./ARCHITECTURE_AND_WORKFLOWS.md)**: High-level architectural diagrams and operational workflows.

---

## 👥 Support & License

Proprietary - INVYPRO © 2026  
For support, contact: [support@invypro.com](mailto:support@invypro.com)
