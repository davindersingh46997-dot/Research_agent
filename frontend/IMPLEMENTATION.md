# Implementation Summary - OpenRouter AI Chat Pipeline

## Architecture

The application uses a React + Vite chat frontend and a FastAPI backend. The backend reads OpenRouter settings with Pydantic Settings and sends chat completions to the model configured in the project-root `.env`.

### Request flow

1. The frontend posts `{ message, session_id }` to `/api/chat`.
2. Vite proxies `/api/*` to the FastAPI server on port 8000.
3. FastAPI streams OpenRouter tokens as Server-Sent Events; a final `done` event carries the session ID and model name.
4. The frontend renders each token as it arrives and displays provider errors as chat alerts.

`GET /api/chat/health` reports the configured model and whether an API key is present. Unit tests mock the model call; a live OpenRouter test is available by setting `RUN_OPENROUTER_INTEGRATION_TESTS=1`.
