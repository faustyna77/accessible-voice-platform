'use client';
import { useState } from 'react';

interface Tool {
  id: string;
  function: { name: string; description: string };
  url?: string;
  method?: string;
  server?: { url: string; method?: string };
}

interface EndpointsManagerProps {
  tools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
}

interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  responseTime?: string;
  data?: any;
  error?: string;
}

export default function EndpointsManager({ tools, onToolsChange }: EndpointsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [testResult, setTestResult] = useState<{ toolId: string; result: TestResult } | null>(null);
  const [testFormOpen, setTestFormOpen] = useState<string | null>(null);
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    description: '',
    url: '',
    method: 'POST',
    parameters: [{ name: '', type: 'string', description: '', required: false }],
    staticBody: '',
    headers: '',
  });

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Dodaj parametr
  const addParameter = () => {
    setNewEndpoint({
      ...newEndpoint,
      parameters: [...newEndpoint.parameters, { name: '', type: 'string', description: '', required: false }]
    });
  };

  // Usuń parametr
  const removeParameter = (index: number) => {
    setNewEndpoint({
      ...newEndpoint,
      parameters: newEndpoint.parameters.filter((_, i) => i !== index)
    });
  };

  // Zaktualizuj parametr
  const updateParameter = (index: number, field: string, value: any) => {
    const updated = [...newEndpoint.parameters];
    updated[index] = { ...updated[index], [field]: value };
    setNewEndpoint({ ...newEndpoint, parameters: updated });
  };

  // Dodaj nowy endpoint
  const handleAddEndpoint = async () => {
    if (!newEndpoint.name || !newEndpoint.url) {
      showMessage('Wypełnij nazwę i URL!', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Parsuj static body i headers jeśli są wypełnione
      let staticBodyObj = {};
      let headersObj = {};
      
      if (newEndpoint.staticBody.trim()) {
        try {
          staticBodyObj = JSON.parse(newEndpoint.staticBody);
        } catch (e) {
          showMessage('Static Body musi być poprawnym JSON!', 'error');
          setLoading(false);
          return;
        }
      }
      
      if (newEndpoint.headers.trim()) {
        try {
          headersObj = JSON.parse(newEndpoint.headers);
        } catch (e) {
          showMessage('Headers muszą być poprawnym JSON!', 'error');
          setLoading(false);
          return;
        }
      }

      // Buduj properties dla function parameters z dodanych parametrów
      const properties: any = {};
      const required: string[] = [];
      
      newEndpoint.parameters.forEach(param => {
        if (param.name.trim()) {
          properties[param.name.trim()] = {
            type: param.type,
            description: param.description || `Parameter ${param.name}`
          };
          if (param.required) {
            required.push(param.name.trim());
          }
        }
      });
      
      const res = await fetch('/api/vapi/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEndpoint.name,
          description: newEndpoint.description,
          url: newEndpoint.url,
          method: newEndpoint.method,
          parameters: { properties, required },
          staticBody: staticBodyObj,
          headers: headersObj,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.tool) {
        onToolsChange([...tools, data.tool]);
        setNewEndpoint({ 
          name: '', 
          description: '', 
          url: '', 
          method: 'POST', 
          parameters: [{ name: '', type: 'string', description: '', required: false }],
          staticBody: '', 
          headers: '' 
        });
        showMessage('Endpoint dodany pomyślnie!');
      } else {
        showMessage('Błąd: ' + (data.error || 'Nieznany błąd'), 'error');
      }
    } catch (err: any) {
      showMessage('Błąd połączenia: ' + err.message, 'error');
    }
    setLoading(false);
  };

  // Usuń endpoint
  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten endpoint?')) return;
    
    try {
      const res = await fetch(`/api/vapi/tools/${toolId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        onToolsChange(tools.filter(t => t.id !== toolId));
        showMessage('Endpoint usunięty!');
        if (testResult?.toolId === toolId) {
          setTestResult(null);
        }
      } else {
        showMessage('Błąd: ' + (data.error || 'Nieznany błąd'), 'error');
      }
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
  };

  // Testuj endpoint
  const handleTestEndpoint = async (tool: Tool) => {
    setLoading(true);
    setTestResult(null);
    showMessage('Testuję endpoint...', 'success');
    
    try {
      // Pobierz pełne dane toola z Vapi
      console.log('🔍 Pobieram pełne dane toola:', tool.id);
      const toolDetailRes = await fetch(`/api/vapi/tools/${tool.id}`);
      const toolDetailData = await toolDetailRes.json();
      
      const fullTool = toolDetailData.success ? toolDetailData.tool : tool;
      
      const url = fullTool.url || fullTool.server?.url || tool.url || tool.server?.url;
      const method = fullTool.method || fullTool.server?.method || tool.method || 'POST';
      const headers = fullTool.headers || {};
      
      // Użyj wartości testowych jeśli są dostępne
      let body = {};
      if (testValues[tool.id]) {
        try {
          body = JSON.parse(testValues[tool.id]);
        } catch (e) {
          showMessage('Błąd parsowania JSON testowych wartości!', 'error');
          setLoading(false);
          return;
        }
      }
      
      console.log('🎯 Dane do testu:', { url, method, body, headers });
      
      const res = await fetch('/api/vapi/tools/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method, body, headers }),
      });
      
      const data = await res.json();
      
      setTestResult({ toolId: tool.id, result: data });
      setTestFormOpen(null); // Zamknij formularz testowy po teście
      
      if (data.success) {
        showMessage(`✅ Test OK! Status: ${data.status} | Czas: ${data.responseTime}`, 'success');
      } else {
        showMessage(`❌ Test failed: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showMessage(`❌ Błąd testu: ${err.message}`, 'error');
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

      {/* Formularz dodawania */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">➕ Dodaj nowy endpoint</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nazwa funkcji *</label>
            <input 
              type="text" 
              placeholder="np. robot1_forward"
              value={newEndpoint.name}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Metoda HTTP *</label>
            <select 
              value={newEndpoint.method}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, method: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">URL endpointu *</label>
            <input 
              type="text" 
              placeholder="https://your-api.com/robot-1/forward"
              value={newEndpoint.url}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Opis (dla AI)</label>
            <input 
              type="text" 
              placeholder="np. Przesuń robota 1 do przodu"
              value={newEndpoint.description}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {/* Dynamiczne parametry które AI może przekazać */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Parametry Request Body (dynamiczne)</label>
              <button 
                type="button"
                onClick={addParameter}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              >
                + Dodaj parametr
              </button>
            </div>
            <div className="space-y-2">
              {newEndpoint.parameters.map((param, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3 grid grid-cols-12 gap-2">
                  <input 
                    type="text" 
                    placeholder="Nazwa (np. angle)"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value)}
                    className="col-span-3 bg-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <select 
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="col-span-2 bg-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Opis (np. Kąt obrotu 0-180)"
                    value={param.description}
                    onChange={(e) => updateParameter(index, 'description', e.target.value)}
                    className="col-span-5 bg-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <label className="col-span-1 flex items-center justify-center gap-1 text-xs">
                    <input 
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    Required
                  </label>
                  <button 
                    type="button"
                    onClick={() => removeParameter(index)}
                    className="col-span-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 AI będzie mogło przekazać te parametry podczas wywołania endpointu. Np. dla "angle" AI powie "ustaw na 90" i wyśle {`{"angle": 90}`}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Static Request Body (JSON, opcjonalne)</label>
            <textarea 
              placeholder='{"token": "abc123", "device_id": "robot1"}'
              value={newEndpoint.staticBody}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, staticBody: e.target.value })}
              rows={3}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <p className="text-xs text-gray-500 mt-1">💡 Stałe wartości które będą zawsze wysyłane (np. tokeny, ID urządzenia)</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Headers (JSON, opcjonalne)</label>
            <textarea 
              placeholder='{"Authorization": "Bearer token123", "X-Custom-Header": "value"}'
              value={newEndpoint.headers}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, headers: e.target.value })}
              rows={3}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <p className="text-xs text-gray-500 mt-1">💡 Dodaj niestandardowe nagłówki HTTP</p>
          </div>
        </div>
        
        <button 
          onClick={handleAddEndpoint} 
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? '⏳ Dodawanie...' : '✅ Dodaj endpoint'}
        </button>
      </div>

      {/* Wynik testu - ulepszone UI */}
      {testResult && (
        <div className={`bg-gray-800 rounded-xl p-6 border-2 ${
          testResult.result.success ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {testResult.result.success ? '✅' : '❌'} Wynik testu endpointu
            </h3>
            <button 
              onClick={() => setTestResult(null)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Status HTTP</div>
                <div className={`text-lg font-bold ${
                  testResult.result.status && testResult.result.status >= 200 && testResult.result.status < 300
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {testResult.result.status || 'N/A'} {testResult.result.statusText || ''}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Czas odpowiedzi</div>
                <div className="text-lg font-bold text-blue-400">
                  {testResult.result.responseTime || 'N/A'}
                </div>
              </div>
            </div>

            {testResult.result.error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <div className="text-xs text-red-400 mb-1 font-bold">Błąd</div>
                <div className="text-sm text-white">{testResult.result.error}</div>
              </div>
            )}

            {testResult.result.data && (
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2 font-bold">Odpowiedź serwera</div>
                <pre className="text-xs text-green-400 overflow-x-auto max-h-64 overflow-y-auto">
                  {typeof testResult.result.data === 'string' 
                    ? testResult.result.data 
                    : JSON.stringify(testResult.result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista endpointów */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">📋 Lista endpointów ({tools.length})</h2>
        {tools.length === 0 ? (
          <p className="text-gray-400">Brak endpointów. Dodaj pierwszy powyżej.</p>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => {
              const url = tool.url || tool.server?.url;
              const method = tool.method || tool.server?.method || 'POST';
              
              return (
                <div key={tool.id} className={`bg-gray-700 rounded-lg p-4 transition ${
                  testResult?.toolId === tool.id ? 'ring-2 ring-blue-500' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{tool.function?.name || tool.id}</div>
                      <div className="text-sm text-gray-400">{tool.function?.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded font-medium">{method}</span>
                        <span className="text-xs text-blue-400 truncate">{url}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => setTestFormOpen(testFormOpen === tool.id ? null : tool.id)}
                        disabled={!url || loading}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        🧪 Testuj
                      </button>
                      <button 
                        onClick={() => handleDeleteTool(tool.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Formularz testowy */}
                  {testFormOpen === tool.id && (
                    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-green-500">
                      <h4 className="text-sm font-bold mb-2 text-green-400">🧪 Testowe wartości Request Body (JSON)</h4>
                      <textarea
                        placeholder='{"angle": 90, "speed": 100}'
                        value={testValues[tool.id] || ''}
                        onChange={(e) => setTestValues({ ...testValues, [tool.id]: e.target.value })}
                        rows={4}
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestEndpoint(tool)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {loading ? '⏳ Testuję...' : '▶️ Uruchom test'}
                        </button>
                        <button
                          onClick={() => setTestFormOpen(null)}
                          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
                        >
                          Anuluj
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        💡 Wpisz JSON z wartościami do przetestowania. Jeśli puste, wyśle pusty obiekt {`{}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}