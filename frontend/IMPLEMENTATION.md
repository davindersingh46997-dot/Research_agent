# Implementation Summary - OpenRouter AI Chat Pipeline

## Architecture

The application uses a React + Vite chat frontend and a FastAPI backend. The backend reads OpenRouter settings with Pydantic Settings and sends chat completions to the model configured in the project-root `.env`.

### Request flow

1. The frontend posts `{ message, session_id }` to `/api/chat`.
2. Vite proxies `/api/*` to the FastAPI server on port 8000.
3. FastAPI calls the OpenRouter-compatible ChatOpenAI client and responds with `{ response, session_id, model }`.
4. The frontend displays the response and configured model name.

`GET /api/chat/health` reports the configured model and whether an API key is present. Unit tests mock the model call; a live OpenRouter test is available by setting `RUN_OPENROUTER_INTEGRATION_TESTS=1`.
