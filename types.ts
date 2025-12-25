export type Sender = 'bot' | 'user';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  isCorrected?: boolean;
}

export enum SpeechStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  PROCESSING = 'PROCESSING',
}

export type LearningMode = 'conversation' | 'vocabulary';

export interface ChatState {
  messages: Message[];
  status: SpeechStatus;
  error: string | null;
}

export interface Topic {
  id: string;
  label: string;
  emoji: string;
  color: string; // Tailwind color class e.g. 'bg-red-200'
}