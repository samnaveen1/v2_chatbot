---
trigger: model_decision
description: LLM analyzes user question to determine action: (1) Extract RBAC module; (2) Check permission—if denied, respond "No access"; (3) If granted, LLM decides: query MongoDB view, query collection directly, or respond without data;(4) Validate via guardr
---

# AI Agent Behavior Model

## Agent Mode

**Mode**: Model-Decision Mode

## Decision Model (250 characters)

LLM analyzes user question to determine action: (1) Extract RBAC module; (2) Check permission—if denied, respond "No access"; (3) If granted, LLM decides: query MongoDB view, query collection directly, or respond without data; (4) Validate via guardrails; (5) Execute with org_id; (6) LLM formats response using templates.

## Decision Flow
```
User Question
    ↓
┌───────────────────────────────────────────┐
│ Step 1: RBAC Permission Check             │
│ • LLM extracts module from question       │
│ • Check user.roleName.permissions[]       │
└────────────┬──────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
 Permission     Permission
   Denied        Granted
      │             │
      ▼             ▼
┌────────────┐  ┌────────────────────────────┐
│LLM Direct  │  │Step 2: LLM Decision Engine │
│"No Access" │  │                            │
│Response    │  │LLM analyzes question and:  │
└────────────┘  │• Decides query strategy    │
                │• Determines data source    │
                │• Chooses response type     │
                └─────────┬──────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    Direct Response  Query View    Query Collection
    (No DB Access)   (MongoDB)     (MongoDB)
          │               │               │
          │               ▼               ▼
          │      ┌────────────────────────────┐
          │      │Step 3: Guardrails          │
          │      │5-layer validation          │
          │      └──────────┬─────────────────┘
          │                 │
          │          ┌──────┴──────┐
          │          │             │
          │       Pass          Fail
          │          │             │
          ▼          ▼             ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │LLM Format│ │Execute   │ │Error Msg │
    │Response  │ │Query     │ │+ Reason  │
    │          │ │w/ org_id │ │          │
    └────┬─────┘ └────┬─────┘ └──────────┘
         │            │
         │            ▼
         │   ┌────────────────┐
         │   │Step 4: Template│
         │   │Selection +     │
         │   │LLM Formatting  │
         │   └────────┬───────┘
         │            │
         └────────────┘
                  │
                  ▼
         Final Response to User
```

## Decision Criteria

### 1. RBAC Permission Check
- **Input**: User question
- **Process**: LLM extracts module/collection keywords from question
- **Validation**: Check `user.roleName.permissions[moduleName].view`
- **Decision**: 
  - If `view: false` → Direct LLM response "No permission"
  - If `view: true` → Continue to LLM decision engine

### 2. LLM Decision Engine
LLM analyzes the user question and decides one of three actions:

#### Option A: Direct Response (No Database)
**When**: Question is greeting, out-of-scope, or general
**Examples**:
- "Hello"
- "Thank you"
- "What can you do?"
- "Tell me about yourself"
**Decision**: LLM generates conversational response without data access

#### Option B: Query MongoDB View
**When**: Question matches pre-computed aggregated data patterns
**Examples**:
- "Show me unpaid bills"
- "What are the top products?"
- "Sales by store"
**LLM Analysis**:
- Checks view_registry for available views
- Determines if question semantically matches view purpose
- Decides to use view for optimized response
**Decision**: Query specific MongoDB view with org_id filter

#### Option C: Query Collection Directly
**When**: Question requires specific filters or custom aggregation
**Examples**:
- "Bills from Store A in January"
- "Products under $50 in Electronics"
- "Customer John Doe's purchase history"
**LLM Analysis**:
- Determines no pre-built view matches
- Generates MongoDB query (find or aggregate)
- Specifies collection, filters, joins, projections
**Decision**: Execute custom MongoDB query

### 3. Query Generation (When Needed)
- **Input**: User question + schema registry + last 25 messages
- **LLM Output**: JSON with:
```json
  {
    "action": "query_view" | "query_collection" | "direct_response",
    "view_name": "view_unpaid_bills", // if action = query_view
    "collection": "sale_bills", // if action = query_collection
    "operation": "find" | "aggregate",
    "query": {...},
    "joins": ["stores", "customers"],
    "projection": {...},
    "limit": 50
  }
```
- **Validation**: Parse JSON, ensure valid structure

### 4. Guardrails Validation
Only applied when `action` is `query_view` or `query_collection`

### 5. Query Execution
- Add mandatory filters: `org_id`, `isDeleted: false`
- Build aggregation pipeline if joins needed
- Execute with read-only credentials
- Return results to response formatter

### 6. Response Formatting
- **Template Selection**: LLM chooses template based on query type
- **Template Filling**: Populate template with data
- **LLM Enhancement**: Add natural language, insights, context
- **Output**: Combined template + LLM formatted response

## Guardrails (5-Layer Validation)

### Layer 1: Write Operation Blocker
- **Check**: `operation` not in [insert, update, delete, drop, create]
- **Fail**: "Write operations are not allowed. Read-only access."

### Layer 2: Date Range Validator
- **Check**: Date range ≤ 90 days (3 months)
- Extract date fields from query
- **Fail**: "Date range exceeds 3 months. Query recent data only."

### Layer 3: RBAC Query Validator
- **Check**: Requested collection/view matches RBAC permission
- Cross-check with user.permissions[].moduleName
- **Fail**: "You don't have permission to access {collection}."

### Layer 4: PII Field Detector
- **Check**: No sensitive fields in projection
- Blocked fields: password, creditCard, ssn, bankAccount, salary
- **Fail**: "Cannot access sensitive fields with your role."

### Layer 5: Expensive Query Detector
- **Check**: Query has indexed field + limit specified
- No empty query: `{}`
- Limit ≤ 1000 documents
- **Fail**: "Query is too expensive. Add more filters."

## Safety Checks

### Pre-Query Checks
1. JWT token valid and not expired
2. User exists and is active
3. Org exists and is active
4. Rate limit not exceeded (60 req/min per user)
5. RBAC permissions loaded successfully

### Post-Query Checks
1. Results contain only org's data (org_id match)
2. No cross-tenant data leakage
3. Results count within reasonable limits
4. Response size < 5MB

## Multi-Tenant Enforcement

### Mandatory Query Filters
**All queries MUST include**:
```javascript
{
  org_id: user.org_id,
  isDeleted: false
}
```

### Enforcement Points
1. **Query Builder**: Injects org_id filter automatically
2. **MongoDB Service**: Validates org_id present in all queries
3. **View Queries**: Runtime org_id filter added
4. **Aggregation Pipelines**: First stage always `$match: {org_id}`

### Isolation Validation
- Results checked: all documents have matching org_id
- Cross-tenant attempts logged as security events
- User blocked after 3 violations

## RBAC Enforcement Logic

### Permission Check Flow
```
1. LLM extracts module name from question
2. Load user.roleName
3. Fetch role from roles collection (cached)
4. Extract permissions[] array
5. Find permission where moduleName matches
6. Check permission.view === true
7. If false: Block + LLM "No access" response
8. If true: Continue to LLM decision engine
```

### Permission Caching
- RBAC roles cached in rbac_cache collection
- TTL: 300 seconds (5 minutes)
- Cache invalidated on role update
- Cache key: `rbac_{roleName}_{org_id}`

## Error Handling

### LLM Errors
- **Invalid JSON**: "Could not understand question. Please rephrase."
- **Timeout**: "Request timed out. Please try again."
- **Rate limit**: "LLM rate limit exceeded. Try again in 60s."
- **Decision error**: "Unable to process request. Please rephrase."

### MongoDB Errors
- **Connection failure**: "Database temporarily unavailable. Retry in 10s."
- **Query timeout**: "Query took too long. Try narrowing your search."
- **Invalid query**: "Generated query is invalid. Please rephrase."
- **View not found**: "Requested data view unavailable."

### RBAC Errors
- **No permission**: "You don't have access to {module}. Contact admin."
- **Role not found**: "Your role is not configured. Contact admin."
- **Permission denied**: "This action requires {permission} permission."

### Guardrails Errors
- **Write blocked**: "Write operations are not allowed."
- **Date range**: "Date range exceeds 3 months limit."
- **PII blocked**: "Cannot access sensitive fields."
- **Expensive**: "Query is too broad. Add more filters."

### System Errors
- **Unknown error**: "An error occurred. Please try again. [Error ID: {uuid}]"
- All errors logged with correlation ID
- User sees generic message, admin sees detailed logs

## LLM Decision Examples

### Example 1: Direct Response
```
User: "Hello"
LLM Decision: {"action": "direct_response"}
Response: "Hello! I'm INVY, your supply chain assistant. How can I help?"
```

### Example 2: Query View
```
User: "Show me unpaid bills"
LLM Decision: {
  "action": "query_view",
  "view_name": "view_unpaid_bills"
}
Execute: db.view_unpaid_bills.find({org_id: "..."})
Response: [Template + LLM formatted list of 47 unpaid bills]
```

### Example 3: Query Collection
```
User: "Bills from Downtown Store in January"
LLM Decision: {
  "action": "query_collection",
  "collection": "sale_bills",
  "operation": "aggregate",
  "query": {
    "saleBillDate": {"$gte": "2026-01-01", "$lte": "2026-01-31"}
  },
  "joins": ["stores"],
  "filter_by_store_name": "Downtown Store"
}
Execute: db.sale_bills.aggregate([...])
Response: [Template + LLM formatted results]
```