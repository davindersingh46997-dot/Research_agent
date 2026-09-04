# Research Agent - Frontend

A professional, dynamic chat interface for a research agent built with React and TypeScript. Features include chat history management, RAG (Retrieval Augmented Generation) support, and voice input/output capabilities.

## 🚀 Features

### Core Features
- **Professional Chat Interface**: Modern, responsive design with dark theme
- **Chat History**: Persistent chat sessions stored locally
- **Message Display**: Rich message formatting with timestamps and source attribution
- **Real-time Updates**: Live message streaming and typing indicators

### RAG (Retrieval Augmented Generation)
- **Document Grounding**: Reference documents and web sources
- **Source Management**: Configure which documents to search
- **Relevance Filtering**: Set thresholds for source relevance
- **Max Sources Control**: Limit the number of sources per query
- **Flexible Source Types**: Choose between documents, web, or both

### Voice Features
- **Voice Input**: Record and transcribe voice messages
- **Voice Output**: Text-to-speech synthesis for responses
- **Recording Indicator**: Visual feedback during recording
- **Auto-transcription**: Automatic speech-to-text conversion
- **Auto-play Responses**: Optional automatic voice playback

### UI/UX
- **Collapsible Sidebar**: Toggle chat history panel
- **Header Controls**: Quick access to settings and features
- **Loading States**: Visual indicators for message processing
- **Responsive Design**: Works on desktop and tablet devices
- **Dark Theme**: Professional dark interface with accent colors

## 📋 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatHistory.tsx      # Sidebar with chat sessions
│   │   ├── ChatWindow.tsx       # Main message display
│   │   ├── Header.tsx           # Top navigation and controls
│   │   ├── InputArea.tsx        # Message input with voice
│   │   ├── MessageItem.tsx      # Individual message component
│   │   └── RAGOptions.tsx       # RAG configuration panel
│   ├── pages/
│   │   └── ChatPage.tsx         # Main page container
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── api.ts               # API client
│   │   ├── storage.ts           # Local storage management
│   │   └── voice.ts             # Voice recording/playback
│   ├── App.tsx                  # Root component
│   ├── App.css                  # Global styles
│   ├── index.tsx                # Entry point
│   └── index.css                # Base styles
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind config
└── postcss.config.js            # PostCSS config
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ or higher
- npm, yarn, or pnpm

### Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Configure API endpoint** (edit `.env`)
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

## 🚀 Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Checking
```bash
npx tsc --noEmit
```

## 📦 Dependencies

### Core
- **React 18.2+**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### API Communication
- **Axios**: HTTP client for API calls

### Development
- **@vitejs/plugin-react**: React support for Vite
- **ESLint**: Code linting

## 🎨 Styling

The project uses **Tailwind CSS** with custom color scheme:

### Color Palette
- **Primary**: Sky Blue (`primary-*`)
- **Dark**: Gray tones (`dark-*`)
- **Accent**: Red, Green, Yellow for specific states

### Custom Configuration
- Custom typography (Inter font)
- Dark theme by default
- Custom scrollbar styling
- Smooth animations and transitions

## 🔌 API Integration

The frontend expects the following API endpoints:

### Chat
- `POST /api/research/query` - Send message
  ```json
  {
    "message": "string",
    "sessionId": "string",
    "ragConfig": { /* RAG settings */ }
  }
  ```

### Sessions
- `GET /api/research/sessions` - Get all sessions
- `POST /api/research/sessions` - Create new session
- `DELETE /api/research/sessions/:id` - Delete session

### Voice
- `POST /api/research/transcribe` - Audio to text (multipart/form-data)
- `POST /api/research/synthesize` - Text to audio
  ```json
  {
    "text": "string"
  }
  ```

## 💾 Local Storage

The application stores the following in local storage:
- **Sessions**: Chat history and messages
- **RAG Config**: Retrieval settings
- **Voice Config**: Voice feature preferences

## 🎤 Voice Features

### Recording
- Click the microphone button to start/stop recording
- Audio is captured in WebM format
- Automatic transcription via backend API

### Playback
- Optional automatic playback of AI responses
- Configurable speech rate and language
- Manual audio playback from component

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + Enter` | New line in message input |
| `Enter` | Send message |
| `Escape` | Close modals/dropdowns |

## 🐛 Troubleshooting

### Microphone Access Denied
- Check browser permissions for microphone
- Ensure HTTPS is used in production (required for getUserMedia API)

### API Connection Failed
- Verify backend is running on configured port
- Check `VITE_API_URL` in `.env`
- Ensure CORS is enabled on backend

### Chat History Not Persisting
- Check browser's localStorage is enabled
- Verify storage quota hasn't been exceeded
- Clear browser cache if issues persist

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## 🔐 Security Notes

- All chat data is stored locally (client-side)
- Voice recordings are not stored, only transmitted to backend
- No analytics or tracking included
- HTTPS recommended for production

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use component composition for reusability
3. Implement proper error handling
4. Write meaningful commit messages

## 📄 License

This project is part of the Research Agent suite.

## 🔗 Links

- [Backend Documentation](../backend/README.md)
- [Project Root](../README.md)

---

Built with ❤️ for Research
