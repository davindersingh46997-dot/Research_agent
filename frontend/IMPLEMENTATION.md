# Implementation Summary - OpenRouter AI Chat Pipeline

## Architecture

The application uses a React + Vite chat frontend and a FastAPI backend. The backend reads OpenRouter settings with Pydantic Settings and sends chat completions to the model configured in the project-root `.env`.

### Request flow

1. The frontend posts `{ message, session_id }` to `/api/chat`.
2. Vite proxies `/api/*` to the FastAPI server on port 8000.
3. FastAPI runs the message through the NeMo Guardrails input rail. Personal or unrelated requests are rejected before chat generation.
4. Accepted requests stream OpenRouter tokens as Server-Sent Events; a final `done` event carries the session ID and model name.
5. The frontend renders each token as it arrives and displays provider errors or rejected-input messages as chat alerts.

Complex requests take an internal planning step in the LangGraph workflow. The stream reports only activity labels such as planning, reasoning, and web search; it does not send the private outline or reasoning text to the UI.

NeMo Guardrails checks user input before planning and checks each web-search result before it is added to the model context. Requests or sources that fail prompt-injection checks are rejected rather than passed to the assistant.

The composer switches to a **Stop generating** control while a response is in progress. Stopping aborts the request stream, cancels the async LangGraph model call, and keeps any response text already received.

`GET /api/chat/health` reports the configured model and whether an API key is present. Unit tests mock the model call; a live OpenRouter test is available by setting `RUN_OPENROUTER_INTEGRATION_TESTS=1`.
