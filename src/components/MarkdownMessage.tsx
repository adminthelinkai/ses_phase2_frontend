import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeHighlighter from './SyntaxHighlighter';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Markdown renderer component optimized for excellent readability.
 * Uses Inter font with optimized typography settings and integrates syntax highlighting.
 */
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`} style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      fontSize: '1rem',
      lineHeight: '1.75',
      letterSpacing: '0',
      color: 'var(--text-primary)',
      fontWeight: 400,
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '1.25rem',
              marginBottom: '0.75rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '0.875rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              lineHeight: '1.5',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }} {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p style={{
              marginTop: '0',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              lineHeight: '1.75',
            }} {...props} />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul style={{
              marginTop: '0',
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
              listStyleType: 'disc',
            }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{
              marginTop: '0',
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
            }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{
              marginTop: '0.5rem',
              marginBottom: '0',
              lineHeight: '1.75',
              fontSize: '1rem',
            }} {...props} />
          ),
          // Code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            if (!inline && language) {
              return (
                <CodeHighlighter
                  language={language}
                  code={code}
                  className="my-4"
                />
              );
            }

            // Inline code
            return (
              <code
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: '0.9em',
                  backgroundColor: 'var(--bg-base)',
                  padding: '0.125em 0.375em',
                  borderRadius: '0.25rem',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 400,
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Links
          a: ({ node, ...props }) => (
            <a
              style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
              }}
              {...props}
            />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeft: '3px solid var(--accent-blue)',
                paddingLeft: '1rem',
                marginLeft: '0',
                marginTop: '1rem',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
              }}
              {...props}
            />
          ),
          // Tables
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid var(--border-color)',
                }}
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              style={{
                backgroundColor: 'var(--bg-base)',
              }}
              {...props}
            />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr
              style={{
                borderBottom: '1px solid var(--border-color)',
              }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                padding: '0.5rem',
                textAlign: 'left',
                fontWeight: 600,
                borderRight: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                padding: '0.5rem',
                borderRight: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              {...props}
            />
          ),
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--border-color)',
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
              }}
              {...props}
            />
          ),
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }} {...props} />
          ),
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em style={{ fontStyle: 'italic' }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(MarkdownMessage);

