'use client';

import React, { useState, useEffect } from 'react';

// @ts-ignore
import { RetellWebClient } from 'retell-client-js-sdk';

interface RetellAssistantProps {
  agentId: string;
}

interface TranscriptMessage {
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
}

const RetellAssistant: React.FC<RetellAssistantProps> = ({ agentId }) => {
  const [retellClient, setRetellClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = new RetellWebClient();
    setRetellClient(client);

    client.on('call_started', () => {
      console.log('Rozmowa rozpoczęta');
      setIsConnected(true);
      setIsLoading(false);
      setError(null);
    });

    client.on('call_ended', () => {
      console.log('Rozmowa zakończona');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsLoading(false);
    });

    client.on('agent_start_talking', () => {
      setIsSpeaking(true);
    });

    client.on('agent_stop_talking', () => {
      setIsSpeaking(false);
    });

    client.on('update', (update: any) => {
      console.log('Update:', update);
      if (update.transcript) {
        update.transcript.forEach((item: any) => {
          if (item.role && item.content) {
            setTranscript(prev => {
              const exists = prev.some(
                msg => msg.text === item.content && msg.role === item.role
              );
              if (!exists) {
                return [...prev, {
                  role: item.role,
                  text: item.content,
                  timestamp: new Date()
                }];
              }
              return prev;
            });
          }
        });
      }
    });

    client.on('error', (error: any) => {
      console.error('Błąd Retell:', error);
      setError('Wystąpił błąd podczas połączenia');
      setIsLoading(false);
      setIsConnected(false);
    });

    return () => {
      // Kompatybilność z różnymi wersjami
      if (client) {
        try {
          // @ts-ignore - nowa wersja
          if (typeof client.stopCall === 'function') {
            client.stopCall();
          }
          // @ts-ignore - stara wersja
          else if (typeof client.stopConversation === 'function') {
            client.stopConversation();
          }
        } catch (e) {
          console.error('Błąd podczas zatrzymywania połączenia:', e);
        }
      }
    };
  }, []);

  const startCall = async () => {
    if (retellClient && !isConnected && !isLoading) {
      try {
        setIsLoading(true);
        setError(null);
        setTranscript([]);

        console.log('Rejestrowanie połączenia...');
        const registerResponse = await fetch('/api/retell/register-call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agentId,
          }),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.error || 'Nie udało się zarejestrować połączenia');
        }

        const { accessToken } = await registerResponse.json();
        console.log('Otrzymano accessToken, rozpoczynam rozmowę...');

        // @ts-ignore
        await retellClient.startCall({
          accessToken: accessToken,
          sampleRate: 24000,
          emitRawAudioSamples: false,
        });

      } catch (err: any) {
        console.error('Błąd podczas rozpoczynania rozmowy:', err);
        setError(err.message || 'Nie udało się rozpocząć rozmowy');
        setIsLoading(false);
      }
    }
  };

  const endCall = () => {
    if (retellClient && isConnected) {
      try {
        // @ts-ignore - nowa wersja
        if (typeof retellClient.stopCall === 'function') {
          retellClient.stopCall();
        }
        // @ts-ignore - stara wersja
        else if (typeof retellClient.stopConversation === 'function') {
          retellClient.stopConversation();
        }
      } catch (e) {
        console.error('Błąd podczas kończenia połączenia:', e);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Asystent Głosowy AI (Retell) 🤖
        </h2>
        <p className="text-gray-600">
          Kliknij przycisk poniżej, aby rozpocząć rozmowę z asystentem
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Błąd:</strong> {error}
        </div>
      )}

      <div className="text-center mb-6">
        {!isConnected ? (
          <button
            onClick={startCall}
            disabled={isLoading}
            className={`px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Łączenie...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🎤 Rozpocznij rozmowę
              </span>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isSpeaking ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <span className="font-medium">
                  {isSpeaking ? 'Asystent mówi...' : 'Słucham...'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={endCall}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Zakończ rozmowę
              </button>
              <button
                onClick={clearTranscript}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Wyczyść transkrypcję
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Transkrypcja rozmowy
        </h3>
        
        {transcript.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            Transkrypcja rozmowy pojawi się tutaj...
          </p>
        ) : (
          <div className="space-y-3">
            {transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <div className="text-sm font-medium mb-1">
                    {msg.role === 'user' ? 'Ty' : 'Asystent'}
                  </div>
                  <div className="text-sm">{msg.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          {isConnected ? 'Połączono' : 'Rozłączono'}
        </div>
      </div>
    </div>
  );
};

export default RetellAssistant;