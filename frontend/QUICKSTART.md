# Quick Start Guide - OpenRouter Chat

Get up and running with the chat app in under 2 minutes.

---

## ⚡ 3 Simple Steps

### 1. Configure OpenRouter

Ensure `.env` in the project root contains your OpenRouter key and model ID:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_openrouter_model_id
```

### 2. Start the Backend

From the project root:

```bash
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000 --reload
```

### 3. Start the Frontend

In a separate terminal, from the `frontend` folder:

```bash
npm run dev
```

### 4. Start Chatting!

1. Open your browser at the URL shown (typically `http://localhost:3000` or `http://localhost:3001`).
2. Pick one of the suggestion starter prompts or type your own question in the input area.
3. Press **Enter** to send.
4. The request is routed through FastAPI to the configured OpenRouter model, and its response appears in the chat thread.

---

## ⌨️ Shortcuts

- **Enter**: Send message.
- **Shift + Enter**: New line.
- **"New chat" button**: Reset conversation and start fresh.
- **"Copy" button**: Copy assistant's response to your clipboard.

---

## 🔍 Health Check

To check the API and model configuration:

Visit `http://localhost:3000/api/chat/health` (or your active dev port) in your browser. You will see:

```json
{
  "status": "healthy",
  "model": "your_openrouter_model_id",
  "tokenConfigured": true
}
```
