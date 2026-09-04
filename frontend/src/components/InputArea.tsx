import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, Plus } from 'lucide-react';
import { VoiceRecorder } from '@utils/voice';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onVoiceMessage: (audioBlob: Blob) => void;
  isLoading: boolean;
  voiceEnabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  onVoiceMessage,
  isLoading,
  voiceEnabled,
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const startRecording = async () => {
    try {
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (recorderRef.current) {
        const audioBlob = await recorderRef.current.stopRecording();
        onVoiceMessage(audioBlob);
        setIsRecording(false);
        setRecordingTime(0);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-dark-700 bg-dark-800 p-4">
      {/* Quick Actions */}
      <div className="flex gap-2 mb-4 pb-4 border-b border-dark-700 overflow-x-auto">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm whitespace-nowrap transition-colors">
          <Plus size={16} />
          New Chat
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm whitespace-nowrap transition-colors">
          <Paperclip size={16} />
          Upload
        </button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-sm">Recording: {formatRecordingTime(recordingTime)}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        {/* Text Input */}
        <div className="flex-1 flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your research question or use voice to speak..."
            className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            rows={3}
            disabled={isLoading || isRecording}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim() || isRecording}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white transition-colors"
            title="Send message (Shift+Enter)"
          >
            <Send size={18} />
          </button>

          {/* Voice Button */}
          {voiceEnabled && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center justify-center w-10 h-10 rounded-lg text-white transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-dark-700 hover:bg-dark-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-dark-500 flex justify-between">
        <span>Shift + Enter for new line</span>
        {voiceEnabled && <span>Click 🎤 to record voice input</span>}
      </div>
    </div>
  );
};
