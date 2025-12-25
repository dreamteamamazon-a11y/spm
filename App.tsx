import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { speechService } from './services/speechService';
import { Message, Sender, SpeechStatus, LearningMode } from './types';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { TopicSelector } from './components/TopicSelector';

type ViewState = 'landing' | 'selection' | 'mode-select' | 'chat';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SpeechStatus>(SpeechStatus.IDLE);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('conversation');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Initialize Voice on mount
  useEffect(() => {
    speechService.initVoice();
  }, []);

  const addMessage = (text: string, sender: Sender) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(),
        sender,
        text,
      },
    ]);
  };

  const handleTopicSelected = (topic: string) => {
    setCurrentTopic(topic);
    setView('mode-select');
  };

  const startSession = async (mode: LearningMode) => {
    if (!currentTopic) return;
    
    setLearningMode(mode);
    setView('chat');
    setStatus(SpeechStatus.PROCESSING);
    
    // Initialize Voice context
    speechService.initVoice();

    // Init chat with mode specific instructions
    const greeting = await initializeChat(currentTopic, mode);
    
    setStatus(SpeechStatus.SPEAKING);
    addMessage(greeting, 'bot');
    
    speechService.speak(greeting, () => {
      setStatus(SpeechStatus.IDLE);
      // Start timeout for both Conversation and Vocabulary modes
      startInactivityTimeout();
    });
  };

  const startInactivityTimeout = () => {
    // Clear any existing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set new 7s timer to prompt translation/help
    timeoutRef.current = window.setTimeout(() => {
      handleInactivityTimeout();
    }, 7000);
  };

  const handleInactivityTimeout = async () => {
    if (status === SpeechStatus.LISTENING) {
       speechService.stopListening();
    }
    
    setStatus(SpeechStatus.PROCESSING);
    
    // Send hidden prompt to Gemini for translation/help
    const translation = await sendMessageToGemini("TIMEOUT_TRANSLATE");
    
    addMessage(translation, 'bot');
    setStatus(SpeechStatus.SPEAKING);
    
    speechService.speak(translation, () => {
      setStatus(SpeechStatus.IDLE);
      // Restart timeout after explaining (give them another chance to say it)
      startInactivityTimeout();
    });
  };

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Clear timeout immediately when user speaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 1. Add User Message
    addMessage(text, 'user');
    setStatus(SpeechStatus.PROCESSING);

    // 2. Get Bot Response
    const response = await sendMessageToGemini(text);

    // 3. Add Bot Message
    addMessage(response, 'bot');

    // 4. Speak Bot Response
    setStatus(SpeechStatus.SPEAKING);
    speechService.speak(response, () => {
      setStatus(SpeechStatus.IDLE);
      // Restart timeout after bot speaks to wait for next user input
      startInactivityTimeout();
    });
  }, [learningMode]);

  const toggleRecording = useCallback(() => {
    // Clear timeout if user manually interacts
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }

    if (status === SpeechStatus.LISTENING) {
      speechService.stopListening();
      setStatus(SpeechStatus.IDLE);
      // If they stopped listening without saying anything, restart timer
      startInactivityTimeout();
    } else {
      setStatus(SpeechStatus.LISTENING);
      speechService.listen(
        (text) => {
          // Success
          speechService.stopListening();
          setTimeout(() => handleUserMessage(text), 200);
        },
        (error) => {
          console.error("Speech Error:", error);
          setStatus(SpeechStatus.IDLE);
          // Restart timer on error to keep the loop going
          startInactivityTimeout(); 
        },
        () => {
           // On End
        }
      );
    }
  }, [status, handleUserMessage]);

  const handleBack = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    speechService.stopSpeaking();
    speechService.stopListening();
    setMessages([]);
    
    if (view === 'chat') {
        setView('mode-select');
    } else if (view === 'mode-select') {
        setCurrentTopic(null);
        setView('selection');
    }
  };

  // 1. Landing Screen
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-comic">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border-4 border-white">
          <div className="text-8xl mb-6 animate-bounce">🦉</div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Little Talkers</h1>
          <p className="text-slate-600 mb-8 text-xl">
            Hi! I'm your English buddy.<br/>
            Let's learn and play together!
          </p>
          <button
            onClick={() => setView('selection')}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-2xl font-bold py-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            Start! 🚀
          </button>
        </div>
      </div>
    );
  }

  // 2. Topic Selection Screen
  if (view === 'selection') {
    return (
      <div className="flex flex-col h-screen bg-sky-100 overflow-hidden font-comic">
        <header className="bg-white shadow-sm p-4 z-10 sticky top-0">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
              🦉
            </div>
            <h1 className="text-xl font-bold text-indigo-800">Little Talkers</h1>
          </div>
        </header>
        <TopicSelector onSelectTopic={handleTopicSelected} />
      </div>
    );
  }

  // 2.5 Mode Selection Screen
  if (view === 'mode-select') {
    return (
        <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-comic">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center border-4 border-white relative">
                <button 
                    onClick={handleBack}
                    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-2xl"
                >
                    ⬅️
                </button>
                
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">Topic: {currentTopic}</h2>
                <p className="text-slate-500 text-xl mb-8">What do you want to do?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => startSession('vocabulary')}
                        className="bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 p-8 rounded-3xl flex flex-col items-center gap-4 transition-transform hover:scale-105"
                    >
                        <span className="text-6xl">📖</span>
                        <div>
                            <h3 className="text-2xl font-bold text-emerald-800">Learn Words</h3>
                            <p className="text-emerald-700">Learn new words!</p>
                        </div>
                    </button>

                    <button
                        onClick={() => startSession('conversation')}
                        className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 p-8 rounded-3xl flex flex-col items-center gap-4 transition-transform hover:scale-105"
                    >
                        <span className="text-6xl">🗣️</span>
                        <div>
                            <h3 className="text-2xl font-bold text-blue-800">Chat</h3>
                            <p className="text-blue-700">Talk with Owl!</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // 3. Chat Screen
  return (
    <div className="flex flex-col h-screen bg-sky-100 overflow-hidden font-comic">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-2xl"
            >
              ⬅️
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-indigo-800 leading-none">Little Talkers</h1>
              <div className="flex gap-2 text-sm">
                <span className="text-indigo-500 font-bold">{currentTopic}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{learningMode === 'vocabulary' ? '📖 Words' : '🗣️ Chat'}</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
            🦉
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-3xl mx-auto pt-4 pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {/* Helper prompt if empty */}
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              Loading...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea 
        status={status}
        onSendMessage={handleUserMessage}
        onToggleRecording={toggleRecording}
      />
    </div>
  );
};

export default App;