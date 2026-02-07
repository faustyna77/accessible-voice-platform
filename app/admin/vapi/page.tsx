'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import EndpointsManager from './EndpointsManager';
import AssignToolsToAgent from './AssignToolsToAgent';
import CreateAgentForm from './CreateAgentForm';
import EditAgentModal from './EditAgentModal';
import Database from './Database';

interface Tool {
  id: string;
  function: { name: string; description: string };
  url?: string;
  method?: string;
  body?: any;
  headers?: any;
  server?: { url: string; method?: string };
}

interface Assistant {
  id: string;
  name: string;
  model?: { 
    tools?: any[];
    messages?: any[];
    toolIds?: string[];
  };
  toolIds?: string[];
}

export default function VapiAdminPanel() {

  const [allowed, setAllowed] = useState(false);
 
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [assignedTools, setAssignedTools] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
 
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const router = useRouter();
   const [editingAgent, setEditingAgent] = useState<Assistant | null>(null);
  // Sprawdź uprawnienia admina
  const [activeTab, setActiveTab] = useState<'endpoints' | 'assign' | 'prompt' | 'agents' | 'database'>('endpoints');
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) { router.push('/login'); return; }
      const token = await user.getIdTokenResult();
      if (token.claims.admin) { setAllowed(true); }
      else { router.push('/dashboard'); }
    };
    checkAdmin();
  }, [router]);

  // Pobierz dane z Vapi przy starcie
  useEffect(() => {
    if (allowed) {
      loadData();
    }
  }, [allowed]);

  const loadData = async () => {
    try {
      console.log('🔄 Starting loadData...');
      
      // 1. Najpierw pobierz wszystkie tools
      const toolsRes = await fetch('/api/vapi/tools');
      const toolsData = await toolsRes.json();
      let allTools: Tool[] = [];
      
      if (toolsData.success) {
        allTools = toolsData.tools;
        setTools(allTools);
        console.log('📋 All tools loaded:', allTools.length);
      }

      // 2. Potem pobierz asystentów
      const assistantsRes = await fetch('/api/vapi/assistants');
      const assistantsData = await assistantsRes.json();
      
      if (assistantsData.success) {
        const rawAssistants = assistantsData.assistants;
        setAssistants(rawAssistants);
        
        // 3. Mapuj toolIds dla każdego asystenta
        const assigned: Record<string, string[]> = {};
        
        for (const assistant of rawAssistants) {
          let toolIds: string[] = [];
          
          if (assistant.toolIds && Array.isArray(assistant.toolIds)) {
            toolIds = assistant.toolIds;
          } else if (assistant.model?.toolIds && Array.isArray(assistant.model.toolIds)) {
            toolIds = assistant.model.toolIds;
          } else if (assistant.model?.tools && Array.isArray(assistant.model.tools)) {
            toolIds = assistant.model.tools
              .map((t: any) => t.id || t.function?.name)
              .filter(Boolean);
          }
          
          assigned[assistant.id] = toolIds;
        }
        
        setAssignedTools(assigned);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showMessage('Błąd ładowania danych', 'error');
    }
  };

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAssignTools = async (assistantId: string, toolIds: string[]) => {
    console.log('🔄 Assigning tools to', assistantId, ':', toolIds);
    
    try {
      const res = await fetch(`/api/vapi/assistants/${assistantId}/tools`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolIds }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAssignedTools(prev => ({ 
          ...prev, 
          [assistantId]: data.toolIds || toolIds 
        }));
        
        showMessage(`Zaktualizowano! Przypisano ${toolIds.length} endpointów.`);
        setTimeout(() => loadData(), 500);
      } else {
        showMessage('Błąd: ' + (data.error || 'Nieznany błąd'), 'error');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      showMessage('Błąd połączenia: ' + err.message, 'error');
    }
  };

  const handleDeleteAgent = async (assistantId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego agenta? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      const res = await fetch(`/api/vapi/assistants/${assistantId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setAssistants(assistants.filter(a => a.id !== assistantId));
        if (selectedAssistant?.id === assistantId) {
          setSelectedAssistant(null);
        }
        showMessage('Agent usunięty!');
      } else {
        showMessage('Błąd: ' + (data.error || 'Nieznany błąd'), 'error');
      }
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
  };

  if (!allowed) return <p className="text-white p-8">Ładowanie...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header z nawigacją */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
              ← Powrót do panelu admina
            </Link>
            <h1 className="text-3xl font-bold">🎛️ Panel Zarządzania Vapi</h1>
            <p className="text-gray-400">Zarządzaj endpointami i przypisuj je do agentów AI</p>
          </div>
          <button onClick={() => loadData()} 
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
            🔄 Odśwież
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('endpoints')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'endpoints' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            📍 Endpointy ({tools.length})
          </button>
          <button onClick={() => setActiveTab('assign')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'assign' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            🤖 Przypisz do Agentów ({assistants.length})
          </button>
          <button onClick={() => setActiveTab('prompt')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'prompt' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            💬 System Prompt
          </button>
          <button onClick={() => setActiveTab('agents')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'agents' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            👥 Zarządzaj Agentami ({assistants.length})
          </button>
        </div>

        {/* Tab: Endpointy */}
        {activeTab === 'endpoints' && (
          <EndpointsManager 
            tools={tools}
            onToolsChange={setTools}
          />
        )}

        {/* Tab: Przypisz do Agentów */}
        {activeTab === 'assign' && (
          <AssignToolsToAgent
            assistants={assistants}
            tools={tools}
            assignedTools={assignedTools}
            onAssignTools={handleAssignTools}
          />
        )}
                      
        {/* Tab: System Prompt */}
        {activeTab === 'prompt' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">🤖 Wybierz asystenta do edycji</h2>
              {assistants.length === 0 ? (
                <p className="text-gray-400">Brak asystentów w Vapi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistants.map((assistant) => (
                    <button key={assistant.id} onClick={() => setSelectedAssistant(assistant)}
                      className={`p-4 rounded-lg text-left transition ${
                        selectedAssistant?.id === assistant.id
                          ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      <div className="font-medium">{assistant.name || 'Bez nazwy'}</div>
                      <div className="text-sm text-gray-300 truncate">ID: {assistant.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedAssistant && <SystemPromptEditor assistant={selectedAssistant} onSave={loadData} />}
          </div>
        )}

        {/* Tab: Zarządzanie Agentami */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            {/* Formularz tworzenia nowego agenta */}
            <CreateAgentForm onAgentCreated={loadData} />

            {/* Lista istniejących agentów */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">👥 Istniejący agenci ({assistants.length})</h2>
              {assistants.length === 0 ? (
                <p className="text-gray-400">Brak agentów. Utwórz pierwszego powyżej.</p>
              ) : (
                <div className="space-y-3">
                  {assistants.map((assistant) => (
                    <div key={assistant.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-xl text-white mb-1">
                            {assistant.name || 'Bez nazwy'}
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>ID: <span className="font-mono text-xs">{assistant.id}</span></div>
                            <div>
                              Przypisane endpointy: <span className="font-bold text-white">
                                {(assignedTools[assistant.id] || []).length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
  <button
  
    onClick={() => setEditingAgent(assistant)}
    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
  >
    ✏️ Edytuj
  </button>
  <button
    onClick={() => handleDeleteAgent(assistant.id)}
    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
  >
    🗑️ Usuń
  </button>
</div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold mb-2">⚠️ Ważne informacje</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Po utworzeniu agenta możesz przypisać mu endpointy w zakładce "Przypisz do Agentów"</li>
                <li>• Edytuj System Prompt w zakładce "System Prompt" aby spersonalizować agenta</li>
                <li>• Usunięcie agenta jest trwałe i nie można go cofnąć</li>
                <li>• Użytkownicy będą mogli wybrać tego agenta na stronie głosowej</li>
              </ul>
            </div>
          </div>
        )}
      </div>
       {/* ✅ MODAL EDYCJI - DODAJ TO TUTAJ! */}
      {editingAgent && (
        <EditAgentModal
          assistant={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={() => {
            loadData();
            setEditingAgent(null);
          }}
        />
      )}
   
    </div>
   
  );
}
 
// Komponent edycji System Prompt
function SystemPromptEditor({ assistant, onSave }: { assistant: Assistant; onSave: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    const currentPrompt = assistant.model?.messages?.find((m: any) => m.role === 'system')?.content || '';
    setPrompt(currentPrompt);
  }, [assistant]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vapi/assistants/${assistant.id}/prompt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage({ text: 'System Prompt zaktualizowany!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
        onSave();
      } else {
        setMessage({ text: 'Błąd: ' + data.error, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Błąd: ' + err.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">
        💬 Edytuj System Prompt: <span className="text-blue-400">{assistant.name}</span>
      </h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          Instrukcje dla asystenta (System Prompt)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={15}
          placeholder="Przykład:&#10;&#10;Jesteś asystentem pomagającym osobom starszym w obsłudze urządzeń domowych.&#10;&#10;Użytkownicy:&#10;- Janina (82 lata) - ma problemy ze słuchem&#10;- Stanisław (85 lat) - porusza się na wózku&#10;&#10;Dostosuj swoje odpowiedzi do potrzeb użytkownika."
          className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-2">
          💡 Tutaj możesz dodać informacje o użytkownikach, ich preferencjach i ograniczeniach
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? '⏳ Zapisywanie...' : '✅ Zapisz System Prompt'}
        </button>
        
        <button
          onClick={() => setPrompt('')}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition"
        >
          🗑️ Wyczyść
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-bold mb-2">📝 Szablon personalizacji:</h3>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
{`Obsługujesz urządzenia w mieszkaniu gdzie mieszkają:

- [Imię] ([wiek] lat) - [opis ograniczeń]
- [Imię] ([wiek] lat) - [opis ograniczeń]

Zasady:
1. Zawsze pytaj KTO mówi na początku rozmowy
2. Dostosuj odpowiedzi do możliwości danej osoby
3. Mów wyraźnie i w prostych zdaniach
4. Potwierdzaj każdą akcję przed wykonaniem`}
        </pre>
      </div>
    </div>
  );
}