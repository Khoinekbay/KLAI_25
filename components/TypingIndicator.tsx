import React from 'react';
import { AngryBotIcon } from './Icons';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start animate-slide-in-up">
      <AngryBotIcon className="w-8 h-8 flex-shrink-0 mt-1 text-amber-400" />
      <div className="bg-model-bubble-bg text-model-bubble-text px-4 py-3 rounded-2xl flex items-center space-x-1.5 shadow-md">
        <span className="w-2.5 h-2.5 bg-current rounded-full animate-dynamic-dot [animation-delay:-0.4s]"></span>
        <span className="w-2.5 h-2.5 bg-current rounded-full animate-dynamic-dot [animation-delay:-0.2s]"></span>
        <span className="w-2.5 h-2.5 bg-current rounded-full animate-dynamic-dot"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;