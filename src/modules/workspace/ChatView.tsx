import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuery, ChatMessage } from '../../api/chat';

interface ChatViewProps {
  backgroundClass?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ backgroundClass = 'bg-dot-grid' }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatQuery(userMessage.content);
      
      if (response.error) {
        setError(response.error);
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError('Failed to send query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-inherit relative overflow-hidden transition-colors">
    {/* Dynamic Engineering Pattern Foundation */}
    <div className={`absolute inset-0 ${backgroundClass} ${(backgroundClass === 'bg-bricks' || backgroundClass === 'bg-dept-csa') ? 'opacity-70' : 'opacity-40'} pointer-events-none transition-all duration-700`}></div>
    
    {/* Supplemental Subtle Overlay for CSA/Brick Pattern */}
    {(backgroundClass === 'bg-bricks' || backgroundClass === 'bg-dept-csa') && (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_var(--bg-base)_90%)] opacity-50 pointer-events-none"></div>
    )}

    {/* Civil/Structural Technical Markers */}
    <div className="blueprint-mark w-16 h-16 top-20 left-20 border-dotted opacity-20"></div>
    <div className="blueprint-mark w-32 h-1 top-[10%] right-[15%] opacity-15 bg-[var(--accent-blue)]"></div>
    
    <div className="crosshair top-[35%] left-[48%]"></div>
    <div className="crosshair bottom-[30%] right-[40%]"></div>
    
    <div className="dimension-tick top-44 left-44 opacity-40"></div>
    <div className="dimension-tick bottom-72 right-96 rotate-180 opacity-40"></div>
    
    <div className="rebar-mark top-1/4 left-[10%]"></div>
    <div className="rebar-mark bottom-1/3 right-[12%]"></div>
    <div className="rebar-mark top-[60%] left-[85%]"></div>
    
    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 flex flex-col items-center relative z-10">
      <div className="w-full max-w-3xl space-y-12">
        {messages.length === 0 ? (
          <>
            <div className="flex items-center justify-center mt-12">
              <div className="w-14 h-14 bg-[var(--accent-blue)] rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/50 glow-active">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-black tracking-tighter uppercase tracking-widest text-[var(--text-primary)]">Project Intelligence</h1>
              <p className="text-[var(--text-secondary)] text-[12px] max-w-lg mx-auto leading-relaxed font-medium">
                AI-driven reasoning across multi-discipline deliverables. Request dependency analysis, clash reports, or automated coordination logs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {['Structural clash analysis', 'Summarise site progress', 'Verify material compliance', 'Electrical routing status'].map(hint => (
                <button 
                  key={hint} 
                  onClick={() => handleSuggestionClick(hint)}
                  className="p-5 text-left bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl hover:border-[var(--accent-blue)] transition-all group shadow-sm hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-md relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 opacity-10 border-t border-r border-[var(--text-muted)] pointer-events-none"></div>
                  <div className="text-[7px] font-black text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] uppercase tracking-widest mb-2 transition-colors">SUGGESTION</div>
                  <div className="text-[12px] font-bold text-[var(--text-primary)] opacity-80 group-hover:opacity-100 transition-opacity">{hint}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full space-y-6 mt-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[var(--accent-blue)] text-white'
                      : 'bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl">
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>

    {/* INPUT BAR */}
    <div className="pb-10 pt-4 px-10 relative z-20">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-[var(--bg-base)] to-transparent pointer-events-none"></div>
        <form onSubmit={handleSubmit} className="relative bg-[var(--bg-panel)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-2.5 flex items-center shadow-2xl">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query technical project data..." 
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] disabled:opacity-50"
          />
          <div className="flex items-center gap-2 pr-1">
             <button 
               type="button"
               className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
               title="Attach file"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
             </button>
             <button 
               type="submit"
               disabled={isLoading || !query.trim()}
               className="bg-[var(--accent-blue)] p-3 rounded-xl text-white shadow-xl hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ChatView;