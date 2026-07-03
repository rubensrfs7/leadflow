import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function Chat({ onActionComplete }: { onActionComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Olá! Sou o LeadFlow AI. Como posso te ajudar com seus leads hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, chatHistory: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      onActionComplete(); // Refresh data in case AI changed something
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: '✗ Erro de conexão.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm dark:text-gray-100">LeadFlow AI</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Assistente CRM & CAPI</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none font-mono whitespace-pre-wrap'
            }`}>
              {m.role === 'ai' ? (
                <div className="markdown-body dark:text-gray-200">
                  <Markdown>{m.text}</Markdown>
                </div>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl rounded-bl-none px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Comando de texto..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white dark:placeholder-gray-400 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
