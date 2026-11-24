import type {
  ChatActivity,
  ChatRequest,
  ChatResponse,
  ChatStreamEvent,
  SourceItem,
} from '../types/chat';

const API_BASE = '/api/chat';

function parseStreamEvent(frame: string): ChatStreamEvent | null {
  const data = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (!data) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error('Chat service returned malformed stream data.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Chat service returned an invalid stream event.');
  }

  const event = parsed as Record<string, unknown>;
  if (event.type === 'chunk' && typeof event.content === 'string') {
    return { type: 'chunk', content: event.content };
  }
  if (
    event.type === 'activity' &&
    (event.activity === 'planning' ||
      event.activity === 'searching' ||
      event.activity === 'thinking')
  ) {
    return { type: 'activity', activity: event.activity };
  }
  if (event.type === 'sources' && Array.isArray(event.sources)) {
    return { type: 'sources', sources: event.sources as SourceItem[] };
  }
  if (
    event.type === 'done' &&
    typeof event.session_id === 'string' &&
    typeof event.model === 'string'
  ) {
    return { type: 'done', session_id: event.session_id, model: event.model };
  }
  if (event.type === 'error' && typeof event.detail === 'string') {
    return { type: 'error', detail: event.detail };
  }

  throw new Error('Chat service returned an invalid stream event.');
}

export async function streamChatMessage(
  message: string,
  sessionId?: string,
  onChunk?: (content: string) => void,
  signal?: AbortSignal,
  onActivity?: (activity: ChatActivity) => void,
  onSources?: (sources: SourceItem[]) => void,
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    message: message.trim(),
    session_id: sessionId,
  };

  const response = await fetch(API_BASE, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = data?.detail || `Chat request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error('Chat service did not provide a response stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let responseText = '';
  let collectedSources: SourceItem[] = [];
  let completion: ChatResponse | null = null;

  const consumeFrame = (frame: string) => {
    const event = parseStreamEvent(frame);
    if (!event) return;

    if (event.type === 'chunk') {
      if (completion) {
        throw new Error('Chat service sent content after completing the response.');
      }
      responseText += event.content;
      onChunk?.(event.content);
    } else if (event.type === 'activity') {
      if (completion) {
        throw new Error('Chat service sent activity after completing the response.');
      }
      onActivity?.(event.activity);
    } else if (event.type === 'sources') {
      collectedSources = [...collectedSources, ...event.sources];
      onSources?.(collectedSources);
    } else if (event.type === 'error') {
      throw new Error(event.detail);
    } else {
      if (completion) {
        throw new Error('Chat service sent more than one completion event.');
      }
      completion = {
        response: responseText,
        session_id: event.session_id,
        model: event.model,
        sources: collectedSources.length > 0 ? collectedSources : undefined,
      };
    }
  };

  try {
    let finished = false;
    while (!finished) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      let delimiter = /\r?\n\r?\n/.exec(buffer);
      while (delimiter?.index !== undefined) {
        consumeFrame(buffer.slice(0, delimiter.index));
        buffer = buffer.slice(delimiter.index + delimiter[0].length);
        delimiter = /\r?\n\r?\n/.exec(buffer);
      }

      if (done) {
        if (buffer.trim()) consumeFrame(buffer);
        finished = true;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!completion) {
    throw new Error('Chat stream ended before the response was complete.');
  }
  return completion;
}

export async function checkChatHealth(): Promise<{
  status: string;
  model: string;
  tokenConfigured: boolean;
  searchConfigured?: boolean;
}> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Chat service is unavailable');
  }
  return response.json();
}
