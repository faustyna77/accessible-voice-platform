'use client';
import { useState, useEffect } from 'react';
import VapiAssistant from '@/components/VapiAssistant';

interface Assistant {
  id: string;
  name: string;
  description?: string;
}

export default function StartupTest() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);

  
   const VAPI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await fetch('/api/vapi/assistants');
      const data = await res.json();
      
      if (data.success && data.assistants.length > 0) {
        setAssistants(data.assistants);
        setSelectedAssistant(data.assistants[0]);
      }
    } catch (err) {
      console.error('Błąd pobierania asystentów:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">🚀 Test uruchomieniowy systemu</h1>
          <p className="text-gray-400">
            Przetestuj działanie asystentów głosowych przed wdrożeniem
          </p>
        </div>

        {loading ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Ładowanie asystentów...</p>
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
            
                

            {/* Interfejs rozmowy */}
            {selectedAssistant ? (
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    🎤 Test rozmowy
                  </h3>
                  <p className="text-blue-100">
                    Testowanie asystenta: <strong>{selectedAssistant.name}</strong>
                  </p>
                  <p className="text-sm text-blue-200 mt-2">
                    Kliknij "Rozpocznij rozmowę" i zacznij mówić
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
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-300 text-lg">
                  Wybierz asystenta powyżej, aby rozpocząć test
                </p>
              </div>
            )}

            {/* Instrukcje testowania */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-blue-400">
                📋 Checklist testowania
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: 'Jakość rozpoznawania mowy',
                    desc: 'Sprawdź czy asystent dobrze rozumie polecenia'
                  },
                  {
                    title: 'Odpowiedzi asystenta',
                    desc: 'Czy odpowiedzi są logiczne i pomocne?'
                  },
                  {
                    title: 'Połączenie z endpointem',
                    desc: 'Czy komendy są przekazywane do API?'
                  },
                  {
                    title: 'Czas reakcji',
                    desc: 'Czy asystent odpowiada wystarczająco szybko?'
                  },
                  {
                    title: 'Obsługa błędów',
                    desc: 'Co się dzieje przy niezrozumianych komendach?'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-900 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-1 rounded"
                      id={`check-${i}`}
                    />
                    <label htmlFor={`check-${i}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold text-white mb-1">
                        {i + 1}. {item.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.desc}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Dostępnych asystentów</div>
                <div className="text-3xl font-bold text-blue-400">{assistants.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Aktualnie testowany</div>
                <div className="text-xl font-bold text-white truncate">
                  {selectedAssistant?.name || '-'}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Status systemu</div>
                <div className="text-2xl font-bold text-green-400">✓ Online</div>
              </div>
            </div>

            {/* Szybkie akcje */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex gap-3 flex-wrap">
                
                    <a
                      href="/admin/vapi"
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
                    >
                      🎛️ Zarządzanie Vapi
                    </a>
                
                    <a
                      href="/admin/database"
                      className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition"
                    >
                      🗄️ Baza danych
                    </a>
                
                    <a
                      href="/admin"
                      className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition"
                    >
                      ← Powrót do admina
                    </a>
                <button
                  onClick={fetchAssistants}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition"
                >
                  🔄 Odśwież listę
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}