'use client';

import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiAssistantProps {
  publicApiKey: string;
  assistantId: string;
}

interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const VapiAssistant: React.FC<VapiAssistantProps> = ({ 
  publicApiKey, 
  assistantId 
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapiInstance = new Vapi(publicApiKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Rozmowa rozpoczęta');
      setIsConnected(true);
      setIsLoading(false);
      setError(null);
    });

    vapiInstance.on('call-end', () => {
      console.log('Rozmowa zakończona');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsLoading(false);
    });

    vapiInstance.on('speech-start', () => {
      console.log('Asystent rozpoczął mówienie');
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      console.log('Asystent zakończył mówienie');
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message) => {
      console.log('Otrzymano wiadomość:', message);
      
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript,
          timestamp: new Date()
        }]);
      }

      // Obsługa wywołań funkcji (toolsy)
      if (message.type === 'function-call') {
        console.log('Wywołanie funkcji:', message.functionCall);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('Błąd Vapi:', error);
      setError('Wystąpił błąd podczas połączenia');
      setIsLoading(false);
      setIsConnected(false);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [publicApiKey]);

  const startCall = async () => {
    if (vapi && !isConnected && !isLoading) {
      try {
        setIsLoading(true);
        setError(null);
        setTranscript([]);
        await vapi.start(assistantId);
      } catch (err) {
        console.error('Błąd podczas rozpoczynania rozmowy:', err);
        setError('Nie udało się rozpocząć rozmowy');
        setIsLoading(false);
      }
    }
  };

  const endCall = () => {
    if (vapi && isConnected) {
      vapi.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Asystent Głosowy AI 
        </h2>
        <p className="text-gray-600">
          Kliknij przycisk poniżej, aby rozpocząć rozmowę z asystentem
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
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

      {/* Transkrypcja rozmowy */}
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

      {/* Status połączenia */}
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

export default VapiAssistant;