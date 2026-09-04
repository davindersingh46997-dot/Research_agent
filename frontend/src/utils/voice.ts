export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.chunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Microphone access denied');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
        this.chunks = [];
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording error: ${event.error}`));
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export class VoicePlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  play(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        this.audio = new Audio(audioUrl);

        this.audio.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.audio.onerror = () => {
          this.isPlaying = false;
          reject(new Error('Failed to play audio'));
        };

        this.isPlaying = true;
        this.audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
