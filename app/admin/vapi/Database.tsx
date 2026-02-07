// ============================================
// /app/admin/vapi/Database.tsx
// Widok drzewa JSON jak w Firebase Console
// ============================================

'use client';
import { useState, useEffect } from 'react';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { database } from '../../lib/firebase';

interface TreeNodeProps {
  data: any;
  path: string;
  level?: number;
  onEdit: (path: string, value: any) => void;
  onDelete: (path: string) => void;
  onAdd: (path: string, key: string, value: any) => void;
}

// Komponent pojedynczego węzła drzewa
function TreeNode({ data, path, level = 0, onEdit, onDelete, onAdd }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newValueType, setNewValueType] = useState<'string' | 'number' | 'boolean' | 'object' | 'array'>('string');

  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isPrimitive = !isObject && !isArray;

  const handleEdit = () => {
    setEditValue(JSON.stringify(data, null, 2));
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editValue);
      onEdit(path, parsed);
      setIsEditing(false);
    } catch (err) {
      alert('Nieprawidłowy JSON!');
    }
  };

  const handleAddField = () => {
    if (!newKey.trim()) {
      alert('Podaj nazwę klucza!');
      return;
    }

    try {
      let parsedValue: any;
      
      switch (newValueType) {
        case 'string':
          parsedValue = newValue;
          break;
        case 'number':
          parsedValue = parseFloat(newValue) || 0;
          break;
        case 'boolean':
          parsedValue = newValue.toLowerCase() === 'true';
          break;
        case 'object':
          parsedValue = newValue ? JSON.parse(newValue) : {};
          break;
        case 'array':
          parsedValue = newValue ? JSON.parse(newValue) : [];
          break;
      }

      onAdd(path, newKey, parsedValue);
      setIsAdding(false);
      setNewKey('');
      setNewValue('');
      setNewValueType('string');
    } catch (err) {
      alert('Błąd parsowania wartości!');
    }
  };

  const getValuePreview = (val: any): string => {
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val.toString();
    if (val === null) return 'null';
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (typeof val === 'object') return `{...}`;
    return '';
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="font-mono text-sm">
      <div className="flex items-center gap-2 py-1 hover:bg-gray-800 px-2 rounded group">
        {/* Expand/Collapse button */}
        {(isObject || isArray) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-white"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {isPrimitive && <span className="w-4"></span>}

        {/* Key name */}
        <span className="text-blue-400 font-semibold">
          {path.split('/').pop() || 'root'}:
        </span>

        {/* Value or preview */}
        {isPrimitive ? (
          isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="bg-gray-900 px-2 py-1 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span 
              className="text-green-400 cursor-pointer hover:bg-gray-700 px-1 rounded"
              onClick={handleEdit}
            >
              {getValuePreview(data)}
            </span>
          )
        ) : (
          <span className="text-gray-500">
            {isArray ? `[${data.length}]` : `{${Object.keys(data).length}}`}
          </span>
        )}

        {/* Action buttons */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex gap-1">
          {/* Przycisk dodawania dzieci dla obiektów/tablic */}
          {(isObject || isArray) && (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              title="Dodaj pole"
            >
              ➕
            </button>
          )}
          <button
            onClick={handleEdit}
            className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
            title="Edytuj"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              if (confirm(`Usunąć ${path}?`)) onDelete(path);
            }}
            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
            title="Usuń"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Formularz dodawania nowego pola */}
      {isAdding && (
        <div className="ml-4 mt-2 p-3 bg-gray-900 rounded-lg border border-green-500">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nazwa klucza:</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={isArray ? "indeks (np. 0)" : "nazwa_pola"}
                className="w-full bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Typ wartości:</label>
              <select
                value={newValueType}
                onChange={(e) => setNewValueType(e.target.value as any)}
                className="w-full bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object {'{}'}</option>
                <option value="array">Array []</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Wartość:</label>
              {newValueType === 'boolean' ? (
                <select
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : newValueType === 'object' || newValueType === 'array' ? (
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={newValueType === 'object' ? '{"key": "value"}' : '["item1", "item2"]'}
                  className="w-full bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-xs"
                  rows={3}
                />
              ) : (
                <input
                  type={newValueType === 'number' ? 'number' : 'text'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={newValueType === 'number' ? '123' : 'wartość'}
                  className="w-full bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddField}
                className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
              >
                ✓ Dodaj
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewKey('');
                  setNewValue('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
              >
                ✗ Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children */}
      {isExpanded && (isObject || isArray) && (
        <div>
          {Object.entries(data).map(([key, value]) => (
            <TreeNode
              key={key}
              data={value}
              path={`${path}/${key}`}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Główny komponent Database
export default function Database() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [filterPath, setFilterPath] = useState<string>('');

  useEffect(() => {
    const dbRef = ref(database, '/');

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setDbData(snapshot.val());
      } else {
        setDbData({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = async (path: string, value: any) => {
    try {
      const dbRef = ref(database, path);
      await set(dbRef, value);
      showMessage(`Zaktualizowano: ${path}`);
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
  };

  const handleDelete = async (path: string) => {
    try {
      const dbRef = ref(database, path);
      await remove(dbRef);
      showMessage(`Usunięto: ${path}`);
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
  };

  const handleAdd = async (parentPath: string, key: string, value: any) => {
    try {
      const newPath = `${parentPath}/${key}`;
      const dbRef = ref(database, newPath);
      await set(dbRef, value);
      showMessage(`Dodano: ${newPath}`);
    } catch (err: any) {
      showMessage('Błąd: ' + err.message, 'error');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(dbData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-export-${Date.now()}.json`;
    a.click();
    showMessage('Wyeksportowano bazę danych!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      if (confirm('Czy na pewno chcesz zastąpić całą bazę danych?')) {
        const dbRef = ref(database, '/');
        await set(dbRef, json);
        showMessage('Zaimportowano dane pomyślnie!');
      }
    } catch (err: any) {
      showMessage('Błąd importu: ' + err.message, 'error');
    }
  };

  const getFilteredData = () => {
    if (!filterPath || filterPath === '/') return dbData;
    
    const parts = filterPath.split('/').filter(Boolean);
    let current = dbData;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  };

  if (loading) {
    return <div className="text-white p-8">Ładowanie bazy danych...</div>;
  }

  const displayData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-800 rounded-xl p-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Filtruj ścieżkę (np. devices/robot-1)"
          value={filterPath}
          onChange={(e) => setFilterPath(e.target.value)}
          className="flex-1 bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          📥 Eksport JSON
        </button>
        <label className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition cursor-pointer">
          📤 Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Database URL */}
      <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-400">
        https://robot-5130a-default-rtdb.europe-west1.firebasedatabase.app/
        {filterPath && <span className="text-blue-400">{filterPath}</span>}
      </div>

      {/* Tree View */}
      <div className="bg-gray-800 rounded-xl p-4 overflow-auto max-h-[800px]">
        {displayData ? (
          <TreeNode
            data={displayData}
            path={filterPath || '/'}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        ) : (
          <p className="text-gray-500">Brak danych dla tej ścieżki</p>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Urządzenia: {dbData?.devices ? Object.keys(dbData.devices).length : 0}</span>
          <span>Grupy: {dbData?.groups ? Object.keys(dbData.groups).length : 0}</span>
          <span>Ostatnia aktualizacja: {new Date().toLocaleString('pl-PL')}</span>
        </div>
      </div>
    </div>
  );
}