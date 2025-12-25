import React, { useState, useEffect } from 'react';
import { SpeechStatus } from '../types';

interface InputAreaProps {
  status: SpeechStatus;
  onSendMessage: (text: string) => void;
  onToggleRecording: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ status, onSendMessage, onToggleRecording }) => {
  const [inputText, setInputText] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleSendClick = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  // Visual feedback for microphone state
  const isListening = status === SpeechStatus.LISTENING;
  const isProcessing = status === SpeechStatus.PROCESSING;
  const isSpeaking = status === SpeechStatus.SPEAKING;

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 pb-6 safe-area-bottom">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        
        {/* Status Indicator Text */}
        <div className="h-6 flex items-center justify-center text-sm font-bold text-slate-500 uppercase tracking-wider">
          {isListening && <span className="text-red-500 animate-pulse">● Listening...</span>}
          {isProcessing && <span className="text-indigo-500 animate-bounce">Thinking...</span>}
          {isSpeaking && <span className="text-green-500">Speaking...</span>}
        </div>

        <div className="flex items-center gap-3">
          {/* Microphone Button (Big & Prominent) */}
          <button
            onClick={onToggleRecording}
            disabled={isProcessing || isSpeaking}
            className={`
              h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isListening 
                ? 'bg-red-500 shadow-red-200 ring-4 ring-red-200' 
                : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200'}
              ${(isProcessing || isSpeaking) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
            aria-label="Toggle Microphone"
          >
            {isListening ? (
               <div className="w-6 h-6 bg-white rounded-md animate-pulse" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Text Input (Fallback) */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Say something..." : "Type here if you prefer..."}
              disabled={isListening || isProcessing}
              className="w-full h-14 pl-5 pr-14 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-0 text-lg outline-none transition-colors disabled:bg-slate-50"
            />
            <button
              onClick={handleSendClick}
              disabled={!inputText.trim() || isProcessing}
              className="absolute right-2 top-2 h-10 w-10 bg-yellow-400 hover:bg-yellow-500 rounded-xl flex items-center justify-center text-yellow-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};