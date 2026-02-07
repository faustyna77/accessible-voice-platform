'use client';
import { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface VapiAssistantProps {
  publicApiKey: string;
  assistantId: string;
}

export default function VapiAssistant({ publicApiKey, assistantId }: VapiAssistantProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<{user: string, assistant: string}>({
    user: '',
    assistant: ''
  });
  
  const vapiRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantTextRef = useRef<string>('');
  const lastUserTextRef = useRef<string>('');
  const assistantTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Funkcja sprawdzająca czy teksty są bardzo podobne (duplikaty)
  const areSimilar = (text1: string, text2: string): boolean => {
    const t1 = text1.trim().toLowerCase();
    const t2 = text2.trim().toLowerCase();
    
    // Jeśli teksty są identyczne
    if (t1 === t2) return true;
    
    // Jeśli jeden tekst zawiera się w drugim i różnica jest mała
    if (t1.includes(t2) || t2.includes(t1)) {
      const diff = Math.abs(t1.length - t2.length);
      return diff < 3; // maksymalnie 2 znaki różnicy
    }
    
    return false;
  };

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setMessages((prev) => {
      // Sprawdź czy ostatnia wiadomość tej samej roli jest podobna
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.role === role && areSimilar(lastMsg.text, trimmedText)) {
        // Jeśli nowy tekst jest dłuższy, zaktualizuj
        if (trimmedText.length > lastMsg.text.length) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMsg,
            text: trimmedText,
            timestamp: new Date()
          };
          return updated;
        }
        // W przeciwnym razie ignoruj
        return prev;
      }

      // Sprawdź czy którakolwiek z ostatnich 3 wiadomości tej samej roli jest podobna
      const recentSameRole = prev.filter(m => m.role === role).slice(-3);
      const isDuplicate = recentSameRole.some(m => areSimilar(m.text, trimmedText));
      
      if (isDuplicate) {
        return prev;
      }

      // Dodaj nową wiadomość
      return [
        ...prev,
        {
          id: `${role}-${Date.now()}-${Math.random()}`,
          role,
          text: trimmedText,
          timestamp: new Date(),
        }
      ];
    });
  };

  useEffect(() => {
    if (publicApiKey) {
      vapiRef.current = new Vapi(publicApiKey);

      vapiRef.current.on('call-start', () => {
        setIsCallActive(true);
        setIsConnecting(false);
        console.log('Rozmowa rozpoczęta');
      });

      vapiRef.current.on('call-end', () => {
        setIsCallActive(false);
        setIsConnecting(false);
        setLiveTranscript({ user: '', assistant: '' });
        
        // Wyczyść timeouty
        if (assistantTimeoutRef.current) clearTimeout(assistantTimeoutRef.current);
        if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
        
        console.log('Rozmowa zakończona');
      });

      vapiRef.current.on('message', (message: any) => {
        console.log('Message event:', message);

        if (message.type === 'transcript') {
          const role = message.role as 'user' | 'assistant';
          const text = (message.transcript || message.transcriptText || '').trim();
          
          if (!text) return;

          if (role === 'assistant') {
            // Aktualizuj live transcript
            setLiveTranscript(prev => ({ ...prev, assistant: text }));
            
            // Anuluj poprzedni timeout
            if (assistantTimeoutRef.current) {
              clearTimeout(assistantTimeoutRef.current);
            }
            
            // Ustaw nowy timeout - dodaj wiadomość po 1.5 sekundach ciszy
            assistantTimeoutRef.current = setTimeout(() => {
              if (text !== lastAssistantTextRef.current) {
                addMessage('assistant', text);
                lastAssistantTextRef.current = text;
              }
              setLiveTranscript(prev => ({ ...prev, assistant: '' }));
            }, 1500);
            
          } else if (role === 'user') {
            // Aktualizuj live transcript
            setLiveTranscript(prev => ({ ...prev, user: text }));
            
            // Anuluj poprzedni timeout
            if (userTimeoutRef.current) {
              clearTimeout(userTimeoutRef.current);
            }
            
            // Ustaw nowy timeout - dodaj wiadomość po 1.5 sekundach ciszy
            userTimeoutRef.current = setTimeout(() => {
              if (text !== lastUserTextRef.current) {
                addMessage('user', text);
                lastUserTextRef.current = text;
              }
              setLiveTranscript(prev => ({ ...prev, user: '' }));
            }, 1500);
          }
        }
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setIsConnecting(false);
        setIsCallActive(false);
      });
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (assistantTimeoutRef.current) clearTimeout(assistantTimeoutRef.current);
      if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
    };
  }, [publicApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

  const startCall = async () => {
    if (!vapiRef.current) return;
    
    try {
      setIsConnecting(true);
      setMessages([]);
      setLiveTranscript({ user: '', assistant: '' });
      lastAssistantTextRef.current = '';
      lastUserTextRef.current = '';
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error('Błąd rozpoczęcia rozmowy:', error);
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Przyciski kontrolne */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={startCall}
          disabled={isCallActive || isConnecting}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
            isCallActive || isConnecting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg'
          }`}
        >
          {isConnecting ? '🔄 Łączenie...' : '🎙️ Rozpocznij rozmowę'}
        </button>

        <button
          onClick={endCall}
          disabled={!isCallActive}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
            !isCallActive
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg'
          }`}
        >
          ⏹️ Zakończ rozmowę
        </button>
      </div>

      {/* Status połączenia */}
      {isCallActive && (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-900/30 border border-green-700 rounded-xl">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Połączono - mów teraz</span>
        </div>
      )}

      {/* Transkrypcja */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-indigo-400">📝 Transkrypcja:</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          
          {/* Finalne wiadomości */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">
                    {msg.role === 'user' ? '👤 Ty' : '🤖 Asystent'}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Live transcript - użytkownik mówi */}
          {liveTranscript.user && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-indigo-600/50 text-white border-2 border-indigo-400 border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">👤 Ty</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
                <p className="text-sm italic">{liveTranscript.user}</p>
              </div>
            </div>
          )}

          {/* Live transcript - asystent mówi */}
          {liveTranscript.assistant && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-700/50 text-gray-100 border-2 border-gray-500 border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">🤖 Asystent</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
                <p className="text-sm italic">{liveTranscript.assistant}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Placeholder */}
        {messages.length === 0 && !liveTranscript.user && !liveTranscript.assistant && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🎧</div>
            <p>Transkrypcja pojawi się tutaj po rozpoczęciu rozmowy</p>
          </div>
        )}
      </div>
    </div>
  );
}