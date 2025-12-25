// Type definitions for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const windowObj = window as unknown as IWindow;
const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

export class SpeechService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return !!SpeechRecognition && !!this.synthesis;
  }

  // Load voices and try to find a friendly one
  public initVoice(): void {
    const load = () => {
      const voices = this.synthesis.getVoices();
      // Try to find a gentle female voice or a standard US voice
      this.voice = voices.find(v => v.name.includes('Google US English')) ||
                   voices.find(v => v.name.includes('Samantha')) ||
                   voices.find(v => v.lang === 'en-US') ||
                   voices[0];
    };

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = load;
    }
    load();
  }

  public speak(text: string, onEnd?: () => void): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    // Clean text of emojis for speech
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    utterance.rate = 0.85; // Slower speed for kids
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public listen(onResult: (text: string) => void, onError: (err: any) => void, onEnd: () => void): void {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      // Sometimes it throws if already started
      console.error("Mic start error", e);
      onEnd();
    }
  }

  public stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }
  
  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();