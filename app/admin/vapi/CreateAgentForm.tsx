// ============================================
// CreateAgentForm.tsx
// Umieść w: /app/admin/vapi/CreateAgentForm.tsx
// ============================================

'use client';
import { useState } from 'react';

interface CreateAgentFormProps {
  onAgentCreated: () => void;
}

export default function CreateAgentForm({ onAgentCreated }: CreateAgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  
  const [newAgent, setNewAgent] = useState({
    name: '',
    model: 'gpt-4o-mini',
    firstMessage: '',
    systemPrompt: 'Jesteś pomocnym asystentem głosowym.',
    voiceProvider: 'vapi',
    voiceId: 'Elliot',
    transcriber: 'deepgram',
    transcriberLanguage: 'pl',
  });

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name) {
      showMessage('Podaj nazwę agenta!', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/vapi/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });

      const data = await res.json();

      if (data.success && data.assistant) {
        showMessage('Agent utworzony pomyślnie!');
        
        // Reset formularza
        setNewAgent({
          name: '',
          model: 'gpt-4o-mini',
          firstMessage: '',
          systemPrompt: 'Jesteś pomocnym asystentem głosowym.',
          voiceProvider: 'vapi',
          voiceId: 'Elliot',
          transcriber: 'deepgram',
          transcriberLanguage: 'pl',
        });
        
        // Callback do rodzica
        onAgentCreated();
      } else {
        showMessage('Błąd: ' + (data.error || 'Nieznany błąd'), 'error');
      }
    } catch (err: any) {
      showMessage('Błąd połączenia: ' + err.message, 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">➕ Utwórz nowego agenta</h2>
      
      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}
      
      <div className="space-y-6">
        {/* SEKCJA 1: Podstawowe informacje */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">📋 Podstawowe informacje</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nazwa agenta *</label>
              <input
                type="text"
                placeholder="np. Smart Home Assistant"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Model LLM</label>
              <select
                value={newAgent.model}
                onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (szybki, tani)</option>
                <option value="gpt-4o">GPT-4o (najlepszy)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (ekonomiczny)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                First Message (opcjonalne)
                <span className="text-xs ml-2">Pierwsza wiadomość od asystenta</span>
              </label>
              <input
                type="text"
                placeholder="np. Cześć! Jak mogę Ci pomóc?"
                value={newAgent.firstMessage}
                onChange={(e) => setNewAgent({ ...newAgent, firstMessage: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                System Prompt
                <span className="text-xs ml-2">Instrukcje dla asystenta</span>
              </label>
              <textarea
                rows={4}
                placeholder="Jesteś pomocnym asystentem głosowym..."
                value={newAgent.systemPrompt}
                onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SEKCJA 2: Voice Configuration */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-lg font-semibold mb-3 text-purple-400">🎤 Voice Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Voice Provider</label>
              <select
                value={newAgent.voiceProvider}
                onChange={(e) => setNewAgent({ 
                  ...newAgent, 
                  voiceProvider: e.target.value,
                  voiceId: e.target.value === 'vapi' ? 'Elliot' : 
                           e.target.value === '11labs' ? '21m00Tcm4TlvDq8ikWAM' : 'emma'
                })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="vapi">Vapi (Elliot, Kylie, etc.)</option>
                <option value="11labs">ElevenLabs (najlepsza jakość)</option>
                <option value="playht">PlayHT</option>
                <option value="rime-ai">Rime AI</option>
                <option value="deepgram">Deepgram Aura</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Voice</label>
              {newAgent.voiceProvider === 'vapi' && (
                <select
                  value={newAgent.voiceId}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <optgroup label="Angielskie">
                    <option value="Elliot">Elliot (mężczyzna)</option>
                    <option value="Kylie">Kylie (kobieta)</option>
                    <option value="Lily">Lily (kobieta)</option>
                    <option value="Harry">Harry (mężczyzna)</option>
                  </optgroup>
                </select>
              )}

              {newAgent.voiceProvider === '11labs' && (
                <select
                  value={newAgent.voiceId}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="21m00Tcm4TlvDq8ikWAM">Rachel (angielski)</option>
                  <option value="EXAVITQu4vr4xnSDxMaL">Bella (angielski)</option>
                  <option value="pNInz6obpgDQGcFmaJgB">Adam (angielski)</option>
                </select>
              )}

              {newAgent.voiceProvider === 'playht' && (
                <input
                  type="text"
                  placeholder="np. larry"
                  value={newAgent.voiceId}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}

              {newAgent.voiceProvider === 'rime-ai' && (
                <select
                  value={newAgent.voiceId}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="nova">Nova (kobieta)</option>
                  <option value="orion">Orion (mężczyzna)</option>
                </select>
              )}

              {newAgent.voiceProvider === 'deepgram' && (
                <select
                  value={newAgent.voiceId}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceId: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="asteria-en">Asteria (angielski)</option>
                  <option value="luna-en">Luna (angielski)</option>
                </select>
              )}
            </div>
          </div>

          {/* Podgląd wybranego głosu */}
          <div className="mt-3 p-3 bg-gray-900 rounded-lg text-xs text-gray-400">
            ℹ️ Wybrany głos: <span className="font-bold text-white">{newAgent.voiceId}</span> 
            {' '}({newAgent.voiceProvider})
          </div>
        </div>

        {/* SEKCJA 3: Transcriber Configuration */}
        <div className="pb-4">
          <h3 className="text-lg font-semibold mb-3 text-green-400">🎧 Transcriber Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Transcriber Provider</label>
              <select
                value={newAgent.transcriber}
                onChange={(e) => setNewAgent({ ...newAgent, transcriber: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="deepgram">Deepgram (najlepszy)</option>
                <option value="gladia">Gladia</option>
                <option value="talkscriber">Talkscriber</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Język rozpoznawania</label>
              <select
                value={newAgent.transcriberLanguage}
                onChange={(e) => setNewAgent({ ...newAgent, transcriberLanguage: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pl">Polski</option>
                <option value="en">Angielski</option>
                <option value="de">Niemiecki</option>
                <option value="fr">Francuski</option>
                <option value="es">Hiszpański</option>
                <option value="it">Włoski</option>
              </select>
            </div>
          </div>
        </div>

        {/* Przycisk */}
        <button
          onClick={handleCreateAgent}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? '⏳ Tworzenie...' : '✅ Utwórz agenta'}
        </button>

        <p className="text-xs text-gray-400 mt-2">
          💡 Po utworzeniu agenta możesz przypisać mu endpointy w zakładce "Przypisz do Agentów"
        </p>
      </div>
    </div>
  );
}

