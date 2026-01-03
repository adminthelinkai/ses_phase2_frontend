import React, { memo, useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
  viewMode: 'project_chat' | 'global_chat';
}

export interface ChatInputHandle {
  focus: () => void;
}

/**
 * Optimized chat input component with textarea support, character count, and memoization.
 * Uses debounced character count updates for performance.
 */
const ChatInput = memo(forwardRef<ChatInputHandle, ChatInputProps>(({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  disabled = false,
  viewMode,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Detect current theme from document
  useEffect(() => {
    const detectTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light' | null;
      setTheme(currentTheme === 'light' ? 'light' : 'dark');
    };

    // Initial detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));
  const [characterCount, setCharacterCount] = useState(0);
  const [showCharCount, setShowCharCount] = useState(false);

  // Debounce character count updates (only update every 100ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const count = value.length;
      setCharacterCount(count);
      setShowCharCount(count > 100);
    }, 100);

    return () => clearTimeout(timer);
  }, [value]);

  // Auto-resize textarea with improved logic
  useEffect(() => {
    const resizeTextarea = () => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        
        // Temporarily set height to 0 to get accurate scrollHeight
        const previousHeight = textarea.style.height;
        textarea.style.height = '0px';
        
        // Get the scroll height (content height including padding)
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200; // Max 200px height
        const minHeight = 44; // Min height for one line
        
        // Calculate the new height
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
        textarea.style.height = `${newHeight}px`;
        
        // If content exceeds max height, ensure we can scroll to see the cursor
        if (scrollHeight > maxHeight) {
          // Scroll to bottom to show the latest typed text
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
          });
        }
      }
    };

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(resizeTextarea);
    
    // Also trigger resize after a short delay to catch any layout changes
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(resizeTextarea);
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  }, [value, isLoading, onSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Handle input event to resize immediately as user types
  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    // Reset height to get accurate scrollHeight
    textarea.style.height = '0px';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200;
    const minHeight = 44;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;
    
    // Scroll to show cursor if content exceeds max height
    if (scrollHeight > maxHeight) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    textareaRef.current?.focus();
  }, [onChange]);

  const defaultPlaceholder = viewMode === 'project_chat' 
    ? "Ask about your project..."
    : "Ask anything globally...";

  return (
    <form 
      onSubmit={onSubmit} 
      className="relative bg-[var(--bg-panel)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl flex flex-col shadow-2xl transition-all duration-300 focus-within:border-[var(--accent-blue)] focus-within:ring-4 ring-[var(--accent-blue)]/10 overflow-hidden"
    >
      {/* Textarea */}
      <div className="flex items-center gap-1.5 p-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2 disabled:opacity-50 resize-none overflow-y-auto custom-scrollbar chat-input-textarea"
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.5',
            color: theme === 'light' ? '#0f172a' : '#f0f4f8',
            caretColor: 'var(--accent-blue)',
            fontWeight: 400,
            WebkitTextFillColor: theme === 'light' ? '#0f172a' : '#f0f4f8',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            maxHeight: '200px',
            minHeight: '44px',
            overflowY: 'auto' as const,
            height: 'auto',
            paddingTop: '12px',
            paddingBottom: '12px',
          } as React.CSSProperties}
        />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Clear Button */}
          {value.trim() && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-white/5"
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Attach File Button */}
          <button
            type="button"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-white/5"
            title="Attach file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="bg-[var(--accent-blue)] w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-lg hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Send message"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Character Count */}
      {showCharCount && (
        <div className="px-2 pb-1">
          <div className="text-[9px] text-[var(--text-muted)] text-right">
            {characterCount} characters
          </div>
        </div>
      )}
    </form>
  );
}));

ChatInput.displayName = 'ChatInput';

export default ChatInput;

