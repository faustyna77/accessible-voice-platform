'use client';
import { useState, useEffect } from 'react';
import VapiAssistant from '@/components/VapiAssistant';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Assistant {
  id: string;
  name: string;
  description?: string;
}

export default function VoiceAssistantPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);

  const VAPI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';

  // Pobierz listę asystentów przy załadowaniu strony
  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await fetch('/api/vapi/assistants');
      const data = await res.json();
      
      if (data.success && data.assistants.length > 0) {
        setAssistants(data.assistants);
        // Automatycznie wybierz pierwszego asystenta
        setSelectedAssistant(data.assistants[0]);
      }
    } catch (err) {
      console.error('Błąd pobierania asystentów:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-12 px-4 flex flex-col items-center justify-center overflow-hidden">
        
        <div className="relative z-10 container mx-auto max-w-5xl space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500 drop-shadow-md mb-2">
              🎤 Asystent Głosowy AI
            </h1>
            <p className="text-gray-400 text-lg">
              Komunikuj się głosowo ze swoimi urządzeniami – naturalnie i intuicyjnie
            </p>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-400">Ładowanie asystentów...</p>
            </div>
          ) : (
            <>
              {/* Wybór asystenta */}
              <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  👤 Wybierz asystenta:
                </h2>
                
                {assistants.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Brak dostępnych asystentów. Dodaj asystenta w panelu admina.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assistants.map((assistant) => (
                      <button
                        key={assistant.id}
                        onClick={() => setSelectedAssistant(assistant)}
                        className={`p-4 rounded-xl text-left transition-all transform hover:scale-105 ${
                          selectedAssistant?.id === assistant.id
                            ? 'bg-indigo-600 ring-4 ring-indigo-400/50 shadow-xl'
                            : 'bg-gray-800/60 hover:bg-gray-800 border border-gray-700'
                        }`}
                      >
                        <div className="text-white font-bold text-lg mb-1">
                          {assistant.name || 'Bez nazwy'}
                        </div>
                        <div className="text-gray-300 text-sm">
                          ID: {assistant.id.slice(0, 8)}...
                        </div>
                        {selectedAssistant?.id === assistant.id && (
                          <div className="mt-2 text-indigo-200 text-sm font-medium">
                            ✓ Wybrany
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Komponent VapiAssistant */}
              {selectedAssistant ? (
                <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
                    <h3 className="text-lg font-bold">
                      Rozmowa z: {selectedAssistant.name}
                    </h3>
                    <p className="text-sm text-indigo-100">
                      Kliknij "Rozpocznij rozmowę" aby zacząć
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <VapiAssistant
                      publicApiKey={VAPI_PUBLIC_API_KEY}
                      assistantId={selectedAssistant.id}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-gray-300 text-lg">
                    Wybierz asystenta powyżej, aby rozpocząć rozmowę
                  </p>
                </div>
              )}

              {/* Informacje */}
              <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3 text-indigo-400">💡 Jak to działa?</h3>
                <ol className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Wybierz asystenta odpowiedniego dla Twoich potrzeb</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Kliknij "Rozpocznij rozmowę" i zezwól na dostęp do mikrofonu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Mów naturalnie - asystent Cię zrozumie i wykona polecenia</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Oglądaj transkrypcję rozmowy w czasie rzeczywistym</span>
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}