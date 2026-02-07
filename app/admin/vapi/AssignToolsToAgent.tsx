'use client';
import { useState, useEffect } from 'react';

interface Tool {
  id: string;
  name?: string;
  function: { name: string; description: string };
  server?: { url: string };
}

interface Assistant {
  id: string;
  name: string;
  model?: {
    toolIds?: string[];
    tools?: any[];
  };
}

interface AssignToolsProps {
  assistants: Assistant[];
  tools: Tool[];
  assignedTools: Record<string, string[]>;
  onAssignTools: (assistantId: string, toolIds: string[]) => Promise<void>;
}

export default function AssignToolsToAgent({ 
  assistants, 
  tools, 
  assignedTools,
  onAssignTools 
}: AssignToolsProps) {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  // ✅ Debug: Log otrzymanych props
  useEffect(() => {
    console.log('📊 AssignToolsToAgent received props:', {
      assistantsCount: assistants.length,
      toolsCount: tools.length,
      assignedTools
    });
  }, [assistants, tools, assignedTools]);

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ✅ Funkcja pomocnicza do liczenia przypisanych tools
  // WAŻNE: Liczy tool IDs, nie nazwy!
  const getAssignedCount = (assistantId: string): number => {
    const toolIds = assignedTools[assistantId] || [];
    const count = toolIds.length;
    console.log(`📊 Assistant ${assistantId} has ${count} tools assigned:`, toolIds);
    return count;
  };

  // ✅ Sprawdź czy tool jest przypisany
  // WAŻNE: Porównuje z tool.id (nie z nazwą!)
  const isToolAssigned = (assistantId: string, toolId: string): boolean => {
    const toolIds = assignedTools[assistantId] || [];
    const assigned = toolIds.includes(toolId);
    console.log(`🔍 Check if tool ${toolId} assigned to ${assistantId}:`, assigned, 'Current IDs:', toolIds);
    return assigned;
  };

  const toggleToolAssignment = async (assistantId: string, toolId: string) => {
    setLoading(true);
    try {
      const current = assignedTools[assistantId] || [];
      
      // Toggle: dodaj lub usuń tool ID
      const updated = current.includes(toolId)
        ? current.filter(id => id !== toolId)
        : [...current, toolId];
      
      console.log(`📤 Toggle tool: ${toolId}`);
      console.log(`📋 Current toolIds:`, current);
      console.log(`📋 Updated toolIds:`, updated);
      
      // Wywołaj callback z rodzica
      await onAssignTools(assistantId, updated);
      
      showMessage(`Zaktualizowano! Przypisano ${updated.length} endpointów.`);
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Komunikat */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Wybór agenta */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">🤖 Wybierz agenta AI</h2>
        {assistants.length === 0 ? (
          <p className="text-gray-400">Brak asystentów w Vapi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assistants.map((assistant) => {
              const assignedCount = getAssignedCount(assistant.id);
              
              return (
                <button 
                  key={assistant.id} 
                  onClick={() => setSelectedAssistant(assistant)}
                  className={`p-4 rounded-lg text-left transition ${
                    selectedAssistant?.id === assistant.id
                      ? 'bg-blue-600 ring-2 ring-blue-400' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{assistant.name || 'Bez nazwy'}</div>
                  <div className="text-sm text-gray-300 truncate">ID: {assistant.id}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Przypisane: <span className="font-bold text-white">{assignedCount}</span> endpointów
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista endpointów do przypisania */}
      {selectedAssistant && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">
            📍 Przypisz endpointy do: <span className="text-blue-400">{selectedAssistant.name}</span>
          </h2>
          
          {/* Debug info */}
          <div className="mb-4 p-3 bg-gray-900 rounded text-xs">
            <div className="text-gray-400 mb-2">🐛 Debug Info:</div>
            <div className="text-green-400">
              Przypisane tool IDs ({(assignedTools[selectedAssistant.id] || []).length}): 
            </div>
            <div className="text-gray-300 font-mono text-xs mt-1">
              {JSON.stringify(assignedTools[selectedAssistant.id] || [], null, 2)}
            </div>
          </div>
          
          {tools.length === 0 ? (
            <p className="text-gray-400">Brak endpointów. Najpierw dodaj w zakładce "Endpointy".</p>
          ) : (
            <div className="space-y-2">
              {tools.map((tool) => {
                const isAssigned = isToolAssigned(selectedAssistant.id, tool.id);
                
                return (
                  <label 
                    key={tool.id}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
                      isAssigned 
                        ? 'bg-green-900/50 border border-green-500' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isAssigned}
                      onChange={() => toggleToolAssignment(selectedAssistant.id, tool.id)}
                      disabled={loading}
                      className="w-5 h-5 rounded" 
                    />
                    <div className="flex-1">
                      <div className="font-medium">{tool.function?.name}</div>
                      <div className="text-sm text-gray-400">{tool.function?.description}</div>
                      <div className="text-xs text-blue-400 mt-1">{tool.server?.url}</div>
                      <div className="text-xs text-gray-500 mt-1">Tool ID: {tool.id}</div>
                    </div>
                    {isAssigned && <span className="text-green-400 font-bold">✓ Przypisany</span>}
                  </label>
                );
              })}
            </div>
          )}

          {/* Podsumowanie */}
          {tools.length > 0 && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-300">
                ℹ️ Zaznacz/odznacz endpointy aby je przypisać lub usunąć z agenta.
                Zmiany są zapisywane automatycznie.
              </p>
              <p className="text-xs text-green-400 mt-2">
                ✅ Aktualnie przypisane: <span className="font-bold">
                  {getAssignedCount(selectedAssistant.id)}
                </span> z {tools.length} endpointów
              </p>
              
              {/* Lista przypisanych tools */}
              {getAssignedCount(selectedAssistant.id) > 0 && (
                <div className="mt-3 p-3 bg-gray-800 rounded">
                  <div className="text-xs font-bold text-gray-300 mb-2">Przypisane narzędzia:</div>
                  <div className="space-y-1">
                    {tools
                      .filter(tool => isToolAssigned(selectedAssistant.id, tool.id))
                      .map(tool => (
                        <div key={tool.id} className="text-xs text-gray-400">
                          • {tool.function.name} <span className="text-gray-600">({tool.id})</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}