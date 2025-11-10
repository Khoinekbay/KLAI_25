import React, { useState, useEffect, useRef } from 'react';
import { XIcon, MinimizeIcon, MaximizeIcon, RestoreIcon } from './Icons';

interface ToolModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

const ToolModal: React.FC<ToolModalProps> = ({
  title,
  children,
  onClose,
  initialPosition,
  initialSize = { width: 500, height: 600 },
}) => {
  const [position, setPosition] = useState(
    initialPosition || { x: window.innerWidth / 2 - initialSize.width / 2, y: 100 }
  );
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const preMaximizeState = useRef({ position, size });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartOffset.current.x,
        y: e.clientY - dragStartOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  const handleToggleMinimize = () => setIsMinimized(!isMinimized);

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setPosition(preMaximizeState.current.position);
      setSize(preMaximizeState.current.size);
      setIsMaximized(false);
    } else {
      preMaximizeState.current = { position, size };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  };
  
  const modalStyle: React.CSSProperties = {
    top: isMaximized ? 0 : `${position.y}px`,
    left: isMaximized ? 0 : `${position.x}px`,
    width: isMaximized ? '100vw' : `${size.width}px`,
    height: isMaximized ? '100vh' : isMinimized ? 'auto' : `${size.height}px`,
  };

  return (
    <div
      style={modalStyle}
      className={`fixed z-20 bg-card rounded-lg shadow-2xl border border-border flex flex-col transition-all duration-200 ease-in-out ${isDragging ? 'transition-none' : ''} animate-slide-in-up`}
    >
      <header
        onMouseDown={handleMouseDown}
        onDoubleClick={!isMinimized ? handleToggleMaximize : undefined}
        onClick={isMinimized ? handleToggleMinimize : undefined}
        className={`flex items-center justify-between p-2 border-b border-border bg-sidebar rounded-t-lg select-none ${isMinimized ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <span className="font-bold text-sm pointer-events-none">{title}</span>
        <div className="flex items-center gap-1">
          <button onClick={handleToggleMinimize} className="p-1.5 rounded-full hover:bg-card-hover" aria-label="Minimize">
            <MinimizeIcon className="w-4 h-4 text-text-secondary" />
          </button>
          <button onClick={handleToggleMaximize} className="p-1.5 rounded-full hover:bg-card-hover" aria-label={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? <RestoreIcon className="w-4 h-4 text-text-secondary" /> : <MaximizeIcon className="w-4 h-4 text-text-secondary" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500/20" aria-label="Close">
            <XIcon className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </header>
      {!isMinimized && (
        <main className="flex-1 overflow-hidden bg-background">
          {children}
        </main>
      )}
    </div>
  );
};

export default ToolModal;
