'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { auth } from '..//lib/firebase';

export default function VoiceSettings() {
  const [endpoint, setEndpoint] = useState('');
  const [language, setLanguage] = useState('pl');
  const [voice, setVoice] = useState('female');
  const [saved, setSaved] = useState(false);

  const db = getDatabase();

  useEffect(() => {
    const fetchSettings = async () => {
      const snapshot = await get(ref(db, 'vapi/settings'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setEndpoint(data.endpoint || '');
        setLanguage(data.language || 'pl');
        setVoice(data.voice || 'female');
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    await set(ref(db, 'vapi/settings'), { endpoint, language, voice });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl font-bold mb-4">Ustawienia VAPI</h2>

      <div className="space-y-4">
        <div>
          <label>Endpoint API:</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="ml-2 p-1 rounded text-black"
          />
        </div>

        <div>
          <label>Język agenta:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="ml-2 p-1 rounded text-black">
            <option value="pl">Polski</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label>Głos agenta:</label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="ml-2 p-1 rounded text-black">
            <option value="female">Kobieta</option>
            <option value="male">Mężczyzna</option>
          </select>
        </div>

        <button onClick={saveSettings} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
          Zapisz
        </button>

        {saved && <p className="text-green-400">Ustawienia zapisane!</p>}
      </div>
    </div>
  );
}
