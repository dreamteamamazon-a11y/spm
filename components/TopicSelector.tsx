import React, { useState } from 'react';
import { Topic } from '../types';
import { PREDEFINED_TOPICS } from '../constants';
import { getTopicSuggestions } from '../services/geminiService';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
  const [extraTopics, setExtraTopics] = useState<Topic[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleAskAI = async () => {
    setLoadingSuggestions(true);
    const suggestions = await getTopicSuggestions();
    setExtraTopics(suggestions);
    setLoadingSuggestions(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-comic font-bold text-indigo-700 mb-2">What do you want to talk about?</h2>
          <p className="text-slate-500 text-lg">Pick a card!</p>
        </div>

        {/* Extra AI Topics Section */}
        {loadingSuggestions && (
          <div className="flex justify-center mb-8">
             <div className="animate-bounce bg-white p-4 rounded-xl shadow-md border-2 border-indigo-100">
                <span className="text-2xl">🦉 Thinking...</span>
             </div>
          </div>
        )}
        
        {extraTopics.length > 0 && (
           <div className="mb-8">
             <h3 className="text-xl font-bold text-indigo-500 mb-4 px-2">✨ AI Ideas for You:</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {extraTopics.map((topic) => (
                 <button
                   key={topic.id}
                   onClick={() => onSelectTopic(topic.label)}
                   className={`${topic.color} hover:brightness-95 transform hover:scale-105 transition-all duration-200 p-6 rounded-3xl shadow-md flex flex-col items-center justify-center gap-2 aspect-[4/3] border-b-4 border-black/10`}
                 >
                   <span className="text-5xl drop-shadow-sm">{topic.emoji}</span>
                   <span className="text-lg font-bold text-slate-800 leading-tight">{topic.label}</span>
                 </button>
               ))}
             </div>
           </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {PREDEFINED_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.label)}
              className={`${topic.color} hover:brightness-95 transform hover:scale-105 transition-all duration-200 p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 aspect-square border-b-4 border-black/10`}
            >
              <span className="text-4xl sm:text-5xl">{topic.emoji}</span>
              <span className="font-bold text-slate-800 text-lg leading-tight">{topic.label}</span>
            </button>
          ))}
        </div>

        {/* Ask AI Button */}
        <div className="mt-10 flex justify-center pb-8">
          <button
            onClick={handleAskAI}
            disabled={loadingSuggestions}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl flex items-center gap-3 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>✨</span>
            Ask Owl for Ideas?
          </button>
        </div>
      </div>
    </div>
  );
};