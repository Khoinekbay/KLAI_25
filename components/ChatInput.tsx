
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, AttachmentIcon, XIcon, MicrophoneIcon, FileIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, file: { name: string; data: string; mimeType: string } | null) => void;
  isLoading: boolean;
  placeholder: string;
  featuresButton?: React.ReactNode;
}

// Let TypeScript know about the experimental SpeechRecognition API
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, placeholder, featuresButton }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'vi-VN';

    recognition.onstart = () => {
        setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prevText => (prevText ? prevText + ' ' : '') + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);


  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ data: base64String, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleRemoveFile = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || file) && !isLoading) {
      let filePayload: { name: string; data: string; mimeType: string } | null = null;
      if (file) {
        const { data, mimeType } = await fileToBase64(file);
        filePayload = { name: file.name, data, mimeType };
      }
      onSendMessage(text, filePayload);
      setText('');
      handleRemoveFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            setImagePreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setImagePreviewUrl(null);
        }
    }
  };

  const handleListenToggle = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {file && (
        <div className="relative w-full p-2 bg-input-bg rounded-lg border border-border flex items-center gap-3">
            {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-card rounded flex items-center justify-center">
                    <FileIcon className="w-8 h-8 text-text-secondary" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-xs text-text-secondary">{Math.round(file.size / 1024)} KB</p>
            </div>
            <button 
                type="button" 
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-card text-text-primary rounded-full p-1 hover:bg-card-hover border border-border"
                aria-label="Remove file"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        {featuresButton}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx,text/plain"
            className="hidden"
            id="file-upload"
        />
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-card-hover rounded-full hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-brand disabled:opacity-50 transition-colors"
            aria-label="Đính kèm tệp"
        >
            <AttachmentIcon className="w-6 h-6 text-text-secondary" />
        </button>
        <button
            type="button"
            onClick={handleListenToggle}
            disabled={isLoading}
            className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-brand disabled:opacity-50 transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-card-hover hover:bg-border text-text-secondary'
            }`}
            aria-label={isListening ? "Dừng ghi âm" : "Ghi âm giọng nói"}
        >
            <MicrophoneIcon className="w-6 h-6" />
        </button>
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none resize-none transition-all duration-200 disabled:opacity-50"
            style={{ maxHeight: '150px' }}
        />
        <button
            type="submit"
            disabled={isLoading || (!text.trim() && !file)}
            className="bg-brand text-white p-3 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-brand disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Gửi tin nhắn"
        >
            <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
