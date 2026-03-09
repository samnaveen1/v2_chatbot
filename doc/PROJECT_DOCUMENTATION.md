# InvyPro Project Documentation

This document provides a deep dive into the technical implementation, optimizations, and operational features of the InvyPro AI Chatbot ecosystem.

---

## 🏗️ Technical Stack

### **Backend (Python)**
- **Framework**: FastAPI (Asynchronous high-performance API)
- **AI Orchestration**: LiteLLM (Consistent interface for Azure OpenAI, Anthropic, etc.)
- **Database**: MongoDB (ERP and Chatbot data storage)
- **Security**: PyJWT (Authentication), Cryptography (BYOK Encryption)
- **Validation**: Pydantic (Schema enforcement)

### **Frontend (TypeScript)**
- **Framework**: Next.js 16+ (Turbopack)
- **Styling**: Tailwind CSS & Framer Motion (Fluid animations)
- **Components**: Lucide-React, Sonner (Toasts), Radix UI
- **State Management**: React Hooks & LocalStorage Persistence

---

## ⚡ Performance Optimizations

### **1. High-Speed Greeting Optimization**
To eliminate the 10-second processing delay for simple conversational inputs, we implemented a "Fast-Track" logic:
- Detects greetings like "hi" or "how are you".
- Skips loading the 2000+ line analytical schema.
- Uses a minimal system prompt for instant conversational responses.

### **2. Loading Message Threshold**
The "Analysing your business data... please wait" indicator is now intelligent:
- It only appears if the backend takes longer than **10 seconds** to respond.
- This prevents UI flicker for quick queries while providing feedback for heavy analytical tasks.

---

## 🛡️ Security & Guardrails

### **5-Layer Guardrail System**
1. **RBAC Filtering**: Users can only query modules they have permissions for in the ERP.
2. **Collection Whitelisting**: Only 10+ specific transactional collections are accessible to the LLM.
3. **Write Protection**: Strictly blocks `$merge`, `$out`, and other mutation operators.
4. **Soft-Delete Enforcement**: Automatically injects `isDeleted: false` into every generated query.
5. **Rate Limiting**: Throttles requests per minute and per day (token quotas).

---

## 💬 Natural User Feedback

### **In-Chat Error Handling (429 Rate Limits)**
Instead of disruptive pop-up toasts, rate limit errors are now part of the conversation:
- Errors appear as professional assistant messages.
- Explicitly states when the quota will recharge (e.g., "Resets in 23 hours").
- Preserves the user's last message so context is not lost.

---

## 📐 Tri-State UI Interface

The chatbot supports three distinct layout states to accommodate different data needs:
- **Compact**: The standard bubble (480px) for quick chats.
- **Medium (3/4 View)**: Expanded to 80% width for viewing large analytical tables.
- **Full Screen**: Immersive view for deep-dive investigations.

---

## 📊 Data Visualization

- **Markdown Tables**: Automatically renders queried data into professional tables.
- **Expanded Limits**: Displays up to **500 records** directly in-chat (increased from 50).
- **CSV Exports**: Allows users to download full result sets directly from the UI.
- **Join Support**: Intelligently handles lookups between collections (e.g., Return Bills to Sale Bills).

---

## 🌐 Deployment & Embedding

### **Google Tag Manager (GTM)**
The frontend is optimized for seamless embedding on corporate portals:
- **Minimal Page Layout**: `page.tsx` is stripped of all headers to function as a pure widget.
- **Lazy Loading**: Integrated with GTM using Next.js `afterInteractive` strategy to ensure zero impact on site performance.
- **README Guide**: See [`README_GTM.md`](./README_GTM.md) for manager-friendly setup steps.
