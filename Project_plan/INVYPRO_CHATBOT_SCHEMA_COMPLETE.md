# INVYPRO Chatbot — MongoDB Schema Documentation

## Architecture Mode: Multi-Tenant with Organization Isolation

**Part 1: Chatbot System Collections**

---

## 🧱 CHATBOT SYSTEM COLLECTIONS

**Database:** `ChatBot_Invy`

**Purpose:** AI-powered chatbot system managing real-time conversations, LLM-driven query generation, RBAC enforcement, session management, and usage tracking with complete multi-tenant isolation.

**Access:** Application APIs only via FastAPI backend with JWT authentication and org_id filtering on every query.

**Collections:** 9

---

## Session & Message Management

### Collection: `chat_sessions`

Master session registry managing active and historical chat sessions for all users across all organizations with real-time status tracking, token consumption monitoring, and automatic session lifecycle management accessed exclusively via authenticated WebSocket connections.

| Field Name       | Data Type | Required | References         | Enum / Constraints    | Index Strategy                          | Description                                    |
| ---------------- | --------- | -------- | ------------------ | --------------------- | --------------------------------------- | ---------------------------------------------- |
| \_id             | ObjectId  | Yes      | —                  | —                     | Single                                  | Unique session identifier                      |
| session_id       | string    | Yes      | —                  | Unique, alphanumeric  | Unique                                  | Human-readable session ID (sess_abc123)        |
| org_id           | ObjectId  | Yes      | Ref: tenants.\_id  | —                     | Compound: {org_id: 1, user_id: 1, -1}   | Organization ID for tenant isolation           |
| user_id          | string    | Yes      | Ref: users.user_id | —                     | Compound: {org_id: 1, user_id: 1, -1}   | User who owns this session                     |
| status           | string    | Yes      | —                  | Enum: active, ended   | Compound: {status: 1, last_activity: -1}| Current session lifecycle status               |
| started_at       | date      | Yes      | —                  | —                     | Compound: {org_id: 1, started_at: -1}   | Session creation timestamp                     |
| ended_at         | date      | No       | —                  | —                     | —                                       | Session end timestamp (null if active)         |
| message_count    | integer   | Yes      | —                  | Default: 0, Min: 0    | —                                       | Total messages in session (user + assistant)   |
| tokens_used      | integer   | Yes      | —                  | Default: 0, Min: 0    | —                                       | Total tokens consumed in session               |
| last_activity    | date      | Yes      | —                  | —                     | Compound: {status: 1, last_activity: -1}| Last message timestamp (for auto-cleanup)      |
| isDeleted        | boolean   | Yes      | —                  | Default: false        | Single                                  | Soft delete flag                               |
| createdAt        | date      | Yes      | —                  | —                     | Single                                  | Record creation timestamp                      |
| updatedAt        | date      | Yes      | —                  | —                     | —                                       | Last update timestamp                          |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
  "session_id": "sess_abc123xyz456",
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "user_id": "usr_john_doe_001",
  "status": "active",
  "started_at": ISODate("2026-02-25T08:30:00Z"),
  "ended_at": null,
  "message_count": 12,
  "tokens_used": 8450,
  "last_activity": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false,
  "createdAt": ISODate("2026-02-25T08:30:00Z"),
  "updatedAt": ISODate("2026-02-25T09:15:30Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 1M+ sessions per year (100K active sessions daily)
- **Indexes:**
  - Unique index on `session_id` for O(1) lookup
  - Compound index on `{org_id: 1, user_id: 1, started_at: -1}` for user history
  - Compound index on `{status: 1, last_activity: -1}` for cleanup jobs
  - Single index on `isDeleted` for soft delete filtering
- **Cleanup Strategy:**
  - Sessions inactive for 7 days auto-marked as "ended"
  - Sessions older than 90 days soft-deleted via batch job
  - Hard delete after 180 days retention
- **Query Patterns:**
  - Lookup by `session_id`: O(1) with unique index
  - User session history: Filtered by `{org_id, user_id}` sorted by date
  - Active sessions: Filtered by `{status: "active", last_activity: recent}`

---

### Collection: `chat_messages`

Complete message history storing all user queries and bot responses across all sessions with full metadata including LLM decision tracking, token consumption, RBAC module access logging, and automatic TTL-based archival for compliance and audit trail.

| Field Name       | Data Type | Required | References                | Enum / Constraints                         | Index Strategy                              | TTL Strategy            | Description                                          |
| ---------------- | --------- | -------- | ------------------------- | ------------------------------------------ | ------------------------------------------- | ----------------------- | ---------------------------------------------------- |
| \_id             | ObjectId  | Yes      | —                         | —                                          | Single                                      | —                       | Unique message identifier                            |
| message_id       | string    | Yes      | —                         | Unique, alphanumeric                       | Unique                                      | —                       | Human-readable message ID (msg_abc123)               |
| session_id       | string    | Yes      | Ref: chat_sessions.id     | —                                          | Compound: {session_id: 1, timestamp: -1}    | —                       | Parent session reference                             |
| org_id           | ObjectId  | Yes      | Ref: tenants.\_id         | —                                          | Compound: {org_id: 1, user_id: 1, -1}       | —                       | Organization ID for tenant isolation                 |
| user_id          | string    | Yes      | Ref: users.user_id        | —                                          | Compound: {org_id: 1, user_id: 1, -1}       | —                       | User who sent/received message                       |
| role             | string    | Yes      | —                         | Enum: user, assistant                      | Compound: {role: 1, timestamp: -1}          | —                       | Message sender role                                  |
| content          | string    | Yes      | —                         | Max: 10,000 chars                          | —                                           | —                       | Message text content                                 |
| source           | string    | Yes      | —                         | Enum: llm_query, llm_view, llm_direct      | —                                           | —                       | How response was generated                           |
| view_used        | string    | No       | Ref: view_registry.name   | —                                          | —                                           | —                       | MongoDB view name if used                            |
| module_accessed  | string    | No       | Ref: roles.moduleName     | —                                          | —                                           | —                       | RBAC module accessed (for audit)                     |
| query_generated  | object    | No       | —                         | MongoDB query JSON                         | —                                           | —                       | Generated MongoDB query (if applicable)              |
| tokens_used      | integer   | Yes      | —                         | Default: 0, Min: 0                         | —                                           | —                       | Tokens consumed for this message                     |
| timestamp        | date      | Yes      | —                         | —                                          | Compound: {session_id: 1, timestamp: -1}    | TTL: 7776000 (90 days)  | Message creation timestamp (with TTL index)          |
| isDeleted        | boolean   | Yes      | —                         | Default: false                             | —                                           | —                       | Soft delete flag                                     |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d3"),
  "message_id": "msg_xyz789abc123",
  "session_id": "sess_abc123xyz456",
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "user_id": "usr_john_doe_001",
  "role": "assistant",
  "content": "I found 47 unpaid bills from last month totaling ₹3,24,500. Here are the top 10: ...",
  "source": "llm_view",
  "view_used": "view_unpaid_bills",
  "module_accessed": "Sale Bills",
  "query_generated": {
    "action": "query_view",
    "view_name": "view_unpaid_bills",
    "filters": {
      "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
      "isDeleted": false
    }
  },
  "tokens_used": 850,
  "timestamp": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 100M+ messages per year (300K messages daily)
- **Indexes:**
  - Unique index on `message_id` for O(1) lookup
  - Compound index on `{session_id: 1, timestamp: -1}` for session history
  - Compound index on `{org_id: 1, user_id: 1, timestamp: -1}` for user analytics
  - Compound index on `{role: 1, timestamp: -1}` for filtering user/bot messages
  - **TTL Index:** `{timestamp: 1}` with `expireAfterSeconds: 7776000` (90 days auto-delete)
- **Bounded Storage:**
  - Only last 25 messages per session kept in active memory
  - Older messages archived but queryable via API
  - TTL index auto-deletes messages after 90 days
- **Query Patterns:**
  - Session messages: `{session_id, timestamp: -1}` with limit 25
  - User history: `{org_id, user_id, timestamp: -1}` paginated
  - Audit trail: `{module_accessed, timestamp}` for compliance

---

## User Preferences & Settings

### Collection: `user_preferences`

User-specific configuration settings for UI customization, LLM provider preferences, display options, and feature flags with per-user granularity enabling personalized chatbot experience across all sessions.

| Field Name         | Data Type | Required | References         | Enum / Constraints                                      | Index Strategy                 | Description                                |
| ------------------ | --------- | -------- | ------------------ | ------------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| \_id               | ObjectId  | Yes      | —                  | —                                                       | Single                         | Unique preference record identifier        |
| org_id             | ObjectId  | Yes      | Ref: tenants.\_id  | —                                                       | Compound: {org_id: 1}          | Organization ID for tenant isolation       |
| user_id            | string    | Yes      | Ref: users.user_id | Unique per org                                          | Unique                         | User who owns these preferences            |
| theme              | string    | Yes      | —                  | Enum: light, dark, auto, Default: auto                  | —                              | UI theme preference                        |
| language           | string    | Yes      | —                  | ISO 639-1, Default: en                                  | —                              | Preferred language for responses           |
| timezone           | string    | Yes      | —                  | IANA timezone, Default: Asia/Kolkata                    | —                              | User timezone for timestamp display        |
| default_provider   | string    | No       | —                  | Enum: openai, anthropic, google, groq, Default: groq    | —                              | Preferred LLM provider                     |
| show_token_count   | boolean   | Yes      | —                  | Default: false                                          | —                              | Display token usage in UI                  |
| isDeleted          | boolean   | Yes      | —                  | Default: false                                          | —                              | Soft delete flag                           |
| createdAt          | date      | Yes      | —                  | —                                                       | —                              | Preferences creation timestamp             |
| updatedAt          | date      | Yes      | —                  | —                                                       | —                              | Last update timestamp                      |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d4"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "user_id": "usr_john_doe_001",
  "theme": "dark",
  "language": "en",
  "timezone": "Asia/Kolkata",
  "default_provider": "groq",
  "show_token_count": true,
  "isDeleted": false,
  "createdAt": ISODate("2026-01-15T10:00:00Z"),
  "updatedAt": ISODate("2026-02-20T14:30:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 1:1 with user count (100K users = 100K preference docs)
- **Indexes:**
  - Unique index on `user_id` for O(1) user lookup
  - Compound index on `{org_id: 1}` for organization filtering
- **Query Patterns:**
  - User preferences load: `{user_id}` on every login (cached in session)
  - Bulk org queries: `{org_id}` for admin analytics

---

## API Key Management (BYOK)

### Collection: `api_keys`

Encrypted storage of organization-level LLM provider API keys enabling Bring Your Own Key (BYOK) functionality with per-provider configuration, automatic key validation, usage tracking, and secure Fernet encryption for multi-tenant API key management.

| Field Name        | Data Type | Required | References        | Enum / Constraints                           | Index Strategy                         | Description                                   |
| ----------------- | --------- | -------- | ----------------- | -------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| \_id              | ObjectId  | Yes      | —                 | —                                            | Single                                 | Unique API key record identifier              |
| org_id            | ObjectId  | Yes      | Ref: tenants.\_id | —                                            | Compound: {org_id: 1, provider: 1}     | Organization owning this API key              |
| provider          | string    | Yes      | —                 | Enum: openai, anthropic, google, groq        | Compound: {org_id: 1, provider: 1}     | LLM provider name                             |
| encrypted_key     | string    | Yes      | —                 | Fernet encrypted                             | —                                      | Encrypted API key (never stored plaintext)    |
| encryption_method | string    | Yes      | —                 | Default: fernet_aes256                       | —                                      | Encryption algorithm used                     |
| is_active         | boolean   | Yes      | —                 | Default: true                                | Compound: {is_active: 1}               | Whether key is currently active               |
| last_tested       | date      | No       | —                 | —                                            | —                                      | Last successful validation timestamp          |
| last_used         | date      | No       | —                 | —                                            | —                                      | Last time key was used in API call            |
| isDeleted         | boolean   | Yes      | —                 | Default: false                               | —                                      | Soft delete flag                              |
| createdAt         | date      | Yes      | —                 | —                                            | —                                      | Key creation timestamp                        |
| updatedAt         | date      | Yes      | —                 | —                                            | —                                      | Last update timestamp                         |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d5"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "provider": "groq",
  "encrypted_key": "gAAAAABl8x... [Fernet encrypted base64]",
  "encryption_method": "fernet_aes256",
  "is_active": true,
  "last_tested": ISODate("2026-02-25T08:00:00Z"),
  "last_used": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false,
  "createdAt": ISODate("2026-01-20T10:00:00Z"),
  "updatedAt": ISODate("2026-02-25T09:15:30Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 4 keys per org × 1K orgs = 4K documents (low volume)
- **Indexes:**
  - Compound unique index on `{org_id: 1, provider: 1}` (one key per provider per org)
  - Single index on `{is_active: 1}` for filtering active keys
- **Security:**
  - Keys encrypted with Fernet (AES-256)
  - Encryption key stored in environment variable, never in database
  - Key rotation supported via re-encryption jobs
  - All key access logged in `usage_logs`
- **Query Patterns:**
  - Get org keys: `{org_id, is_active: true}`
  - Get specific provider: `{org_id, provider, is_active: true}`

---

## Usage Tracking & Analytics

### Collection: `usage_logs`

Granular logging of every LLM API call including token consumption, query type classification, RBAC module access, cost tracking (if applicable), and source attribution with automatic TTL-based cleanup for compliance and cost analytics across all organizations.

| Field Name       | Data Type | Required | References              | Enum / Constraints                              | Index Strategy                           | TTL Strategy              | Description                                    |
| ---------------- | --------- | -------- | ----------------------- | ----------------------------------------------- | ---------------------------------------- | ------------------------- | ---------------------------------------------- |
| \_id             | ObjectId  | Yes      | —                       | —                                               | Single                                   | —                         | Unique log entry identifier                    |
| org_id           | ObjectId  | Yes      | Ref: tenants.\_id       | —                                               | Compound: {org_id: 1, timestamp: -1}     | —                         | Organization ID for tenant isolation           |
| user_id          | string    | Yes      | Ref: users.user_id      | —                                               | Compound: {user_id: 1, timestamp: -1}    | —                         | User who triggered the API call                |
| session_id       | string    | Yes      | Ref: chat_sessions.id   | —                                               | Compound: {session_id: 1}                | —                         | Session context reference                      |
| provider         | string    | Yes      | —                       | Enum: openai, anthropic, google, groq           | —                                        | —                         | LLM provider used                              |
| tokens_input     | integer   | Yes      | —                       | Min: 0                                          | —                                        | —                         | Input tokens consumed                          |
| tokens_output    | integer   | Yes      | —                       | Min: 0                                          | —                                        | —                         | Output tokens consumed                         |
| tokens_total     | integer   | Yes      | —                       | Min: 0, Computed: input + output                | —                                        | —                         | Total tokens consumed                          |
| query_type       | string    | Yes      | —                       | Enum: direct_query, view_query, direct_response | —                                        | —                         | Classification of query intent                 |
| source           | string    | Yes      | —                       | Enum: llm_query, llm_view, llm_direct           | —                                        | —                         | How response was generated                     |
| module_accessed  | string    | No       | Ref: roles.moduleName   | —                                               | —                                        | —                         | RBAC module accessed (for audit)               |
| had_permission   | boolean   | Yes      | —                       | Default: true                                   | —                                        | —                         | Whether RBAC check passed                      |
| timestamp        | date      | Yes      | —                       | —                                               | Compound: {org_id: 1, timestamp: -1}     | TTL: 15552000 (180 days)  | Log entry timestamp (with TTL index)           |
| isDeleted        | boolean   | Yes      | —                       | Default: false                                  | —                                        | —                         | Soft delete flag                               |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d6"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "user_id": "usr_john_doe_001",
  "session_id": "sess_abc123xyz456",
  "provider": "groq",
  "tokens_input": 3500,
  "tokens_output": 850,
  "tokens_total": 4350,
  "query_type": "view_query",
  "source": "llm_view",
  "module_accessed": "Sale Bills",
  "had_permission": true,
  "timestamp": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 300K logs per day × 365 days = 109M logs per year
- **Indexes:**
  - Compound index on `{org_id: 1, timestamp: -1}` for org analytics
  - Compound index on `{user_id: 1, timestamp: -1}` for user analytics
  - Compound index on `{session_id: 1}` for session-level aggregation
  - **TTL Index:** `{timestamp: 1}` with `expireAfterSeconds: 15552000` (180 days auto-delete)
- **Aggregation Pipeline:**
  - Daily rollup to `org_usage_aggregated` for fast dashboard queries
  - Weekly/monthly reports pre-computed and cached
- **Query Patterns:**
  - Org daily usage: `{org_id, timestamp: {$gte: today}}`
  - User usage: `{user_id, timestamp: {$gte: start_date}}`
  - Session breakdown: `{session_id}` aggregated

---

### Collection: `org_usage_aggregated`

Pre-aggregated organization-level usage statistics providing fast dashboard queries for total tokens consumed, query counts, view vs LLM query distribution, and last activity tracking without expensive real-time aggregations on usage_logs collection.

| Field Name      | Data Type | Required | References        | Enum / Constraints | Index Strategy                  | Description                                   |
| --------------- | --------- | -------- | ----------------- | ------------------ | ------------------------------- | --------------------------------------------- |
| \_id            | ObjectId  | Yes      | —                 | —                  | Single                          | Unique aggregated record identifier           |
| org_id          | ObjectId  | Yes      | Ref: tenants.\_id | Unique             | Unique                          | Organization ID                               |
| total_tokens    | integer   | Yes      | —                 | Default: 0, Min: 0 | —                               | Cumulative tokens across all time             |
| total_queries   | integer   | Yes      | —                 | Default: 0, Min: 0 | —                               | Total query count                             |
| view_queries    | integer   | Yes      | —                 | Default: 0, Min: 0 | —                               | Queries served by MongoDB views               |
| direct_queries  | integer   | Yes      | —                 | Default: 0, Min: 0 | —                               | Queries served by direct collection access    |
| llm_calls       | integer   | Yes      | —                 | Default: 0, Min: 0 | —                               | Total LLM API calls made                      |
| last_query      | date      | No       | —                 | —                  | —                               | Timestamp of most recent query                |
| isDeleted       | boolean   | Yes      | —                 | Default: false     | —                               | Soft delete flag                              |
| createdAt       | date      | Yes      | —                 | —                  | —                               | Record creation timestamp                     |
| updatedAt       | date      | Yes      | —                 | —                  | —                               | Last update timestamp                         |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d7"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "total_tokens": 1250000,
  "total_queries": 5420,
  "view_queries": 3250,
  "direct_queries": 2170,
  "llm_calls": 5420,
  "last_query": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false,
  "createdAt": ISODate("2026-01-15T00:00:00Z"),
  "updatedAt": ISODate("2026-02-25T09:15:30Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 1 document per organization (1K orgs = 1K documents, very low volume)
- **Indexes:**
  - Unique index on `org_id` for O(1) org lookup
- **Update Strategy:**
  - Incremented via atomic `$inc` operations on every query completion
  - Updated in real-time (no batch jobs needed)
  - Fast dashboard queries without aggregating millions of `usage_logs`
- **Query Patterns:**
  - Org dashboard: `{org_id}` returns instant metrics
  - All orgs ranking: Sort by `total_queries` or `total_tokens`

---

## Rate Limiting

### Collection: `rate_limit_requests`

Ephemeral request tracking for rate limiting enforcement using MongoDB TTL index with automatic 60-second expiration enabling per-user request throttling without external cache dependencies and automatic cleanup of expired records.

| Field Name | Data Type | Required | References         | Enum / Constraints | Index Strategy                           | TTL Strategy              | Description                              |
| ---------- | --------- | -------- | ------------------ | ------------------ | ---------------------------------------- | ------------------------- | ---------------------------------------- |
| \_id       | ObjectId  | Yes      | —                  | —                  | Single                                   | —                         | Unique request record identifier         |
| org_id     | ObjectId  | Yes      | Ref: tenants.\_id  | —                  | Compound: {org_id: 1}                    | —                         | Organization ID for tenant isolation     |
| user_id    | string    | Yes      | Ref: users.user_id | —                  | Compound: {user_id: 1, timestamp: -1}    | —                         | User making the request                  |
| timestamp  | date      | Yes      | —                  | —                  | Compound: {user_id: 1, timestamp: -1}    | TTL: 60 (60 seconds)      | Request timestamp (TTL auto-deletes)     |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d8"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "user_id": "usr_john_doe_001",
  "timestamp": ISODate("2026-02-25T09:15:30Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** High write volume (1000+ writes/sec) but auto-deleted after 60 seconds
- **Storage:** Maximum ~60K active documents per organization (60 req/sec × 60 sec × 10 users avg)
- **Indexes:**
  - Compound index on `{user_id: 1, timestamp: -1}` for rate limit checks
  - **TTL Index:** `{timestamp: 1}` with `expireAfterSeconds: 60` (auto-cleanup)
- **Rate Limiting Logic:**
  ```javascript
  // Check: Count requests in last 60 seconds
  count = db.rate_limit_requests.countDocuments({
    user_id: "usr_john_doe_001",
    timestamp: {$gte: new Date(Date.now() - 60000)}
  })
  
  if (count >= 60) {
    throw RateLimitExceeded("60 requests per minute limit reached")
  }
  
  // Log this request (auto-expires in 60 seconds)
  db.rate_limit_requests.insertOne({
    org_id: ObjectId("..."),
    user_id: "usr_john_doe_001",
    timestamp: new Date()
  })
  ```
- **Query Patterns:**
  - Rate check: `{user_id, timestamp: {$gte: 60_seconds_ago}}` count
  - Automatic cleanup by MongoDB TTL (no manual deletion needed)

---

## View Analytics

### Collection: `view_usage_logs`

Tracking of MongoDB view query usage for analytics on view hit rates, LLM decision patterns, and frequently accessed views enabling optimization decisions and understanding which pre-computed views provide the most value.

| Field Name    | Data Type | Required | References              | Enum / Constraints | Index Strategy                       | Description                                |
| ------------- | --------- | -------- | ----------------------- | ------------------ | ------------------------------------ | ------------------------------------------ |
| \_id          | ObjectId  | Yes      | —                       | —                  | Single                               | Unique view usage log identifier           |
| org_id        | ObjectId  | Yes      | Ref: tenants.\_id       | —                  | Compound: {org_id: 1, timestamp: -1} | Organization ID for tenant isolation       |
| view_name     | string    | Yes      | Ref: view_registry.name | —                  | Compound: {view_name: 1, -1}         | MongoDB view name accessed                 |
| user_id       | string    | Yes      | Ref: users.user_id      | —                  | —                                    | User who triggered view query              |
| question      | string    | Yes      | —                       | Max: 1000 chars    | —                                    | Original user question                     |
| llm_decision  | boolean   | Yes      | —                       | Default: true      | —                                    | Whether LLM decided to use view            |
| timestamp     | date      | Yes      | —                       | —                  | Compound: {view_name: 1, -1}         | View access timestamp                      |
| isDeleted     | boolean   | Yes      | —                       | Default: false     | —                                    | Soft delete flag                           |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d9"),
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "view_name": "view_unpaid_bills",
  "user_id": "usr_john_doe_001",
  "question": "Show me unpaid bills from last month",
  "llm_decision": true,
  "timestamp": ISODate("2026-02-25T09:15:30Z"),
  "isDeleted": false
}
```

**Scale & Performance Notes:**

- **Expected Growth:** ~60% of all queries = 180K logs per day
- **Indexes:**
  - Compound index on `{view_name: 1, timestamp: -1}` for view popularity ranking
  - Compound index on `{org_id: 1, timestamp: -1}` for org analytics
- **Analytics Queries:**
  - Top views: Group by `view_name`, count, sort descending
  - LLM decision accuracy: % where `llm_decision: true` and view returned results
  - View ROI: Cost savings = (view queries × avg LLM cost) - view maintenance cost

---

## User Feedback

### Collection: `feedback`

User satisfaction ratings and feedback comments on bot responses enabling continuous improvement tracking, quality monitoring, and identification of problematic queries or response patterns with status workflow for review and resolution.

| Field Name  | Data Type | Required | References             | Enum / Constraints                  | Index Strategy                       | Description                               |
| ----------- | --------- | -------- | ---------------------- | ----------------------------------- | ------------------------------------ | ----------------------------------------- |
| \_id        | ObjectId  | Yes      | —                      | —                                   | Single                               | Unique feedback record identifier         |
| feedback_id | string    | Yes      | —                      | Unique, alphanumeric                | Unique                               | Human-readable feedback ID (fb_abc123)    |
| org_id      | ObjectId  | Yes      | Ref: tenants.\_id      | —                                   | Compound: {org_id: 1, createdAt: -1} | Organization ID for tenant isolation      |
| session_id  | string    | Yes      | Ref: chat_sessions.id  | —                                   | —                                    | Session context reference                 |
| message_id  | string    | Yes      | Ref: chat_messages.id  | —                                   | —                                    | Specific message being rated              |
| user_id     | string    | Yes      | Ref: users.user_id     | —                                   | —                                    | User who provided feedback                |
| rating      | integer   | Yes      | —                      | Min: 1, Max: 5                      | —                                    | Star rating (1-5)                         |
| comment     | string    | No       | —                      | Max: 2000 chars                     | —                                    | Optional user comment                     |
| status      | string    | Yes      | —                      | Enum: open, reviewed, resolved      | Compound: {status: 1}                | Feedback review status                    |
| isDeleted   | boolean   | Yes      | —                      | Default: false                      | —                                    | Soft delete flag                          |
| createdAt   | date      | Yes      | —                      | —                                   | Compound: {org_id: 1, createdAt: -1} | Feedback submission timestamp             |
| updatedAt   | date      | Yes      | —                      | —                                   | —                                    | Last update timestamp                     |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0da"),
  "feedback_id": "fb_xyz789abc123",
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "session_id": "sess_abc123xyz456",
  "message_id": "msg_xyz789abc123",
  "user_id": "usr_john_doe_001",
  "rating": 5,
  "comment": "Perfect! Got exactly what I needed. Very fast response.",
  "status": "open",
  "isDeleted": false,
  "createdAt": ISODate("2026-02-25T09:16:00Z"),
  "updatedAt": ISODate("2026-02-25T09:16:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** ~10% of messages get feedback = 30K feedback per day
- **Indexes:**
  - Unique index on `feedback_id` for O(1) lookup
  - Compound index on `{org_id: 1, createdAt: -1}` for org feedback tracking
  - Compound index on `{status: 1}` for admin review queue
- **Analytics Queries:**
  - Average rating: `$avg` on `rating` field
  - Low rating alerts: `{rating: {$lte: 2}, status: "open"}` for review
  - User satisfaction trend: Daily average rating over time

---

## RBAC Permission Cache

### Collection: `rbac_cache`

Temporary cache of RBAC role permissions with TTL expiration to reduce repeated database lookups to the main `roles` collection enabling faster permission checks with automatic cache invalidation on role updates.

| Field Name | Data Type | Required | References | Enum / Constraints                    | Index Strategy | TTL Strategy             | Description                                    |
| ---------- | --------- | -------- | ---------- | ------------------------------------- | -------------- | ------------------------ | ---------------------------------------------- |
| \_id       | ObjectId  | Yes      | —          | —                                     | Single         | —                        | Unique cache entry identifier                  |
| cache_key  | string    | Yes      | —          | Unique, Format: rbac_{roleName}_{org} | Unique         | —                        | Cache key for lookup                           |
| role_data  | object    | Yes      | —          | Full role document from roles         | —              | —                        | Cached role permissions data                   |
| cached_at  | date      | Yes      | —          | —                                     | —              | —                        | Cache creation timestamp                       |
| expires_at | date      | Yes      | —          | Computed: cached_at + 300 seconds     | Single         | TTL: 0 (uses expires_at) | Cache expiration timestamp (TTL auto-deletes)  |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0db"),
  "cache_key": "rbac_Store_admin_65f1a2b3c4d5e6f7a8b9c0d2",
  "role_data": {
    "roleName": "Store admin",
    "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
    "permissions": [
      {
        "moduleName": "Sale Bills",
        "view": true,
        "create": false,
        "edit": false,
        "delete": false
      }
    ]
  },
  "cached_at": ISODate("2026-02-25T09:10:00Z"),
  "expires_at": ISODate("2026-02-25T09:15:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** ~50 roles × 1K orgs = 50K cache entries max (low volume)
- **Indexes:**
  - Unique index on `cache_key` for O(1) lookup
  - **TTL Index:** `{expires_at: 1}` with `expireAfterSeconds: 0` (uses document's expires_at value)
- **Cache Strategy:**
  - TTL: 300 seconds (5 minutes)
  - Cache invalidation on role update: Delete matching cache_key
  - Cache miss: Load from `roles` collection, populate cache
- **Query Patterns:**
  - Cache lookup: `{cache_key: "rbac_Store_admin_org123"}`
  - Cache miss → Load role → Insert cache → Return
  - Role update → `deleteMany({cache_key: /^rbac_Store_admin_/})`

---

## 🗂️ MAIN ERP DATABASE COLLECTIONS

**Database:** `invypro_main`

**Purpose:** Core supply chain ERP data with 120+ collections for sales, inventory, customers, products, warehouses, and financial transactions with complete RBAC enforcement and multi-tenant isolation.

**Access:** Queried by chatbot backend via LLM-generated MongoDB queries with automatic org_id and isDeleted filtering on every operation.

**Collections:** 120+

---

## User & Authentication

### Collection: `users`

Master user registry across all organizations containing authentication credentials, RBAC role assignments, and user account lifecycle management with JWT-based session handling and multi-tenant isolation via org_id.

| Field Name    | Data Type | Required | References        | Enum / Constraints            | Index Strategy                        | Description                              |
| ------------- | --------- | -------- | ----------------- | ----------------------------- | ------------------------------------- | ---------------------------------------- |
| \_id          | ObjectId  | Yes      | —                 | —                             | Single                                | Unique user record identifier            |
| user_id       | string    | Yes      | —                 | Unique, alphanumeric          | Unique                                | Human-readable user ID (usr_john_001)    |
| org_id        | ObjectId  | Yes      | Ref: tenants.\_id | —                             | Compound: {org_id: 1, username: 1}    | Organization ID for tenant isolation     |
| username      | string    | Yes      | —                 | Unique per org                | Compound: {org_id: 1, username: 1}    | Login username                           |
| email         | string    | Yes      | —                 | Unique, valid email           | Unique                                | User email address                       |
| password_hash | string    | Yes      | —                 | Bcrypt hashed                 | —                                     | Hashed password (never plaintext)        |
| full_name     | string    | Yes      | —                 | —                             | —                                     | User's full name                         |
| roleName      | string    | Yes      | Ref: roles.name   | —                             | Compound: {roleName: 1}               | RBAC role name                           |
| is_active     | boolean   | Yes      | —                 | Default: true                 | Compound: {is_active: 1, isDeleted: 1}| Account active status                    |
| last_login    | date      | No       | —                 | —                             | —                                     | Last login timestamp                     |
| isDeleted     | boolean   | Yes      | —                 | Default: false                | Compound: {is_active: 1, isDeleted: 1}| Soft delete flag                         |
| createdAt     | date      | Yes      | —                 | —                             | —                                     | User creation timestamp                  |
| updatedAt     | date      | Yes      | —                 | —                             | —                                     | Last update timestamp                    |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0dc"),
  "user_id": "usr_john_doe_001",
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "username": "john.doe",
  "email": "john.doe@acmeretail.com",
  "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL3MZmKzY2",
  "full_name": "John Doe",
  "roleName": "Store admin",
  "is_active": true,
  "last_login": ISODate("2026-02-25T08:30:00Z"),
  "isDeleted": false,
  "createdAt": ISODate("2026-01-10T10:00:00Z"),
  "updatedAt": ISODate("2026-02-25T08:30:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 1K organizations × 100 users avg = 100K users
- **Indexes:**
  - Unique index on `user_id` for O(1) lookup
  - Unique index on `email` for email-based login
  - Compound index on `{org_id: 1, username: 1}` for org user queries
  - Compound index on `{roleName: 1}` for role-based filtering
  - Compound index on `{is_active: 1, isDeleted: 1}` for active user filtering
- **Security:**
  - Passwords hashed with bcrypt (cost factor 12)
  - JWT tokens issued on successful login (stored in client, not database)
  - Session validated on every WebSocket message

---

### Collection: `roles`

RBAC role definitions containing granular permissions for all modules/collections with CRUD operation flags, report access, and approval workflow configurations enabling fine-grained access control across the entire ERP system.

| Field Name         | Data Type       | Required | References        | Enum / Constraints | Index Strategy                           | Description                                 |
| ------------------ | --------------- | -------- | ----------------- | ------------------ | ---------------------------------------- | ------------------------------------------- |
| \_id               | ObjectId        | Yes      | —                 | —                  | Single                                   | Unique role record identifier               |
| roleName           | string          | Yes      | —                 | Unique per org     | Compound: {roleName: 1, org_id: 1}       | Role name (e.g., "Store admin")             |
| org_id             | ObjectId        | Yes      | Ref: tenants.\_id | —                  | Compound: {roleName: 1, org_id: 1}       | Organization ID for tenant isolation        |
| allowedAppKeyNames | array[string]   | No       | —                 | —                  | —                                        | Allowed application modules                 |
| permissions        | array[object]   | Yes      | —                 | See below          | Index: {permissions.moduleName: 1}       | Array of module permissions                 |
| status             | boolean         | Yes      | —                 | Default: true      | Compound: {status: 1, isDeleted: 1}      | Role active status                          |
| isDeleted          | boolean         | Yes      | —                 | Default: false     | Compound: {status: 1, isDeleted: 1}      | Soft delete flag                            |
| createdAt          | date            | Yes      | —                 | —                  | —                                        | Role creation timestamp                     |
| updatedAt          | date            | Yes      | —                 | —                  | —                                        | Last update timestamp                       |

**Permission Object Structure:**
```javascript
{
  _id: ObjectId,
  appName: string,           // "BackOffice", "Store", "Reports"
  moduleName: string,        // "Sale Bills", "Master Products"
  moduleId: ObjectId,
  view: boolean,             // Read permission
  create: boolean,           // Create permission
  edit: boolean,             // Update permission
  delete: boolean,           // Delete permission
  restore: boolean,          // Restore soft-deleted permission
  isCrud: boolean,
  isReport: boolean,
  isApproval: boolean,
  reportType: string,
  reportId: ObjectId,
  approvalButtons: array[string]
}
```

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0dd"),
  "roleName": "Store admin",
  "org_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d2"),
  "allowedAppKeyNames": ["BackOffice", "Store", "Reports"],
  "permissions": [
    {
      "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0de"),
      "appName": "BackOffice",
      "moduleName": "Sale Bills",
      "moduleId": ObjectId("65f1a2b3c4d5e6f7a8b9c0df"),
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "restore": false,
      "isCrud": true,
      "isReport": false,
      "isApproval": false,
      "reportType": null,
      "reportId": null,
      "approvalButtons": []
    },
    {
      "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0e0"),
      "appName": "Store",
      "moduleName": "Master Products",
      "moduleId": ObjectId("65f1a2b3c4d5e6f7a8b9c0e1"),
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "restore": false,
      "isCrud": true,
      "isReport": false,
      "isApproval": false,
      "reportType": null,
      "reportId": null,
      "approvalButtons": []
    }
  ],
  "status": true,
  "isDeleted": false,
  "createdAt": ISODate("2026-01-10T10:00:00Z"),
  "updatedAt": ISODate("2026-02-20T14:00:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** ~50 roles per org × 1K orgs = 50K role documents
- **Indexes:**
  - Compound unique index on `{roleName: 1, org_id: 1}`
  - Compound index on `{status: 1, isDeleted: 1}` for active role filtering
  - Index on `{permissions.moduleName: 1}` for permission queries
- **RBAC Check Performance:**
  - Cached in `rbac_cache` collection (5-minute TTL)
  - In-memory cache in application layer (10-minute TTL)
  - Permission check: O(1) hash lookup after cache load

---

### Collection: `view_registry`

Registry of all MongoDB views with metadata including associated RBAC modules, descriptions, source collections, and aggregation pipeline definitions enabling dynamic view discovery and LLM decision-making on which views to query.

| Field Name        | Data Type | Required | References               | Enum / Constraints | Index Strategy                           | Description                               |
| ----------------- | --------- | -------- | ------------------------ | ------------------ | ---------------------------------------- | ----------------------------------------- |
| \_id              | ObjectId  | Yes      | —                        | —                  | Single                                   | Unique view registry record identifier    |
| view_name         | string    | Yes      | —                        | Unique per org     | Compound: {view_name: 1, org_id: 1}      | MongoDB view name                         |
| org_id            | ObjectId  | Yes      | Ref: tenants.\_id        | —                  | Compound: {view_name: 1, org_id: 1}      | Organization ID (if org-specific)         |
| description       | string    | Yes      | —                        | Max: 500 chars     | —                                        | Human-readable view description           |
| collection_source | string    | Yes      | —                        | —                  | —                                        | Source collection for the view            |
| pipeline          | array     | Yes      | —                        | MongoDB aggregation| —                                        | Aggregation pipeline definition           |
| rbac_module       | string    | Yes      | Ref: roles.moduleName    | —                  | Compound: {rbac_module: 1}               | Associated RBAC module                    |
| is_active         | boolean   | Yes      | —                        | Default: true      | Compound: {is_active: 1, isDeleted: 1}   | View active status                        |
| isDeleted         | boolean   | Yes      | —                        | Default: false     | Compound: {is_active: 1, isDeleted: 1}   | Soft delete flag                          |
| createdAt         | date      | Yes      | —                        | —                  | —                                        | View creation timestamp                   |
| updatedAt         | date      | Yes      | —                        | —                  | —                                        | Last update timestamp                     |

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0e2"),
  "view_name": "view_unpaid_bills",
  "org_id": null,
  "description": "All unpaid bills from last 90 days with store and customer details",
  "collection_source": "sale_bills",
  "pipeline": [
    {"$match": {"paymentStatus": "unpaid", "isDeleted": false}},
    {"$lookup": {"from": "stores", "localField": "storeId", "foreignField": "_id", "as": "store"}},
    {"$lookup": {"from": "customers", "localField": "customerId", "foreignField": "_id", "as": "customer"}},
    {"$limit": 100}
  ],
  "rbac_module": "Sale Bills",
  "is_active": true,
  "isDeleted": false,
  "createdAt": ISODate("2026-01-15T10:00:00Z"),
  "updatedAt": ISODate("2026-01-15T10:00:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** ~50 views globally + org-specific views = 500 total
- **Indexes:**
  - Compound unique index on `{view_name: 1, org_id: 1}`
  - Compound index on `{rbac_module: 1}` for permission-based view discovery
  - Compound index on `{is_active: 1, isDeleted: 1}` for active view filtering
- **LLM Integration:**
  - View registry loaded into LLM system prompt
  - LLM decides which view matches user question
  - View permissions validated via `rbac_module` field

---

### Collection: `schema_registry`

Complete schema definitions for all 120+ ERP collections with field metadata, data types, references, indexes, and join patterns enabling LLM query generation with accurate field names and proper JOIN logic.

| Field Name     | Data Type     | Required | References        | Enum / Constraints | Index Strategy                         | Description                                |
| -------------- | ------------- | -------- | ----------------- | ------------------ | -------------------------------------- | ------------------------------------------ |
| \_id           | ObjectId      | Yes      | —                 | —                  | Single                                 | Unique schema record identifier            |
| collection_name| string        | Yes      | —                 | Unique per org     | Compound: {collection_name: 1, org: 1} | Collection name                            |
| org_id         | ObjectId      | No       | Ref: tenants.\_id | —                  | Compound: {collection_name: 1, org: 1} | Organization ID (null for global schemas)  |
| schema_version | string        | Yes      | —                 | Semantic versioning| —                                      | Schema version (e.g., "1.0.0")             |
| fields         | array[object] | Yes      | —                 | See below          | —                                      | Array of field definitions                 |
| common_joins   | array[string] | No       | —                 | —                  | —                                      | Common JOIN patterns (e.g., ["stores"])    |
| is_active      | boolean       | Yes      | —                 | Default: true      | Single                                 | Schema active status                       |
| isDeleted      | boolean       | Yes      | —                 | Default: false     | —                                      | Soft delete flag                           |
| createdAt      | date          | Yes      | —                 | —                  | —                                      | Schema creation timestamp                  |
| updatedAt      | date          | Yes      | —                 | —                  | —                                      | Last update timestamp                      |

**Field Object Structure:**
```javascript
{
  field_name: string,              // "totalBillAmount"
  field_type: string,              // "number", "string", "date", "ObjectId"
  is_reference: boolean,           // true if references another collection
  reference_collection: string,    // "stores" (if is_reference: true)
  reference_field: string,         // "_id" (field in referenced collection)
  is_indexed: boolean,             // true if field has index
  is_required: boolean,            // true if required field
  description: string              // "Total bill amount in base currency"
}
```

### Example Document

```json
{
  "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0e3"),
  "collection_name": "sale_bills",
  "org_id": null,
  "schema_version": "1.0.0",
  "fields": [
    {
      "field_name": "saleBillNumber",
      "field_type": "string",
      "is_reference": false,
      "is_indexed": true,
      "is_required": true,
      "description": "Unique bill number"
    },
    {
      "field_name": "storeId",
      "field_type": "ObjectId",
      "is_reference": true,
      "reference_collection": "stores",
      "reference_field": "_id",
      "is_indexed": true,
      "is_required": true,
      "description": "Reference to store collection"
    },
    {
      "field_name": "totalBillAmount",
      "field_type": "number",
      "is_reference": false,
      "is_indexed": false,
      "is_required": true,
      "description": "Total bill amount"
    }
  ],
  "common_joins": ["stores", "customers"],
  "is_active": true,
  "isDeleted": false,
  "createdAt": ISODate("2026-01-15T10:00:00Z"),
  "updatedAt": ISODate("2026-01-15T10:00:00Z")
}
```

**Scale & Performance Notes:**

- **Expected Growth:** 120 collections × average 1 schema = 120 documents (very low volume)
- **Indexes:**
  - Compound unique index on `{collection_name: 1, org_id: 1}`
  - Single index on `{is_active: 1}`
- **LLM Integration:**
  - Full schema loaded into LLM system prompt for query generation
  - LLM uses field metadata to generate accurate queries
  - Reference fields enable automatic JOIN generation

---

## 🔒 Security & Multi-Tenant Enforcement

### Mandatory Query Filters

**All queries MUST include:**
```javascript
{
  org_id: user.org_id,        // Tenant isolation
  isDeleted: false            // Soft delete filtering
}
```

### Enforcement Points

1. **Query Builder:** Automatically injects `org_id` and `isDeleted` filters
2. **MongoDB Service:** Validates filters present before execution
3. **View Queries:** Runtime `org_id` filter added via aggregation pipeline
4. **Guardrails:** Validates query doesn't attempt cross-tenant access

### Violation Logging

```javascript
// Cross-tenant attempt detected
{
  event: "cross_tenant_access_attempt",
  user_id: "usr_john_001",
  requested_org_id: ObjectId("..."),
  actual_org_id: ObjectId("..."),
  timestamp: ISODate(...),
  action_taken: "blocked"
}
```

---

## 📊 Aggregated Query Patterns

### Daily Usage Summary
```javascript
db.usage_logs.aggregate([
  {$match: {
    org_id: ObjectId("..."),
    timestamp: {$gte: startOfDay, $lte: endOfDay}
  }},
  {$group: {
    _id: null,
    total_tokens: {$sum: "$tokens_total"},
    total_queries: {$sum: 1},
    avg_tokens_per_query: {$avg: "$tokens_total"}
  }}
])
```

### Top Views by Organization
```javascript
db.view_usage_logs.aggregate([
  {$match: {org_id: ObjectId("...")}},
  {$group: {
    _id: "$view_name",
    hit_count: {$sum: 1}
  }},
  {$sort: {hit_count: -1}},
  {$limit: 10}
])
```

### User Activity Trend
```javascript
db.chat_sessions.aggregate([
  {$match: {
    org_id: ObjectId("..."),
    started_at: {$gte: last30Days}
  }},
  {$group: {
    _id: {
      $dateToString: {format: "%Y-%m-%d", date: "$started_at"}
    },
    active_users: {$addToSet: "$user_id"},
    total_messages: {$sum: "$message_count"}
  }},
  {$sort: {_id: 1}}
])
```

---

## 📈 Capacity Planning

### Storage Estimates (1 Year)

| Collection              | Docs/Year | Avg Size | Total Size |
| ----------------------- | --------- | -------- | ---------- |
| chat_sessions           | 1M        | 500B     | 500 MB     |
| chat_messages           | 100M      | 1KB      | 100 GB     |
| usage_logs              | 109M      | 300B     | 33 GB      |
| rate_limit_requests     | Ephemeral | 100B     | <1 MB      |
| view_usage_logs         | 65M       | 200B     | 13 GB      |
| feedback                | 30M       | 500B     | 15 GB      |
| org_usage_aggregated    | 1K        | 300B     | <1 MB      |
| user_preferences        | 100K      | 300B     | 30 MB      |
| api_keys                | 4K        | 500B     | 2 MB       |
| rbac_cache              | 50K       | 2KB      | 100 MB     |

**Total Estimated Storage (1 Year):** ~162 GB

---

## 🎯 Performance Benchmarks

### Target Response Times

- Session creation: < 50ms
- Message send: < 2000ms (includes LLM call)
- RBAC check: < 10ms (cached)
- View query: < 100ms
- Collection query: < 500ms
- Rate limit check: < 5ms

### Throughput Targets

- Concurrent sessions: 10,000+
- Messages per second: 1,000+
- Queries per second: 500+

---

**This schema supports:**
- ✅ Multi-tenant isolation
- ✅ RBAC enforcement
- ✅ LLM-driven query generation
- ✅ MongoDB view optimization
- ✅ Real-time chat
- ✅ Usage analytics
- ✅ Automatic data cleanup (TTL)
- ✅ Audit trails
- ✅ Soft deletes
- ✅ Scalability to millions of messages
```
