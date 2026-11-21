# Research Agent Chat Application

An AI chat application featuring a FastAPI backend connected to an OpenRouter chat model and a React + TypeScript frontend. NeMo Guardrails limits chat requests to research and current-affairs topics, while the LangGraph agent creates a short internal outline for complex requests and uses Tavily web search when current or externally sourced information is needed. The UI shows high-level activity states, not the agent's private reasoning or outline.

---

## 🏗️ Architecture

```
Research_agent/
├── .env                       # API keys and model configuration
├── backend/                   # FastAPI backend
│   ├── api/
│   │   └── chat.py            # Chat and health API routes
│   ├── guardrails/            # NeMo Guardrails input-scope policy
│   ├── core/
│   │   └── config.py          # Pydantic settings loaded from the root .env
│   ├── models/
│   │   ├── __init__.py
│   │   └── chat_model.py      # OpenRouter model integration
│   ├── tests/
│   │   └── test_chat.py       # Backend unit tests
│   ├── main.py                # FastAPI server exposing /api/chat & /api/chat/health
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatWindow.tsx # Chat interface, input area, and message thread
│   │   ├── hooks/
│   │   │   └── useChat.ts     # Chat state management hook
│   │   ├── services/
│   │   │   └── chatApi.ts     # API client communicating with backend
│   │   └── types/
│   │       └── chat.ts        # Chat TypeScript interfaces
│   └── vite.config.ts         # Vite proxy forwarding /api to backend:8000
└── README.md
```

---

## 🚀 Getting Started

### 1. Environment Configuration

In the project root, configure the OpenRouter credentials and model:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_openrouter_model_id
TAVILY_API_KEY=your_tavily_api_key
```

### 2. Install Backend Dependencies and Start the API

```bash
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000 --reload
```

The backend API will be running at `http://127.0.0.1:8000`.

- Chat endpoint: `POST /api/chat`
- Health check: `GET /api/chat/health`

### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. Vite forwards `/api/chat` requests to FastAPI, which streams OpenRouter response chunks to the chat UI using Server-Sent Events.

---

## 🧪 Testing

Run backend unit tests:

```bash
.\venv\Scripts\python.exe -m unittest discover -s backend/tests -v
```

The unit tests mock model and search calls. Configure `TAVILY_API_KEY` to enable web search. To make a live OpenRouter smoke request, set `RUN_OPENROUTER_INTEGRATION_TESTS=1` before running the test suite.
