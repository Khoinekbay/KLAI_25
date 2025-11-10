

export type Role = 'user' | 'model';

export interface Message {
  role: Role;
  text: string;
  file?: {
    name: string;
    dataUrl: string;
    mimeType: string;
  };
  flashcards?: { term: string; definition: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isPinned?: boolean;
}

export interface User {
  username: string;
  password: string;
  avatar?: string;
  fontPreference?: string;
  aiRole?: 'assistant' | 'teacher' | 'classmate';
  aiTone?: 'balanced' | 'humorous' | 'academic' | 'concise';
  theme?: 'light' | 'dark';
}
