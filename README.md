# 🤖 AI Support Agent

An intelligent customer support backend built with **Node.js**, **LangChain**, **RAG**, and **Gemini AI**. Instead of simple keyword matching, it uses Retrieval-Augmented Generation to search a real knowledge base and generate accurate, grounded answers.

---

## 🚀 Tech Stack

| Technology | Role |
|---|---|
| Node.js v22 + Express | Backend server & REST API |
| LangChain.js | AI orchestration & agent logic |
| Gemini 1.5 Flash | Large language model |
| Google Embeddings | Text → vector conversion |
| ChromaDB | Vector database for similarity search |
| MongoDB + Mongoose | Conversation history per session |

---

## 🧠 How It Works

The system is **agentic** — it has two tools and decides which one to use based on the user's question:

- **RAG Tool** — for general questions (policies, shipping, returns, FAQs)
- **Order Tool** — for specific order status lookups using an order ID

It also maintains full **conversation history per session** using MongoDB, so the agent remembers context across multiple messages.

### Request Flow

```
User Message
    ↓
Express API (validates request + API key)
    ↓
MongoDB (loads last 10 messages for session)
    ↓
LangChain AgentExecutor (message + history + tools)
    ↓
Gemini decides: RAG Tool OR Order Tool
    ↓
Tool runs → returns data
    ↓
Gemini generates natural language response
    ↓
Save to MongoDB → Return response
```

---

## 📁 Project Structure

```
ai-support-agent/
├── src/
│   ├── index.js                  # Express app entry point
│   ├── routes/
│   │   └── chat.js               # POST /chat and GET /history
│   ├── tools/
│   │   ├── ragTool.js            # ChromaDB similarity search
│   │   └── orderTool.js          # Mock order status lookup
│   └── models/
│       └── Conversation.js       # Mongoose schema for chat history
├── knowledge-base/
│   ├── faq.txt
│   ├── returns.txt
│   └── shipping.txt
├── ingest.js                     # One-time script to embed docs into ChromaDB
├── package.json
└── .gitignore
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- Docker Desktop (for ChromaDB)
- MongoDB (local or Atlas free tier)
- Google Gemini API key — free at [aistudio.google.com](https://aistudio.google.com/apikey)

### Steps

**1. Clone the repo and install dependencies**
```bash
git clone https://github.com/prakashraj-dev/ai-support-agent.git
cd ai-support-agent
npm install --legacy-peer-deps
```

**2. Create your `.env` file in the root**
```env
GEMINI_API_KEY=your-gemini-key-here
MONGODB_URI=mongodb://localhost:27017/support-agent
PORT=3000
```

**3. Start ChromaDB using Docker**
```bash
docker run -d -p 8000:8000 --name chroma chromadb/chroma:0.5.20
```

**4. Start MongoDB**
```bash
mongod
```

**5. Run the ingestion script (one time only)**
```bash
npm run ingest
```

**6. Start the server**
```bash
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Send a message to the agent |
| GET | `/chat/history/:sessionId` | Get full conversation history |
| GET | `/health` | Health check |

### POST /chat — Request

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: my-secret-key-123" \
  -d '{"sessionId": "user-1", "message": "What is your return policy?"}'
```

### POST /chat — Response

```json
{
  "sessionId": "user-1",
  "reply": "You can return items within 30 days of purchase...",
  "messageCount": 4
}
```

---

## 💡 Key Concepts

**What is RAG?**
Retrieval-Augmented Generation combines a retrieval system (vector search) with a generative model (LLM). Instead of relying on the LLM's training data, RAG fetches relevant documents at query time and feeds them as context — making responses accurate and grounded in your own data.

**What makes this an Agent vs a Chatbot?**
A chatbot follows fixed rules. An agent has tools and reasons about which tool to use. Here, LangChain's AgentExecutor gives Gemini two tools with descriptions, and Gemini reads the user's intent to decide which tool to call.

**Why MongoDB for conversation history?**
LLMs have no memory between API calls. MongoDB stores each message per `sessionId`, allowing the agent to load previous context on every request — giving users a continuous conversation experience.

---

## 🔮 Future Improvements

- [ ] React frontend with chat UI
- [ ] Deploy to Railway or Render for a live public URL
- [ ] JWT authentication
- [ ] Replace mock orders with a real database
- [ ] Streaming responses with Server-Sent Events
- [ ] Rate limiting per API key
- [ ] Jest unit tests for tool routing logic

---

## 🔒 Security

- `.env` file is excluded via `.gitignore` — never committed to the repo
- API key authentication on all chat endpoints via `x-api-key` header

---

Built with using Node.js · LangChain · RAG · Gemini · ChromaDB · MongoDB
