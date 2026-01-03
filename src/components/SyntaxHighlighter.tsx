import React, { memo, useMemo, useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeHighlighterProps {
  language?: string;
  code: string;
  className?: string;
}

/**
 * Theme-aware syntax highlighter component optimized for the design system.
 * Uses JetBrains Mono font and adapts to dark/light theme.
 */
const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ 
  language = 'text', 
  code,
  className = ''
}) => {
  // State to track current theme
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return document.documentElement.getAttribute('data-theme') !== 'light';
  });

  // Watch for theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    };

    // Check theme on mount
    updateTheme();

    // Watch for attribute changes (theme switching)
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Select theme based on current state
  const theme = useMemo(() => (isDark ? oneDark : oneLight), [isDark]);

  // Custom style for container that uses CSS variables
  const customStyle = useMemo(() => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.875rem',
    lineHeight: '1.6',
    fontWeight: 400,
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    margin: '0',
    overflow: 'auto',
  }), []);

  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        style={theme}
        customStyle={customStyle}
        PreTag="div"
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', monospace",
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default memo(CodeHighlighter);

