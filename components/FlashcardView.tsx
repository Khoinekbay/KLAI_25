import React, { useState } from 'react';
import { XIcon } from './Icons';

interface Flashcard {
  term: string;
  definition: string;
}

interface FlashcardViewProps {
  cards: Flashcard[];
  onClose: () => void;
}

// Renders simple inline markdown (bold, italic, code)
const renderMarkdown = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-900 text-amber-600 dark:text-amber-400 px-1.5 py-1 rounded text-sm font-mono">$1</code>');
    return { __html: html };
};

const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onClose }) => {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const handleReveal = (index: number) => {
    setRevealedIndices(prev => new Set(prev).add(index));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Bộ thẻ Flashcard</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-card-hover" aria-label="Đóng">
            <XIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-3">
            {cards.map((card, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 bg-input-bg/50 rounded-lg items-center min-h-[4rem]">
                <div 
                    className="md:col-span-2 font-medium text-text-primary pr-4 break-words"
                    dangerouslySetInnerHTML={renderMarkdown(card.term)}
                >
                </div>
                <div className="md:col-span-3 relative text-text-secondary break-words">
                  <div 
                    className="p-2 min-h-[2.5rem]" 
                    dangerouslySetInnerHTML={renderMarkdown(card.definition)}
                  ></div>
                  <div
                    onClick={() => handleReveal(index)}
                    className={`flashcard-item-cover ${revealedIndices.has(index) ? 'is-revealed' : ''}`}
                  >
                    <span>Bấm để xem</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;