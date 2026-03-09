# Backend Code Structure - Complete
```
backend/app/
├── main.py
├── config.py
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   ├── chat.py
│   ├── admin.py
│   └── health.py
├── services/
│   ├── __init__.py
│   ├── llm_service.py
│   ├── query_builder.py
│   ├── guardrails.py
│   ├── rbac_service.py
│   ├── session_manager.py
│   ├── rate_limiter.py
│   ├── mongodb_service.py
│   ├── response_formatter.py
│   └── byok_service.py
├── models/
│   ├── __init__.py
│   └── schemas.py
├── auth/
│   ├── __init__.py
│   ├── jwt_handler.py
│   └── encryption.py
├── middleware/
│   ├── __init__.py
│   ├── auth_middleware.py
│   └── tenant_middleware.py
├── utils/
│   ├── __init__.py
│   ├── logger.py
│   ├── token_counter.py
│   └── exceptions.py
└── constants/
    ├── __init__.py
    ├── error_messages.py
    └── response_templates.py
```

---

## main.py

### Purpose
FastAPI application entry point, Socket.io initialization, route registration, global error handling

### Functions
- `create_app()` - Initialize FastAPI application with middleware
- `register_routes()` - Register all API route blueprints
- `setup_socketio()` - Configure Socket.io server with CORS
- `setup_middleware()` - Add authentication, tenant, error middleware
- `setup_exception_handlers()` - Register global exception handlers
- `lifespan()` - Startup and shutdown event handlers
- `global_exception_handler()` - Catch-all exception handler
- `validation_exception_handler()` - Handle Pydantic validation errors
- `http_exception_handler()` - Handle HTTP exceptions

---

## config.py

### Classes
**Settings**

### Settings Class
**Purpose**: Pydantic settings management from environment variables with validation

**Attributes**:
- `MONGODB_URI`
- `CHATBOT_DB_NAME`
- `ERP_DB_NAME`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `ENCRYPTION_KEY`
- `DEFAULT_LLM_PROVIDER`
- `RATE_LIMIT_REQUESTS_PER_MINUTE`
- `MAX_CONTEXT_MESSAGES`
- `MAX_DATE_RANGE_DAYS`
- `LOG_LEVEL`
- `ENVIRONMENT`

**Methods**:
- `validate_config()` - Validate all required settings present
- `validate_mongodb_uri()` - Validate MongoDB connection string format
- `validate_jwt_secret()` - Ensure JWT secret is strong enough
- `get_cors_origins()` - Get allowed CORS origins by environment

---

## routes/auth.py

### Purpose
Authentication endpoints with comprehensive error handling

### Functions
- `login()` - POST /api/auth/login - User authentication
- `refresh_token()` - POST /api/auth/refresh - Refresh access token
- `logout()` - POST /api/auth/logout - Invalidate tokens
- `verify_token()` - GET /api/auth/verify - Validate token

### Error Handling
- `InvalidCredentialsError` - Wrong username/password
- `UserInactiveError` - User account disabled
- `TokenExpiredError` - JWT token expired
- `TokenInvalidError` - JWT token malformed
- `DatabaseConnectionError` - MongoDB unavailable

---

## routes/chat.py

### Classes
**ChatNamespace**

### ChatNamespace Class
**Purpose**: Socket.io namespace for real-time chat with error handling

**Methods**:
- `on_connect()` - Handle client connection with JWT validation
- `on_disconnect()` - Handle client disconnection, cleanup session
- `on_message()` - Handle incoming user message, route to LLM service
- `on_typing()` - Handle typing indicator event
- `emit_response()` - Send bot response to client
- `emit_error()` - Send formatted error to client
- `handle_connection_error()` - Handle WebSocket connection failures
- `handle_message_error()` - Handle message processing errors
- `validate_message_payload()` - Validate incoming message structure

### Error Handling
- `ConnectionAuthError` - Invalid JWT in connection
- `MessageValidationError` - Invalid message format
- `RateLimitError` - Too many messages
- `SessionNotFoundError` - Session expired or invalid
- `MessageProcessingError` - Error in LLM processing

---

## routes/admin.py

### Purpose
Admin operations with authorization and error handling

### Functions
- `save_api_key()` - POST /api/admin/api-keys - Save encrypted API key
- `list_api_keys()` - GET /api/admin/api-keys - List configured providers
- `delete_api_key()` - DELETE /api/admin/api-keys/{provider} - Remove key
- `test_api_key()` - POST /api/admin/api-keys/test - Validate key
- `get_usage_stats()` - GET /api/admin/usage - Organization usage stats
- `get_org_usage()` - GET /api/admin/usage/org - Aggregated org metrics
- `get_user_usage()` - GET /api/admin/usage/user/{user_id} - User metrics
- `export_usage_report()` - GET /api/admin/usage/export - CSV export

### Error Handling
- `UnauthorizedError` - Non-admin user access attempt
- `InvalidAPIKeyError` - API key validation failed
- `ProviderNotSupportedError` - Unknown LLM provider
- `EncryptionError` - Key encryption/decryption failed
- `UsageDataNotFoundError` - No usage data available

---

## routes/health.py

### Purpose
Health check endpoints for monitoring and orchestration

### Functions
- `health_check()` - GET /health - Overall system health
- `readiness_check()` - GET /health/ready - Ready to accept requests
- `liveness_check()` - GET /health/live - Application is alive
- `mongodb_health()` - Check MongoDB connection status
- `llm_health()` - Check LLM provider availability
- `cache_health()` - Check cache service status

### Error Handling
- Returns 200 if healthy, 503 if unhealthy
- Detailed status for each component
- No exceptions raised, always returns response

---

## services/llm_service.py

### Classes
**LLMService**

### LLMService Class
**Purpose**: Main orchestrator - LLM-driven decision engine with comprehensive error handling

**Methods**:
- `process_message()` - Main entry point for message processing
- `check_rbac_permission()` - Validate user RBAC access
- `handle_no_permission()` - Generate "no access" response
- `call_llm_decision_engine()` - Call LLM to decide action
- `parse_llm_decision()` - Parse and validate LLM JSON response
- `validate_llm_decision()` - Validate decision structure
- `execute_direct_response()` - Handle direct LLM response
- `execute_view_query()` - Query MongoDB view
- `execute_collection_query()` - Query collection with custom filters
- `format_final_response()` - Format response with template + LLM
- `save_to_database()` - Persist message and usage logs
- `handle_llm_error()` - Handle LLM API errors
- `handle_timeout()` - Handle request timeouts
- `retry_with_backoff()` - Retry failed LLM calls with exponential backoff

### Error Handling
- `LLMTimeoutError` - LLM request timeout
- `LLMRateLimitError` - LLM rate limit exceeded
- `LLMInvalidResponseError` - LLM returned invalid JSON
- `LLMConnectionError` - Cannot connect to LLM provider
- `DecisionParseError` - Cannot parse LLM decision
- `ViewNotFoundError` - Requested view doesn't exist
- `QueryExecutionError` - MongoDB query failed
- `ContextLoadError` - Cannot load message history

**Attributes**:
- `rbac_service`
- `query_builder`
- `guardrails`
- `mongodb_service`
- `response_formatter`
- `session_manager`
- `byok_service`
- `logger`

---

## services/query_builder.py

### Classes
**QueryBuilder**

### QueryBuilder Class
**Purpose**: Build MongoDB aggregation pipelines with validation and error handling

**Methods**:
- `build_pipeline()` - Construct complete aggregation pipeline
- `add_match_stage()` - Add $match with filters
- `add_lookup_stages()` - Add $lookup for joins
- `add_unwind_stages()` - Add $unwind for arrays
- `add_project_stage()` - Add $project for field selection
- `add_sort_stage()` - Add $sort stage
- `add_limit_stage()` - Add $limit stage
- `inject_mandatory_filters()` - Add  isDeleted filters
- `validate_collection_name()` - Validate collection exists
- `validate_field_names()` - Validate fields exist in schema
- `validate_join_references()` - Validate join references valid
- `sanitize_query()` - Sanitize user inputs
- `optimize_pipeline()` - Optimize pipeline stages

### Error Handling
- `InvalidCollectionError` - Collection doesn't exist
- `InvalidFieldError` - Field doesn't exist in schema
- `InvalidJoinError` - Join reference invalid
- `PipelineBuildError` - Error constructing pipeline
- `QuerySanitizationError` - Unsafe query detected

**Attributes**:
- `schema_registry`
- `view_registry`
- `logger`

---

## services/guardrails.py

### Classes
**Guardrails**

### Guardrails Class
**Purpose**: 5-layer query validation with detailed error messages

**Methods**:
- `validate_query()` - Run all validation checks
- `check_write_operation()` - Block insert/update/delete
- `check_date_range()` - Validate ≤ 90 days
- `check_rbac_permission()` - Validate collection access
- `check_sensitive_fields()` - Block PII fields
- `check_query_complexity()` - Prevent expensive scans
- `extract_date_fields()` - Extract date range from query
- `calculate_date_diff()` - Calculate days between dates
- `detect_sensitive_fields()` - Detect PII in projection
- `estimate_query_cost()` - Estimate query complexity
- `log_violation()` - Log guardrail violations

### Error Handling
- `WriteOperationBlockedError` - Write operation attempted
- `DateRangeExceededError` - Date range > 90 days
- `RBACPermissionDeniedError` - No access to collection
- `SensitiveFieldAccessError` - Attempted PII access
- `ExpensiveQueryError` - Query too expensive
- `GuardrailViolationError` - Generic guardrail violation

**Attributes**:
- `BLOCKED_OPERATIONS`
- `SENSITIVE_FIELDS`
- `MAX_DATE_RANGE_DAYS`
- `MAX_LIMIT`
- `logger`

---

## services/rbac_service.py

### Classes
**RBACService**

### RBACService Class
**Purpose**: RBAC permission checking with caching and error handling

**Methods**:
- `check_permission()` - Check if user can access module
- `load_user_role()` - Load user's role and permissions
- `get_accessible_modules()` - List all accessible modules
- `extract_module_from_question()` - LLM extracts module name
- `cache_role_permissions()` - Cache in rbac_cache collection
- `invalidate_cache()` - Clear cache on role update
- `validate_role_exists()` - Validate role is active
- `validate_user_active()` - Validate user is active
- `log_access_attempt()` - Log permission checks
- `handle_cache_miss()` - Handle cache lookup failure
- `handle_permission_denied()` - Log denied access

### Error Handling
- `RoleNotFoundError` - User's role doesn't exist
- `UserInactiveError` - User account disabled
- `PermissionDeniedError` - No permission for module
- `RBACCacheError` - Cache read/write failed
- `ModuleExtractionError` - Cannot extract module from question

**Attributes**:
- `mongodb_service`
- `cache_ttl`
- `logger`

---

## services/session_manager.py

### Classes
**MongoDBSessionManager**

### MongoDBSessionManager Class
**Purpose**: Manage conversation context with error handling

**Methods**:
- `get_context()` - Retrieve last 25 messages
- `add_message()` - Add new message, trim old
- `calculate_tokens()` - Estimate token count
- `check_token_limit()` - Validate against role limit
- `clear_session()` - Delete all session messages
- `trim_old_messages()` - Keep only last 25 messages
- `validate_session_exists()` - Check session is active
- `handle_new_user()` - Handle user with 0 messages
- `estimate_context_size()` - Calculate context window size
- `log_session_activity()` - Log session operations

### Error Handling
- `SessionNotFoundError` - Session doesn't exist
- `TokenLimitExceededError` - Context exceeds token limit
- `MessageAddError` - Failed to add message
- `ContextLoadError` - Failed to load context
- `SessionCleanupError` - Failed to clear session

**Attributes**:
- `MAX_MESSAGES`
- `TOKEN_LIMITS`
- `mongodb_service`
- `logger`

---

## services/rate_limiter.py

### Classes
**MongoDBRateLimiter**

### MongoDBRateLimiter Class
**Purpose**: Rate limiting with MongoDB TTL and error handling

**Methods**:
- `check_rate_limit()` - Check if user exceeded limit
- `log_request()` - Insert request record (auto-expires 60s)
- `get_limit_for_role()` - Get rate limit by RBAC role
- `get_remaining_requests()` - Calculate requests remaining
- `handle_limit_exceeded()` - Handle rate limit violation
- `cleanup_expired_records()` - Manual cleanup if TTL fails
- `get_user_request_history()` - Get recent request timestamps

### Error Handling
- `RateLimitExceededError` - User exceeded request limit
- `RateLimitCheckError` - Failed to check rate limit
- `RateLimitLogError` - Failed to log request

**Attributes**:
- `RATE_LIMITS`
- `mongodb_service`
- `logger`

---

## services/mongodb_service.py

### Classes
**MongoDBService**

### MongoDBService Class
**Purpose**: MongoDB operations with multi-tenant isolation and comprehensive error handling

**Methods**:
- `find()` - Query documents with org_id filter
- `aggregate()` - Run aggregation pipeline
- `count_documents()` - Count with filters
- `query_view()` - Query MongoDB view with org_id
- `validate_org_id()` - Ensure org_id in query
- `get_collection()` - Get collection reference
- `test_connection()` - Test MongoDB connectivity
- `handle_connection_error()` - Handle connection failures
- `handle_query_timeout()` - Handle slow queries
- `retry_query()` - Retry failed queries
- `log_query()` - Log query for debugging

### Error Handling
- `DatabaseConnectionError` - Cannot connect to MongoDB
- `QueryTimeoutError` - Query exceeded time limit
- `CollectionNotFoundError` - Collection doesn't exist
- `DocumentNotFoundError` - Document not found
- `DuplicateKeyError` - Unique constraint violation
- `ValidationError` - Document validation failed
- `OrgIdMissingError` - org_id not in query
- `CrossTenantAccessError` - Attempted cross-tenant access

**Attributes**:
- `chatbot_db`
- `erp_db`
- `client`
- `logger`

---

## services/response_formatter.py

### Classes
**ResponseFormatter**

### ResponseFormatter Class
**Purpose**: Combine templates with LLM formatting with error handling

**Methods**:
- `format_response()` - Main formatting method
- `select_template()` - Choose template by query type
- `fill_template()` - Populate template variables
- `enhance_with_llm()` - Add natural language with LLM
- `format_search_results()` - Format list of documents
- `format_analytical_results()` - Format aggregations
- `format_error_response()` - Format user-friendly error
- `truncate_results()` - Limit result size
- `sanitize_output()` - Remove sensitive data from output
- `validate_template()` - Ensure template variables present
- `handle_formatting_error()` - Handle template errors

### Error Handling
- `TemplateNotFoundError` - Template doesn't exist
- `TemplateFillError` - Missing template variables
- `FormattingError` - Error formatting response
- `LLMEnhancementError` - LLM enhancement failed
- `OutputTooLargeError` - Response exceeds size limit

**Attributes**:
- `RESPONSE_TEMPLATES`
- `llm_client`
- `logger`

---

## services/byok_service.py

### Classes
**BYOKService**

### BYOKService Class
**Purpose**: Manage organization API keys with encryption and error handling

**Methods**:
- `save_api_key()` - Store encrypted key
- `get_api_key()` - Retrieve and decrypt key
- `test_api_key()` - Validate key with provider
- `delete_api_key()` - Remove key for provider
- `list_providers()` - Get configured providers
- `encrypt_key()` - Encrypt API key
- `decrypt_key()` - Decrypt API key
- `validate_provider()` - Check provider is supported
- `validate_key_format()` - Check key format
- `handle_encryption_error()` - Handle encryption failures
- `handle_test_failure()` - Handle key test failures
- `log_key_usage()` - Log API key usage

### Error Handling
- `InvalidAPIKeyError` - Key validation failed
- `ProviderNotSupportedError` - Unknown provider
- `EncryptionError` - Encryption/decryption failed
- `APIKeyTestError` - Key test with provider failed
- `APIKeyNotFoundError` - No key for provider
- `DecryptionError` - Cannot decrypt stored key

**Attributes**:
- `SUPPORTED_PROVIDERS`
- `encryption`
- `mongodb_service`
- `logger`

---

## models/schemas.py

### Purpose
Pydantic models for request/response validation with custom error messages

### Classes
- **UserLogin** - Login request validation
- **TokenResponse** - JWT token response
- **ChatMessage** - Chat message structure
- **ChatMessageResponse** - Bot response structure
- **QueryRequest** - Query request validation
- **QueryResponse** - Query result structure
- **UsageStats** - Usage statistics structure
- **APIKeyRequest** - API key save request
- **ErrorResponse** - Standardized error response
- **HealthCheckResponse** - Health check structure
- **RBACPermission** - RBAC permission structure
- **SessionContext** - Session context structure

### Each Class Contains
- Field validators with custom error messages
- Type annotations
- Example values for documentation
- Custom validation methods

---

## auth/jwt_handler.py

### Classes
**JWTHandler**

### JWTHandler Class
**Purpose**: JWT token creation and validation with error handling

**Methods**:
- `create_access_token()` - Generate access token
- `create_refresh_token()` - Generate refresh token
- `verify_token()` - Validate and decode token
- `decode_token()` - Extract payload
- `get_token_expiry()` - Calculate expiration
- `refresh_access_token()` - Create new access from refresh
- `invalidate_token()` - Blacklist token
- `check_token_blacklist()` - Check if token is blacklisted
- `validate_token_structure()` - Validate JWT structure
- `handle_expired_token()` - Handle token expiration
- `handle_invalid_signature()` - Handle signature mismatch

### Error Handling
- `TokenExpiredError` - Token has expired
- `TokenInvalidError` - Token is malformed
- `SignatureInvalidError` - Token signature mismatch
- `TokenBlacklistedError` - Token has been invalidated
- `TokenCreationError` - Failed to create token

**Attributes**:
- `secret_key`
- `algorithm`
- `access_token_expire_minutes`
- `refresh_token_expire_days`

---

## auth/encryption.py

### Classes
**Encryption**

### Encryption Class
**Purpose**: Encrypt/decrypt API keys with error handling

**Methods**:
- `encrypt()` - Encrypt plaintext string
- `decrypt()` - Decrypt ciphertext string
- `generate_key()` - Generate new encryption key
- `validate_key()` - Validate encryption key format
- `rotate_key()` - Rotate encryption key
- `handle_encryption_error()` - Handle encryption failures
- `handle_decryption_error()` - Handle decryption failures

### Error Handling
- `EncryptionError` - Encryption failed
- `DecryptionError` - Decryption failed
- `InvalidEncryptionKeyError` - Key format invalid
- `KeyRotationError` - Key rotation failed

**Attributes**:
- `cipher`
- `encryption_key`

---

## middleware/auth_middleware.py

### Purpose
JWT authentication middleware with detailed error handling

### Functions
- `verify_jwt_middleware()` - Extract and validate JWT from header
- `get_current_user()` - Load user from token payload
- `validate_token_format()` - Validate Bearer token format
- `extract_token()` - Extract token from Authorization header
- `handle_missing_token()` - Handle missing Authorization header
- `handle_invalid_token()` - Handle invalid token format
- `handle_expired_token()` - Handle expired token

### Error Handling
- `AuthHeaderMissingError` - No Authorization header
- `TokenFormatError` - Invalid Bearer format
- `TokenExpiredError` - Token expired
- `TokenInvalidError` - Token invalid
- `UserNotFoundError` - User in token doesn't exist

---

## middleware/tenant_middleware.py

### Purpose
Multi-tenant isolation enforcement with error handling

### Functions
- `inject_org_id()` - Add org_id to request context
- `validate_tenant()` - Ensure org exists and active
- `extract_org_from_token()` - Get org_id from JWT
- `validate_org_active()` - Check org is not disabled
- `handle_org_not_found()` - Handle missing organization
- `handle_org_inactive()` - Handle disabled organization
- `log_tenant_access()` - Log tenant access attempts

### Error Handling
- `OrgNotFoundError` - Organization doesn't exist
- `OrgInactiveError` - Organization is disabled
- `OrgIdMissingError` - org_id not in token
- `CrossTenantAccessError` - Attempted access to other org

---

## utils/logger.py

### Classes
**StructuredLogger**

### StructuredLogger Class
**Purpose**: JSON structured logging with correlation IDs and PII redaction

**Methods**:
- `info()` - Log info level message
- `warning()` - Log warning level message
- `error()` - Log error level message with stack trace
- `debug()` - Log debug level message
- `critical()` - Log critical level message
- `add_correlation_id()` - Add correlation ID to logs
- `redact_pii()` - Remove sensitive data from logs
- `format_exception()` - Format exception with stack trace
- `log_request()` - Log HTTP request
- `log_response()` - Log HTTP response
- `log_query()` - Log database query
- `log_llm_call()` - Log LLM API call

**Attributes**:
- `logger`
- `correlation_id`
- `pii_patterns`

---

## utils/token_counter.py

### Classes
**TokenCounter**

### TokenCounter Class
**Purpose**: Estimate token counts for LLM calls

**Methods**:
- `count_tokens()` - Estimate tokens in text
- `count_messages()` - Sum tokens in message list
- `estimate_cost()` - Calculate API cost
- `get_token_limit()` - Get limit for role
- `check_limit()` - Validate against limit

**Attributes**:
- `CHARS_PER_TOKEN`
- `PRICING`

---

## utils/exceptions.py

### Purpose
Custom exception classes with detailed error messages and codes

### Classes
- **BaseAPIException** - Base exception with error code
- **AuthenticationError** - Authentication failures
- **AuthorizationError** - Permission denied errors
- **ValidationError** - Input validation errors
- **DatabaseError** - MongoDB operation errors
- **LLMError** - LLM API errors
- **RateLimitError** - Rate limit violations
- **GuardrailError** - Guardrail validation failures
- **SessionError** - Session management errors
- **ConfigurationError** - Configuration errors

### Each Exception Contains
- `error_code` - Unique error code
- `message` - User-friendly error message
- `details` - Technical details for logging
- `http_status` - HTTP status code
- `retry_after` - Seconds to wait before retry (if applicable)

---

## constants/error_messages.py

### Purpose
Centralized error messages for consistency

### Constants
- `ERROR_MESSAGES` - Dict of all error messages
- `USER_FRIENDLY_MESSAGES` - User-facing error messages
- `TECHNICAL_MESSAGES` - Developer-facing error messages
- `ERROR_CODES` - Mapping of error codes

### Structure
```python
ERROR_MESSAGES = {
    "AUTH_001": "Invalid username or password",
    "AUTH_002": "Token has expired",
    "RBAC_001": "You don't have permission to access this module",
    "GUARD_001": "Write operations are not allowed",
    "GUARD_002": "Date range exceeds 3 months limit",
    "LLM_001": "LLM request timeout",
    "DB_001": "Database connection failed",
    # ... 100+ error codes
}
```

---

## constants/response_templates.py

### Purpose
Response templates for formatting

### Constants
- `RESPONSE_TEMPLATES` - Dict of all templates
- `ERROR_TEMPLATES` - Error response templates
- `SUCCESS_TEMPLATES` - Success response templates

### Structure
```python
RESPONSE_TEMPLATES = {
    "search_results": "Found {count} results...",
    "analytical_summary": "Total: {total}...",
    "no_permission": "You don't have access to {module}...",
    "error_generic": "An error occurred. Error ID: {error_id}",
    # ... more templates
}
```

---

## Error Handling Strategy

### Error Hierarchy
```
BaseAPIException
├── AuthenticationError
│   ├── InvalidCredentialsError
│   ├── TokenExpiredError
│   └── TokenInvalidError
├── AuthorizationError
│   ├── PermissionDeniedError
│   └── RBACPermissionDeniedError
├── ValidationError
│   ├── MessageValidationError
│   ├── QueryValidationError
│   └── InputValidationError
├── DatabaseError
│   ├── ConnectionError
│   ├── QueryTimeoutError
│   └── DocumentNotFoundError
├── LLMError
│   ├── LLMTimeoutError
│   ├── LLMRateLimitError
│   └── LLMInvalidResponseError
├── RateLimitError
├── GuardrailError
│   ├── WriteOperationBlockedError
│   ├── DateRangeExceededError
│   └── SensitiveFieldAccessError
└── SessionError
    ├── SessionNotFoundError
    └── TokenLimitExceededError
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "RBAC_001",
    "message": "You don't have permission to access Sale Bills",
    "details": "User role 'Sales Person' does not have 'view' permission for module 'Sale Bills'",
    "timestamp": "2026-02-05T10:15:30Z",
    "correlation_id": "req_abc123",
    "retry_after": null
  }
}
```

### Logging Format
```json
{
  "level": "ERROR",
  "timestamp": "2026-02-05T10:15:30Z",
  "correlation_id": "req_abc123",
  "service": "llm_service",
  "method": "process_message",
  "error_code": "LLM_001",
  "error_message": "LLM request timeout",
  "user_id": "usr_123",
  "org_id": "org_456",
  "stack_trace": "...",
  "request_data": {...}
}
```

### Retry Logic
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max retries: 3
- Retry on: ConnectionError, TimeoutError, RateLimitError
- No retry on: ValidationError, AuthorizationError

### Circuit Breaker
- Failure threshold: 5 consecutive failures
- Recovery timeout: 60 seconds
- Half-open state: Test with single request

---

## Enterprise-Level Code Standards

### All Functions Must Include
1. Type hints for parameters and return values
2. Docstring with description, args, returns, raises
3. Input validation
4. Try-catch blocks with specific exception handling
5. Logging (entry, exit, errors)
6. Correlation ID tracking
7. Performance timing
8. Error context enrichment

### Example Function Template
```python
async def function_name(
    param1: str,
    param2: int,
    correlation_id: str
) -> ReturnType:
    """
    Brief description of function.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        correlation_id: Request correlation ID for tracing
    
    Returns:
        ReturnType: Description of return value
    
    Raises:
        SpecificError: When specific condition occurs
        AnotherError: When another condition occurs
    """
    logger.info(
        "Function started",
        correlation_id=correlation_id,
        param1=param1,
        param2=param2
    )
    
    start_time = time.time()
    
    try:
        # Validate inputs
        if not param1:
            raise ValidationError("param1 cannot be empty")
        
        # Business logic
        result = await do_something(param1, param2)
        
        # Log success
        duration = time.time() - start_time
        logger.info(
            "Function completed successfully",
            correlation_id=correlation_id,
            duration=duration
        )
        
        return result
        
    except SpecificError as e:
        logger.error(
            "Specific error occurred",
            correlation_id=correlation_id,
            error=str(e),
            stack_trace=traceback.format_exc()
        )
        raise
        
    except Exception as e:
        logger.critical(
            "Unexpected error",
            correlation_id=correlation_id,
            error=str(e),
            stack_trace=traceback.format_exc()
        )
        raise UnexpectedError(
            message="An unexpected error occurred",
            details=str(e),
            correlation_id=correlation_id
        )
```

---

## Summary

This code structure provides:
- ✅ Complete file and class organization
- ✅ All functions listed for each class
- ✅ Comprehensive error handling hierarchy
- ✅ Enterprise-level exception management
- ✅ Structured logging with correlation IDs
- ✅ Retry logic and circuit breakers
- ✅ Centralized error messages
- ✅ Standardized error response format
- ✅ PII redaction in logs
- ✅ Performance monitoring
- ✅ Multi-tenant isolation validation
- ✅ Security audit trail

Total Files: 23
Total Classes: 15
Total Functions: 200+