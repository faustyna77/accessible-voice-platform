'use client';
import { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, get } from 'firebase/database';
import Link from 'next/link';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export default function DeveloperGuide() {
  const [activeSection, setActiveSection] = useState('overview');
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      const dbRef = ref(database, '/');
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setDbInfo({
          devicesCount: data.devices ? Object.keys(data.devices).length : 0,
          groupsCount: data.groups ? Object.keys(data.groups).length : 0,
          endpointsCount: data.vapi?.endpoints ? Object.keys(data.vapi.endpoints).length : 0,
          agentsCount: data.vapi?.agents ? Object.keys(data.vapi.agents).length : 0,
          databaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
      }
    } catch (error) {
      console.error('Błąd pobierania info o bazie:', error);
    }
  };

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Przegląd systemu',
      icon: '📋',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Witaj w systemie AI Voice dla osób starszych i niepełnosprawnych!</h2>
          <p className="text-gray-300 text-lg">
            Ta aplikacja pozwala na kompleksowe zarządzanie asystentami głosowymi AI, 
            które wspierają osoby starsze i niepełnosprawne w codziennym życiu poprzez 
            sterowanie różnymi urządzeniami.
          </p>

          {/* Informacje o bazie danych */}
          {dbInfo && (
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-500 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Twoja baza danych Firebase
              </h3>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400 mb-1">URL bazy danych:</div>
                <code className="text-blue-300 text-sm break-all">{dbInfo.databaseUrl}</code>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">{dbInfo.devicesCount}</div>
                  <div className="text-sm text-gray-300">Urządzeń</div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-400">{dbInfo.groupsCount}</div>
                  <div className="text-sm text-gray-300">Grup</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎯 Co możesz zrobić jako developer?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">🗄️</div>
                <h4 className="font-bold mb-2">Zarządzanie bazą danych</h4>
                <p className="text-sm text-gray-400">
                  Dodawaj, edytuj i usuwaj urządzenia wspomagające bezpośrednio z interfejsu aplikacji
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">🔌</div>
                <h4 className="font-bold mb-2">Tworzenie endpointów</h4>
                <p className="text-sm text-gray-400">
                  Rejestruj API endpoints hostowane gdzie chcesz (Render, Azure, Hugging Face)
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-bold mb-2">Konfiguracja agentów AI</h4>
                <p className="text-sm text-gray-400">
                  Twórz asystentów głosowych dostosowanych do potrzeb osób starszych i niepełnosprawnych
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-bold mb-2">Zarządzanie użytkownikami</h4>
                <p className="text-sm text-gray-400">
                  Dodawaj, usuwaj użytkowników i nadawaj uprawnienia administratora
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4"> Architektura systemu</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><strong>Frontend:</strong> Next.js 15 z App Router + TailwindCSS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><strong>Backend:</strong> Next.js API Routes (serverless)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><strong>Baza danych:</strong> Firebase Realtime Database (real-time sync)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><strong>Autentykacja:</strong> Firebase Authentication (Google + Email)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><strong>AI Voice:</strong> Vapi.ai (głos + rozpoznawanie mowy)</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'database',
      title: 'Zarządzanie bazą danych',
      icon: '🗄️',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Krok 1: Zarządzanie bazą danych</h2>
          
          <div className="bg-blue-900 border border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">📍 Gdzie zarządzać bazą?</h3>
            <p className="text-gray-200 mb-4">
              Przejdź do: <strong>Panel Admina → Baza danych</strong>
            </p>
            <Link
              href="/admin/database"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              🗄️ Otwórz bazę danych
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🔧 Co możesz zrobić?</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-bold mb-2">➕ Dodawanie urządzeń</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Kliknij przycisk "+" przy węźle /devices i dodaj nowe urządzenie wspomagające:
                </p>
                <pre className="bg-black/50 rounded p-3 text-xs overflow-x-auto">
                  <code className="text-cyan-400">{`{
  "device-1": {
    "name": "System oświetlenia pokój gościnny",
    "type": "light",
    "status": "off",
    "location": "living-room"
  }
}`}</code>
                </pre>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-bold mb-2">✏️ Edycja wartości</h4>
                <p className="text-sm text-gray-400">
                  Kliknij na wartość aby ją edytować. Zmiany zapisują się automatycznie w Firebase.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-red-500">
                <h4 className="font-bold mb-2">🗑️ Usuwanie elementów</h4>
                <p className="text-sm text-gray-400">
                  Najedź myszką na węzeł i kliknij ikonę kosza. Potwierdź usunięcie.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
                <h4 className="font-bold mb-2">📥 Import/Export JSON</h4>
                <p className="text-sm text-gray-400">
                  Możesz wyeksportować całą bazę do JSON lub zaimportować gotową strukturę.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">💡 Wskazówki</h3>
            <ul className="space-y-2 text-gray-200">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Wszystkie zmiany w bazie są synchronizowane w czasie rzeczywistym</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Możesz testować zmiany bez wpływu na użytkowników końcowych</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Używaj filtra ścieżki (np. "devices/device-1") do szybkiej nawigacji</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'endpoints',
      title: 'Tworzenie endpointów',
      icon: '🔌',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Krok 2: Tworzenie i rejestracja endpointów API</h2>
          
          <div className="bg-purple-900 border border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🌐 Gdzie hostować endpointy?</h3>
            <p className="text-gray-200 mb-4">
              Twoje endpointy mogą być hostowane na <strong>dowolnej platformie</strong>:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-semibold">Render</div>
                <div className="text-xs text-gray-400">render.com</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">☁️</div>
                <div className="font-semibold">Azure Functions</div>
                <div className="text-xs text-gray-400">azure.com</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🤗</div>
                <div className="font-semibold">Hugging Face</div>
                <div className="text-xs text-gray-400">huggingface.co</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">▲</div>
                <div className="font-semibold">Vercel</div>
                <div className="text-xs text-gray-400">vercel.com</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="font-semibold">AWS Lambda</div>
                <div className="text-xs text-gray-400">aws.amazon.com</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="font-semibold">Firebase Functions</div>
                <div className="text-xs text-gray-400">firebase.google.com</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📝 Przykład endpointa w Pythonie (Flask)</h3>
            <pre className="bg-gray-900 rounded p-4 overflow-x-auto">
              <code className="text-green-400">{`from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)

# Inicjalizacja Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project.firebaseio.com'
})

@app.route('/device/light/on', methods=['POST'])
def light_on():
    data = request.json
    
    # Aktualizuj status urządzenia w Firebase
    ref = db.reference('/devices/light-1')
    ref.update({
        'status': 'on',
        'lastCommand': 'turn_on',
        'timestamp': int(time.time() * 1000)
    })
    
    return jsonify({
        'response': 'Włączam światło',
        'action': 'light_on',
        'success': True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)`}</code>
            </pre>
          </div>

          <div className="bg-blue-900 border border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">📍 Dodawanie endpointa do aplikacji</h3>
            <p className="text-gray-200 mb-4">
              Po uruchomieniu serwera, zarejestruj endpoint w aplikacji:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-200 mb-4">
              <li>Przejdź do: <strong>Panel Admina → Zarządzanie Vapi → Endpointy</strong></li>
              <li>Kliknij "➕ Dodaj nowy endpoint"</li>
              <li>Wypełnij formularz:</li>
            </ol>
            <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
              <div><strong>Nazwa funkcji:</strong> light_on</div>
              <div><strong>URL:</strong> https://your-api.render.com/device/light/on</div>
              <div><strong>Metoda HTTP:</strong> POST</div>
              <div><strong>Opis:</strong> Włącz światło w pokoju</div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/vapi"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                🎛️ Otwórz panel Vapi
              </Link>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'agents',
      title: 'Konfiguracja agentów AI',
      icon: '🤖',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Krok 3: Tworzenie i konfiguracja agentów AI</h2>
          
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🎤 Co to jest agent AI?</h3>
            <p className="text-gray-200">
              Agent AI to asystent głosowy połączony z Vapi.ai, który wspiera osoby starsze i niepełnosprawne poprzez:
            </p>
            <ul className="mt-3 space-y-2 text-gray-200">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Rozpoznawanie mowy użytkownika w czasie rzeczywistym (nawet z wadami wymowy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Przetwarzanie poleceń przez AI (GPT-4, Claude, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Wykonywanie akcji na urządzeniach przez Twoje endpointy</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Odpowiedzi głosowe w prostym, zrozumiałym języku</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📋 Proces tworzenia agenta</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Przejdź do panelu Vapi</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>Panel Admina → Zarządzanie Vapi</strong>
                  </p>
                  <Link
                    href="/admin/vapi"
                    className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
                  >
                    Otwórz panel Vapi
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Wypełnij podstawowe informacje</h4>
                  <div className="bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>Nazwa agenta:</strong> Asystent domowy dla seniorów</div>
                    <div><strong>Model:</strong> GPT-4o Mini (szybki i efektywny)</div>
                    <div><strong>Język:</strong> Polski</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Skonfiguruj System Prompt</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    System prompt określa jak AI będzie wspierać użytkownika:
                  </p>
                  <pre className="bg-gray-900 rounded p-3 text-xs overflow-x-auto">
                    <code className="text-green-400">{`Jesteś pomocnym asystentem głosowym wspierającym osoby 
starsze i niepełnosprawne.

WAŻNE - Zasady komunikacji:
- Używaj prostego, zrozumiałego języka
- Mów wolno i wyraźnie
- Bądź cierpliwy - niektóre osoby mogą powtarzać polecenia
- Interpretuj polecenia kontekstowo (wady wymowy, żargon)
- Zawsze potwierdź wykonanie akcji

Dostępne urządzenia:
- Światło w pokoju - "włącz światło" / "zgaś światło"
- Termostat - "zwiększ temperaturę" / "zmniejsz temperaturę"
- Alarm - "włącz alarm" / "wyłącz alarm"

Przykłady interpretacji:
- "śswiatwo... włoncz" → Włączam światło
- "ciepo" → Zwiększam temperaturę`}</code>
                  </pre>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Przypisz endpointy</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Wybierz które urządzenia agent może kontrolować
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900 border border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">✅ Automatyczne zapisywanie</h3>
            <p className="text-gray-200">
              Wszystkie zmiany w konfiguracji agenta są zapisywane automatycznie w czasie rzeczywistym. 
              Nie ma potrzeby ręcznego zatwierdzania - agent jest gotowy do użycia od razu po utworzeniu.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'testing',
      title: 'Testowanie systemu',
      icon: '🧪',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Krok 4: Testowanie agentów i urządzeń</h2>
          
          <div className="bg-gradient-to-r from-green-900 to-teal-900 border border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🧪 Panel testowy</h3>
            <p className="text-gray-200 mb-4">
              Przetestuj agenta przed udostępnieniem użytkownikom końcowym:
            </p>
            <Link
              href="/admin/startup-test"
              className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              🚀 Otwórz panel testowy
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📋 Checklist testowania</h3>
            <div className="space-y-3">
              {[
                {
                  title: '🎤 Jakość rozpoznawania mowy',
                  desc: 'Sprawdź czy agent dobrze rozumie różne sposoby mówienia',
                  example: 'Przetestuj z wadami wymowy, powtórzeniami, prostym językiem'
                },
                {
                  title: '🤖 Odpowiedzi agenta',
                  desc: 'Czy odpowiedzi są proste i zrozumiałe?',
                  example: 'Agent powinien używać prostego języka, unikać żargonu'
                },
                {
                  title: '🔌 Sterowanie urządzeniami',
                  desc: 'Czy urządzenia reagują prawidłowo na polecenia?',
                  example: '"Włącz światło" → światło się włącza'
                },
                {
                  title: '⚡ Czas reakcji',
                  desc: 'Czy agent odpowiada wystarczająco szybko?',
                  example: 'Opóźnienie powinno być < 2 sekundy'
                },
                {
                  title: '🗄️ Aktualizacja bazy danych',
                  desc: 'Czy stan urządzeń jest aktualizowany w Firebase?',
                  example: 'Sprawdź w zakładce "Baza danych"'
                },
                {
                  title: '❌ Obsługa błędów',
                  desc: 'Co się dzieje przy niezrozumiałych poleceniach?',
                  example: 'Agent powinien grzecznie poprosić o powtórzenie'
                }
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-1 rounded"
                      id={`test-${i}`}
                    />
                    <label htmlFor={`test-${i}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-sm text-gray-400 mb-2">{item.desc}</div>
                      <div className="text-xs text-gray-500 bg-black/30 rounded px-2 py-1 inline-block">
                        💡 {item.example}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'users',
      title: 'Zarządzanie użytkownikami',
      icon: '👥',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Zarządzanie użytkownikami aplikacji</h2>
          
          <div className="bg-gradient-to-r from-indigo-900 to-blue-900 border border-indigo-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">👥 Panel użytkowników</h3>
            <p className="text-gray-200 mb-4">
              Zarządzaj kontami użytkowników, nadawaj uprawnienia i kontroluj dostęp do systemu.
            </p>
            <Link
              href="/admin/users"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              👥 Otwórz zarządzanie użytkownikami
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🔧 Dostępne operacje</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>➕</span>
                  <span>Dodawanie użytkowników</span>
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Twórz nowe konta dla podopiecznych lub opiekunów:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Email + hasło</li>
                  <li>• Wybór roli (admin / użytkownik)</li>
                  <li>• Opcjonalna nazwa wyświetlana</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>👑</span>
                  <span>Zarządzanie rolami</span>
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Nadawaj i odbieraj uprawnienia:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 👤→👑 Nadaj uprawnienia admina</li>
                  <li>• 👑→👤 Odbierz uprawnienia admina</li>
                  <li>• Zmiany natychmiastowe</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-500">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>🔒</span>
                  <span>Blokowanie kont</span>
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Tymczasowo zablokuj dostęp:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Zablokuj konto</li>
                  <li>• Odblokuj konto</li>
                  <li>• Nie usuwa danych użytkownika</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-red-500">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>🗑️</span>
                  <span>Usuwanie użytkowników</span>
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Permanentne usunięcie konta:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Usuń konto i wszystkie dane</li>
                  <li>• Operacja nieodwracalna</li>
                  <li>• Wymaga potwierdzenia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workflow',
      title: 'Kompletny workflow',
      icon: '🔄',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Pełny proces developera - krok po kroku</h2>
          
          <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 border border-blue-500 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">🎯 Kompletny workflow</h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Przygotuj bazę danych',
                  desc: 'Dodaj/edytuj urządzenia wspomagające w Firebase',
                  action: '/admin/database',
                  actionText: '🗄️ Baza danych'
                },
                {
                  step: 2,
                  title: 'Napisz i hostuj endpointy',
                  desc: 'Python/Node.js → Render/Azure/Hugging Face',
                  action: null,
                  actionText: null
                },
                {
                  step: 3,
                  title: 'Zarejestruj endpointy',
                  desc: 'Dodaj URL endpointów do aplikacji',
                  action: '/admin/vapi',
                  actionText: '🔌 Panel Vapi'
                },
                {
                  step: 4,
                  title: 'Stwórz agenta AI',
                  desc: 'Nazwa, głos, język, system prompt dostosowany do seniorów',
                  action: '/admin/vapi',
                  actionText: '🤖 Zarządzaj agentami'
                },
                {
                  step: 5,
                  title: 'Przypisz endpointy do agenta',
                  desc: 'Wybierz które urządzenia agent może kontrolować',
                  action: '/admin/vapi',
                  actionText: '🔗 Przypisz'
                },
                {
                  step: 6,
                  title: 'Przetestuj agenta',
                  desc: 'Rozmowa głosowa + weryfikacja sterowania urządzeniami',
                  action: '/admin/startup-test',
                  actionText: '🧪 Panel testowy'
                },
                {
                  step: 7,
                  title: 'Zarządzaj użytkownikami',
                  desc: 'Dodaj podopiecznych i opiekunów',
                  action: '/admin/users',
                  actionText: '👥 Użytkownicy'
                },
                 {
                  step: 8,
                  title: 'Przykładowe wdroenie nowego urządzenia IoT',
                  desc: 'Przykłady konfiguracji sprzętowej',
                  action: '/admin/iot',
                  actionText: 'Iot'
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 bg-black/30 rounded-lg p-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
                    {item.action && (
                      <Link
                        href={item.action}
                        className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
                      >
                        {item.actionText}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-900 border border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">✅ Gotowe!</h3>
            <p className="text-gray-200 mb-4">
              Po zakończeniu workflow:
            </p>
            <ul className="space-y-2 text-gray-200">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Osoby starsze i niepełnosprawne mogą sterować urządzeniami głosowo</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Agent rozumie proste komendy i toleruje wady wymowy</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Wszystkie urządzenia aktualizują się w czasie rzeczywistym</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>System działa 24/7 automatycznie</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📚 Instruktaż dla developerów</h1>
          <p className="text-gray-400">
            Kompleksowy przewodnik po systemie wspierającym osoby starsze i niepełnosprawne
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3 space-y-2">
            <div className="bg-gray-800 rounded-xl p-4 sticky top-8">
              <h3 className="text-sm font-bold text-gray-400 mb-3">SPIS TREŚCI</h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition mb-2 ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span className="text-sm">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-9">
            <div className="bg-gray-800 rounded-xl p-8">
              {sections.find(s => s.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}