# INVYPRO Chatbot - Implementation Plan

## Folder Structure
```
invypro-chatbot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── admin.py
│   │   │   └── health.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py
│   │   │   ├── query_builder.py
│   │   │   ├── guardrails.py
│   │   │   ├── rbac_service.py
│   │   │   ├── session_manager.py
│   │   │   ├── rate_limiter.py
│   │   │   ├── mongodb_service.py
│   │   │   ├── response_formatter.py
│   │   │   └── byok_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── jwt_handler.py
│   │   │   └── encryption.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py
│   │   │   └── tenant_middleware.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logger.py
│   │       └── token_counter.py
│   ├── scripts/
│   │   ├── create_views.js
│   │   ├── setup_indexes.js
│   │   └── seed_data.py
│   ├── tests/
│   │   ├── test_rbac.py
│   │   ├── test_guardrails.py
│   │   └── test_llm_service.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── chat/
│   │   │   ├── admin/
│   │   │   └── settings/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Admin/
│   │   │   └── Common/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── store/
│   │   │   └── chatStore.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
├── docs/
│   ├── api_documentation.md
│   ├── deployment_guide.md
│   └── troubleshooting.md

```

## Architecture Overview

### High-Level Architecture
```
User (Next.js Frontend)
    ↓ Socket.io
Backend (FastAPI)
    ↓
┌─────────────────────────────────┐
│ 1. JWT Auth + Tenant Validation │
│ 2. RBAC Permission Check         │
│ 3. Rate Limiting                 │
│ 4. LLM Decision Engine           │
│    • Direct Response             │
│    • Query MongoDB View          │
│    • Query Collection Directly   │
│ 5. Guardrails Validation         │
│ 6. MongoDB Query Execution       │
│ 7. Template Selection + LLM Format│
└─────────────────────────────────┘
    ↓
MongoDB (ChatBot_Invy + invypro_main)
```

### Key Design Principles
- Multi-tenant architecture with org_id isolation
- RBAC-first security model
- LLM-driven decision making (no pattern matching)
- Zero-trust query validation
- Stateless JWT authentication
- MongoDB-based session management
- Fine-tuned LLM for query generation

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.10+
- **Database**: MongoDB 6.0+
- **Cache**: MongoDB-based (no Redis)
- **LLM**: BYOK (OpenAI, Anthropic, Google, GROQ)
- **Auth**: JWT (PyJWT)
- **WebSocket**: Socket.io (python-socketio)
- **Async**: Motor (async MongoDB driver)

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Real-time**: Socket.io-client
- **HTTP**: Axios

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose / Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (optional)

## Phase 1: Foundation (Weeks 1-2)

### Week 1: Database Setup
**Tasks**:
- Create ChatBot_Invy database with all collections
- Create all indexes and TTL rules
- Set up validation rules
- Create 8 initial MongoDB views
- Register views in view_registry collection
- Implement soft delete mechanism
- Set up org_id multi-tenant filtering

**Deliverables**:
- MongoDB setup scripts
- Index creation scripts
- View creation scripts
- View registry population
- Schema validation tests

### Week 2: Core Backend Services
**Tasks**:
- Implement MongoDB service with multi-tenant support
- Implement JWT authentication
- Implement tenant middleware
- Implement session manager (MongoDB-based, 25 msg)
- Implement rate limiter (MongoDB TTL-based)
- Set up logging infrastructure

**Deliverables**:
- mongodb_service.py (CRUD operations)
- jwt_handler.py (token generation/validation)
- session_manager.py (context management)
- rate_limiter.py (request throttling)
- Unit tests (80% coverage)

## Phase 2: RBAC & Security (Weeks 3-4)

### Week 3: RBAC Implementation
**Tasks**:
- Implement RBAC service with role loading
- Implement permission checker
- Add RBAC caching layer
- Integrate with existing roles collection
- Handle RBAC denial responses

**Deliverables**:
- rbac_service.py (permission checks)
- RBAC middleware
- Integration tests

### Week 4: Guardrails System
**Tasks**:
- Implement 5-layer guardrails validation
- Add write operation blocker
- Add date range validator (3 months max)
- Add RBAC query validator
- Add PII field detector
- Add expensive query detector

**Deliverables**:
- guardrails.py (validation engine)
- Security tests
- Performance tests

## Phase 3: LLM Integration (Weeks 5-6)

### Week 5: BYOK System
**Tasks**:
- Implement API key encryption/storage
- Implement multi-provider LLM client
- Add OpenAI integration
- Add Azure OpenAI integration (Endpoint,version,depeloyment model)
- Add Anthropic integration
- Add Google integration
- Add GROQ integration
- Implement fallback mechanism

**Deliverables**:
- byok_service.py (key management)
- llm_client.py (multi-provider)
- Provider adapters
- Integration tests

### Week 6: LLM Decision Engine
**Tasks**:
- Implement LLM service orchestrator
- Implement query builder with JOINs
- Implement response formatter (template + LLM)
- Add view query service
- Integrate schema registry
- Integrate view registry

**Deliverables**:
- llm_service.py (decision orchestration)
- query_builder.py ($lookup generation)
- response_formatter.py (templates)

## Phase 4: API & Routes (Week 7)

### Week 7: API Development
**Tasks**:
- Implement authentication routes (login, refresh)
- Implement chat routes (Socket.io)
- Implement admin routes (BYOK, usage stats)
- Implement health check endpoint
- Add request/response logging
- Add error handling middleware

**Deliverables**:
- auth.py (POST /login, /refresh)
- chat.py (Socket.io chat handlers)
- admin.py (GET/POST /admin/*)
- health.py (GET /health)
- API documentation (OpenAPI)

## Phase 5: Frontend (Weeks 8-9)

### Week 8: Core Frontend
**Tasks**:
- Set up Next.js 14 project
- Implement authentication flow
- Implement chat interface
- Implement Socket.io integration
- Add message history sidebar (25 messages)
- Add typing indicators

**Deliverables**:
- Chat UI components
- Auth pages (login/register)
- Socket.io client
- Zustand store
- Responsive design

### Week 9: Admin Dashboard
**Tasks**:
- Implement API key management UI
- Implement usage statistics dashboard
- Implement user preferences UI
- Add feedback system
- Add error notifications

**Deliverables**:
- Admin panel components
- Charts (usage, costs)
- Settings page
- Feedback form

## Phase 6: Testing & Optimization (Week 10)

### Week 10: Quality Assurance
**Tasks**:
- Unit tests (backend: 80% coverage)
- Integration tests (API endpoints)
- E2E tests (frontend flows)
- Load testing (100 concurrent users)
- Security audit (RBAC, JWT, guardrails)
- Performance optimization

**Deliverables**:
- Test suite (pytest)
- Load test reports
- Security audit report
- Performance benchmarks

## Phase 7: Deployment (Week 11)

### Week 11: Production Setup
**Tasks**:
- Create Docker images
- Set up docker-compose
- Configure environment variables
- Set up MongoDB replica set
- Configure SSL/TLS
- Set up monitoring (Prometheus)
- Set up logging (centralized)

**Deliverables**:
- Dockerfile.backend
- Dockerfile.frontend
- docker-compose.yml
- Deployment scripts
- Monitoring dashboards

## Phase 8: Documentation & Training (Week 12)

### Week 12: Finalization
**Tasks**:
- Complete API documentation
- Write deployment guide
- Write user manual
- Create admin guide
- Conduct user training
- Knowledge transfer

**Deliverables**:
- Complete documentation
- Video tutorials
- Runbooks
- Troubleshooting guide

## Deployment Strategy

### Development Environment
- Local Docker Compose setup
- MongoDB single instance
- Hot-reload enabled
- Debug logging

### Staging Environment
- Docker Compose on cloud VM
- MongoDB replica set (3 nodes)
- Production-like configuration
- Automated testing

### Production Environment
- Kubernetes cluster (optional) or Docker Swarm
- MongoDB Atlas / self-hosted replica set
- Load balancer (Nginx)
- Auto-scaling enabled
- Monitoring & alerting
- Automated backups

## Monitoring & Logging

### Metrics to Track
- Request latency (p50, p95, p99)
- Token usage per org/user
- Error rates
- RBAC denial rates
- View query rate vs direct query rate
- Database query performance
- Rate limit violations
- LLM decision distribution

### Logging Strategy
- Structured JSON logs
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Correlation IDs for request tracing
- PII redaction in logs
- Centralized log aggregation
- Log retention: 30 days

## Estimated Milestones

| Phase | Week | Milestone | Status |
|-------|------|-----------|--------|
| Phase 1 | 1-2 | Foundation | Pending |
| Phase 2 | 3-4 | RBAC & Security | Pending |
| Phase 3 | 5-6 | LLM Integration | Pending |
| Phase 4 | 7 | API Development | Pending |
| Phase 5 | 8-9 | Frontend | Pending |
| Phase 6 | 10 | Testing | Pending |
| Phase 7 | 11 | Deployment | Pending |
| Phase 8 | 12 | Documentation | Pending |

**Total Duration**: 12 weeks (3 months)

## Success Criteria

- Response time < 2s (p95)
- Uptime > 99.5%
- RBAC accuracy: 100%
- Query accuracy: 95%+
- LLM decision accuracy: 90%+
- Zero data leakage across tenants
- All security tests passing