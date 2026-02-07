'use client';
import { useState, useEffect } from 'react';

interface Assistant {
  id: string;
  name: string;
  firstMessage?: string;
  model?: {
    model?: string;
    messages?: any[];
  };
  voice?: {
    provider?: string;
    voiceId?: string;
  };
  transcriber?: {
    provider?: string;
    language?: string;
  };
}

interface EditAgentModalProps {
  assistant: Assistant;
  onClose: () => void;
  onSave: () => void;
}

export default function EditAgentModal({ assistant, onClose, onSave }: EditAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  
  const [editData, setEditData] = useState({
    name: assistant.name || '',
    model: assistant.model?.model || 'gpt-4o-mini',
    firstMessage: assistant.firstMessage || '',
    systemPrompt: assistant.model?.messages?.find((m: any) => m.role === 'system')?.content || '',
    voiceProvider: assistant.voice?.provider || 'vapi',
    voiceId: assistant.voice?.voiceId || 'elliot',
    transcriber: assistant.transcriber?.provider || 'deepgram',
    transcriberLanguage: assistant.transcriber?.language || 'pl',
  });

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!editData.name) {
      showMessage('Podaj nazwę agenta!', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const messages: any[] = [];
      
      if (editData.systemPrompt) {
        messages.push({
          role: 'system',
          content: editData.systemPrompt
        });
      }

      const updatePayload: any = {
        name: editData.name,
        firstMessage: editData.firstMessage || undefined,
        model: {
          provider: 'openai',
          model: editData.model,
          messages: messages.length > 0 ? messages : undefined
        },
        voice: {
          provider: editData.voiceProvider,
          voiceId: editData.voiceId
        },
        transcriber: {
          provider: editData.transcriber,
          model: editData.transcriber === 'deepgram' ? 'nova-2' : undefined,
          language: editData.transcriberLanguage
        }
      };

      const res = await fetch(`/api/vapi/assistants/${assistant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (data.success) {
        showMessage('Agent zaktualizowany pomyślnie!');
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        showMessage('Błąd: ' + data.error, 'error');
      }
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">✏️ Edytuj agenta: {assistant.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
              {message.text}
            </div>
          )}

          {/* Podstawowe informacje */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">📋 Podstawowe informacje</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nazwa agenta *</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Model LLM</label>
                <select
                  value={editData.model}
                  onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">First Message (opcjonalne)</label>
                <input
                  type="text"
                  value={editData.firstMessage}
                  onChange={(e) => setEditData({ ...editData, firstMessage: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">System Prompt</label>
                <textarea
                  rows={6}
                  value={editData.systemPrompt}
                  onChange={(e) => setEditData({ ...editData, systemPrompt: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Voice Configuration */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">🎤 Voice Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Voice Provider</label>
                <select
                  value={editData.voiceProvider}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    voiceProvider: e.target.value,
                    voiceId: e.target.value === 'vapi' ? 'elliot' : '21m00Tcm4TlvDq8ikWAM'
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="vapi">Vapi</option>
                  <option value="11labs">ElevenLabs</option>
                  <option value="playht">PlayHT</option>
                  <option value="rime-ai">Rime AI</option>
                  <option value="deepgram">Deepgram</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Voice ID</label>
                {editData.voiceProvider === 'vapi' ? (
                  <select
                    value={editData.voiceId}
                    onChange={(e) => setEditData({ ...editData, voiceId: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Elliot">Elliot</option>
                    <option value="Kylie">Kylie</option>
                    <option value="Lily">Lily</option>
                    <option value="Harry">Harry</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editData.voiceId}
                    onChange={(e) => setEditData({ ...editData, voiceId: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Transcriber Configuration */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold mb-3 text-green-400">🎧 Transcriber Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Provider</label>
                <select
                  value={editData.transcriber}
                  onChange={(e) => setEditData({ ...editData, transcriber: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="deepgram">Deepgram</option>
                  <option value="gladia">Gladia</option>
                  <option value="talkscriber">Talkscriber</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Język</label>
                <select
                  value={editData.transcriberLanguage}
                  onChange={(e) => setEditData({ ...editData, transcriberLanguage: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pl">Polski</option>
                  <option value="en">Angielski</option>
                  <option value="de">Niemiecki</option>
                  <option value="fr">Francuski</option>
                </select>
              </div>
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? '⏳ Zapisywanie...' : '✅ Zapisz zmiany'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              ❌ Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}