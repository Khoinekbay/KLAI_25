
import React, { useState, useEffect, useRef } from 'react';
import { type Message } from '../types';
import { UserIcon, AngryBotIcon, SpeakerIcon, ShareIcon, CheckIcon, BellPlusIcon, FlashcardIcon, FileIcon } from './Icons';
import { type FollowUpAction } from '../App';

// Let TypeScript know about the MathJax object on the window
declare global {
  interface Window {
    MathJax: {
      typesetPromise: () => Promise<void>;
    };
  }
}

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
  isLoading?: boolean;
  onFollowUpClick?: (originalText: string, action: FollowUpAction) => void;
  onApplySchedule?: (markdownText: string) => void;
  onOpenFlashcards?: (cards: { term: string; definition: string }[]) => void;
}


const markdownToHTML = (markdown: string): string => {
  // This function handles the full markdown string.
  
  // Process block elements first to avoid them being wrapped in <p> tags.
  // Order matters. Tables, code blocks, lists should be parsed before paragraphs.

  let html = markdown
    // Headings
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Fenced Code Blocks
    .replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang}">${escapedCode.trim()}</code></pre>`;
    })
    // Tables
    .replace(/^\|(.+)\|\r?\n\|( *[-:]+[-| :]*)\|\r?\n((?:\|.*\|\r?\n?)*)/gm, (match, header, separator, body) => {
      const headers = header.split('|').slice(1, -1).map(h => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(rowStr => {
          const cells = rowStr.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
          return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists (a bit tricky with regex, but this handles simple cases)
    .replace(/^\s*([*-]) (.*)/gm, '<ul><li>$2</li></ul>') // Unordered
    .replace(/^\s*(\d+)\. (.*)/gm, '<ol><li>$2</li></ol>') // Ordered
    .replace(/<\/ul>\s*<ul>/g, '') // Merge consecutive UL
    .replace(/<\/ol>\s*<ol>/g, ''); // Merge consecutive OL
  
  // Process inline elements
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-900 text-amber-600 dark:text-amber-400 px-1.5 py-1 rounded text-sm font-mono">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">$1</a>');

  // Paragraphs: wrap remaining text blocks in <p> tags.
  // A block is separated by one or more empty lines.
  html = html.split(/\n\s*\n/).map(paragraph => {
      if (!paragraph.trim()) return '';
      // Don't wrap if it's already a block element
      if (paragraph.trim().match(/^(<\/?(h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|pre|code))/)) {
          return paragraph;
      }
      // For paragraphs, convert single newlines to <br>
      return `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastMessage = false, isLoading = false, onFollowUpClick, onApplySchedule, onOpenFlashcards }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';
  const timeoutRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Effect for the "typing" animation
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const shouldAnimate = message.role === 'model' && isLastMessage && isLoading;

    if (!shouldAnimate) {
      setDisplayedText(message.text);
      return;
    }

    if (displayedText.length < message.text.length) {
      const nextChar = message.text[displayedText.length];
      // Create a more natural typing rhythm
      let delay = 25 + Math.random() * 20; // Base speed: ~25-45ms per char
      if (['.', '?', '!', ',', ';', ':'].includes(nextChar)) {
        delay = 250; // Longer pause for punctuation
      } else if (nextChar === '\n') {
        delay = 150; // Pause for new lines
      }

      const typeNextChar = () => {
        setDisplayedText(message.text.substring(0, displayedText.length + 1));
      };
      timeoutRef.current = window.setTimeout(typeNextChar, delay);

    } else if (!isLoading && displayedText !== message.text) {
      // Ensure final text is set if loading finishes early
      setDisplayedText(message.text);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message.text, displayedText, isUser, isLastMessage, isLoading]);
  
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    const isStableBotMessage = message.role === 'model' && (!isLastMessage || !isLoading);
    if (contentRef.current && isStableBotMessage) {
        if (window.MathJax) {
            window.MathJax.typesetPromise().catch(err => console.error('MathJax typesetting failed:', err));
        }
    }
  }, [displayedText, isLastMessage, isLoading, message.role]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToSpeak = message.text.replace(/\$|\\\(|\\\)|\\\[|\\\]/g, '');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleShare = async () => {
    const textToShare = message.text;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KL AI Chat Message',
          text: textToShare,
        });
      } catch (error) {
        console.error('Lỗi khi chia sẻ:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Không thể sao chép văn bản:', error);
      }
    }
  };

  const renderContent = (text: string) => {
    if (!text) return null;

    const mathBlocks: string[] = [];
    const placeholder = '___MATHJAX_PLACEHOLDER___';

    const textWithPlaceholders = text.replace(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g, (match) => {
        const index = mathBlocks.length;
        mathBlocks.push(match);
        return `${placeholder}${index}${placeholder}`;
    });

    let html = markdownToHTML(textWithPlaceholders);
    
    mathBlocks.forEach((block, index) => {
        const searchString = `${placeholder}${index}${placeholder}`;
        html = html.replace(searchString, block);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const textToDisplay = isUser ? message.text : displayedText;
  const isTyping = isLastMessage && isLoading && message.role === 'model' && message.text.length > 0;

  const bubbleClasses = isUser 
    ? 'bg-gradient-to-br from-brand to-blue-700 text-user-bubble-text' 
    : 'bg-model-bubble-bg text-model-bubble-text';
  const alignmentClasses = isUser ? 'justify-end' : 'justify-start';
  const IconComponent = isUser ? UserIcon : AngryBotIcon;
  const iconClasses = isUser ? 'text-brand' : 'text-amber-400';
  const showFollowUpActions = !isUser && (!isLastMessage || !isLoading) && message.text && onFollowUpClick;
  const showApplyScheduleButton = !isUser && (!isLastMessage || !isLoading) && message.text.includes('|') && message.text.includes('---') && onApplySchedule;
  const showOpenFlashcardsButton = !isUser && message.flashcards && message.flashcards.length > 0 && onOpenFlashcards;

  if (!textToDisplay && message.role === 'model' && !isTyping && !message.file) {
    return null;
  }
  
  return (
    <div className="animate-slide-in-up">
      <div className={`flex items-start gap-3 w-full max-w-full ${alignmentClasses}`}>
        {!isUser && <IconComponent className={`w-8 h-8 flex-shrink-0 mt-1 ${iconClasses}`} />}
        <div 
          ref={contentRef}
          className={`px-4 py-3 rounded-2xl max-w-xl lg:max-w-3xl prose prose-sm dark:prose-invert break-words shadow-md ${bubbleClasses}`}
        >
          {message.file && (
            <div className="mb-2 not-prose">
              {message.file.mimeType.startsWith('image/') ? (
                <img src={message.file.dataUrl} alt={message.file.name} className="max-w-xs max-h-64 rounded-lg" />
              ) : (
                <a
                  href={message.file.dataUrl}
                  download={message.file.name}
                  className="flex items-center gap-3 p-3 bg-card/50 dark:bg-card/20 rounded-lg hover:bg-card/80 dark:hover:bg-card/40 transition-colors border border-border"
                  title={`Tải xuống ${message.file.name}`}
                >
                  <FileIcon className="w-6 h-6 text-text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary truncate">{message.file.name}</span>
                </a>
              )}
            </div>
          )}
          {renderContent(textToDisplay)}
          {isTyping && <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1 align-bottom"></span>}
        </div>
        {isUser && <IconComponent className={`w-8 h-8 flex-shrink-0 mt-1 ${iconClasses}`} />}
      </div>
      
      <div className={`flex items-center flex-wrap gap-2 mt-2 ${isUser ? 'justify-end' : 'pl-11'}`}>
        {!isUser && message.text && (!isLastMessage || !isLoading) && (
            <>
                <button 
                onClick={handleToggleSpeech} 
                className="p-1.5 bg-card-hover/60 hover:bg-card-hover rounded-full transition-colors"
                aria-label={isSpeaking ? "Dừng đọc" : "Đọc to"}
                title={isSpeaking ? "Dừng đọc" : "Đọc to"}
                >
                <SpeakerIcon className={`w-4 h-4 ${isSpeaking ? 'text-brand' : 'text-text-secondary'}`} />
                </button>
                <button
                    onClick={handleShare}
                    className="p-1.5 bg-card-hover/60 hover:bg-card-hover rounded-full transition-colors"
                    aria-label={isCopied ? "Đã sao chép!" : "Chia sẻ"}
                    title={isCopied ? "Đã sao chép!" : "Chia sẻ"}
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ShareIcon className="w-4 h-4 text-text-secondary" />}
                </button>
            </>
        )}

        {showOpenFlashcardsButton && onOpenFlashcards && (
          <button
            onClick={() => onOpenFlashcards(message.flashcards!)}
            className="bg-brand/10 hover:bg-brand/20 text-brand text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-semibold"
          >
            <FlashcardIcon className="w-4 h-4" /> Mở lại bộ thẻ
          </button>
        )}

        {showApplyScheduleButton && onApplySchedule && (
          <button
            onClick={() => onApplySchedule(message.text)}
            className="bg-brand/10 hover:bg-brand/20 text-brand text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-semibold"
          >
            <BellPlusIcon className="w-4 h-4" /> Áp dụng lịch & Bật thông báo
          </button>
        )}

        {showFollowUpActions && (
          <>
            <button 
              onClick={() => onFollowUpClick(message.text, 'explain')}
              className="bg-card-hover/60 hover:bg-card-hover text-text-secondary text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              🔁 Giải thích thêm
            </button>
            <button 
              onClick={() => onFollowUpClick(message.text, 'example')}
              className="bg-card-hover/60 hover:bg-card-hover text-text-secondary text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              ✍️ Tạo ví dụ tương tự
            </button>
            <button 
              onClick={() => onFollowUpClick(message.text, 'summarize')}
              className="bg-card-hover/60 hover:bg-card-hover text-text-secondary text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              📈 Tóm tắt ngắn lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
