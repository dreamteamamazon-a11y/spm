import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${isBot ? 'bg-indigo-400' : 'bg-yellow-400'}`}>
          <span className="text-xl">{isBot ? '🦉' : '😊'}</span>
        </div>

        {/* Bubble */}
        <div 
          className={`
            relative px-5 py-4 rounded-3xl text-lg md:text-xl leading-snug shadow-md
            ${isBot 
              ? 'bg-white text-slate-700 rounded-bl-none border border-slate-100' 
              : 'bg-yellow-300 text-yellow-900 rounded-br-none border border-yellow-400 font-bold'}
          `}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
};