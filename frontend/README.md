# OpenRouter AI Chat - Frontend

A modern, responsive chat interface built with React, TypeScript, and Vite. It connects through the Vite development proxy to the FastAPI backend, which calls the OpenRouter model configured in the project-root `.env`.

---

## 🚀 Features

- **Direct Chat Pipeline**: Connects to the FastAPI backend `/api/chat` endpoint.
- **Modern UI**:
  - Distinguishes between user questions and model replies.
  - One-click copy for assistant responses.
  - Interactive starter prompt suggestions on the welcome screen.
  - Real-time animated loading state while the model generates responses.
  - A live search icon and status while the agent looks up current web information.
  - Clear, user-friendly error banners with actionable guidance.
- **Keyboard Controls**:
  - `Enter` to send message.
  - `Shift + Enter` for multi-line messages.
  - `Cmd/Ctrl + N` to start a new chat.

---

## 🛠️ Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Start the FastAPI backend from the project root in a separate terminal:

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000 --reload
```

The frontend uses Vite's development proxy to forward all `/api/*` calls to the FastAPI backend running on port 8000.
