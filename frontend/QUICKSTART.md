# Quick Start Guide - Research Agent Frontend

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# The default settings should work for local development
# VITE_API_URL=http://localhost:8000/api
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💬 Using the Chat Interface

### Text Chat
1. Type your research question in the input field
2. Press `Enter` or click the Send button
3. View AI response with sources (if RAG enabled)

### Voice Chat
1. Click the 🎤 microphone button to start recording
2. Speak your question clearly
3. Click 🎤 again to stop recording
4. Wait for transcription and response

### RAG Options
1. Click "RAG Options" in the sidebar
2. Enable RAG with the toggle
3. Choose source type: Documents, Web, or Both
4. Adjust max sources and relevance threshold
5. Settings save automatically

### Chat History
- All chats are saved to local storage
- Click any session to view previous conversations
- Delete sessions with the trash icon
- New chats start with "New Chat" button

## 🔧 Common Tasks

### Add Custom API Endpoint
Edit `.env`:
```
VITE_API_URL=https://your-backend-api.com/api
```

### Build for Production
```bash
npm run build
```
Output files will be in `dist/` folder.

### Debug Mode
Open browser DevTools (F12) and check:
- Console for errors
- Application > Local Storage for saved chats
- Network tab for API calls

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/pages/ChatPage.tsx` | Main chat interface logic |
| `src/components/*` | Reusable UI components |
| `src/utils/api.ts` | Backend API calls |
| `src/utils/storage.ts` | Local storage management |
| `src/utils/voice.ts` | Voice recording/playback |

## 🎨 Customize Appearance

### Change Color Scheme
Edit `tailwind.config.js` colors section

### Add Custom Fonts
Edit `src/App.css` and `index.css`

### Modify Component Styling
Each component uses Tailwind classes - edit them directly

## 🚨 Troubleshooting

### Port 3000 Already In Use
```bash
npm run dev -- --port 3001
```

### Microphone Not Working
- Check browser permissions for microphone
- Ensure backend supports voice API
- Try in a different browser

### Chat Not Appearing
- Check Network tab for API errors
- Verify backend is running
- Clear local storage: `localStorage.clear()`

### Styling Looks Broken
- Clear browser cache (Ctrl+Shift+R)
- Rebuild: `npm run build`

## 📚 Learn More

- [Full README](./README.md)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 💡 Pro Tips

1. **Use Shift+Enter** to create new lines in messages
2. **Enable voice** for hands-free research
3. **Use RAG** for document-grounded responses
4. **Check sources** included with AI responses
5. **Toggle sidebar** for full-screen chat

## 🆘 Need Help?

1. Check the troubleshooting section
2. Review browser console for errors
3. Verify backend is running and accessible
4. Ensure all dependencies are installed

---

Happy researching! 🔬📚
