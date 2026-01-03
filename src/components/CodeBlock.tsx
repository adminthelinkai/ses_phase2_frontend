import React, { memo, useState, useCallback } from 'react';
import CodeHighlighter from './SyntaxHighlighter';

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

/**
 * Code block component with copy button.
 * Optimized with React.memo for performance.
 */
const CodeBlock: React.FC<CodeBlockProps> = memo(({ language, code, className = '' }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  return (
    <div className={`relative group ${className}`}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-[var(--bg-panel)]/80 backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] transition-all opacity-0 group-hover:opacity-100 z-10"
        title={isCopied ? 'Copied!' : 'Copy code'}
      >
        {isCopied ? (
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Code Highlighter */}
      <CodeHighlighter language={language} code={code} />
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;

