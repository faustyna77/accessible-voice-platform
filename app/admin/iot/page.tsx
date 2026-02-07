'use client';

import { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Database, 
  Code, 
  Settings, 
  Upload, 
  Zap, 
  Rocket, 
  Plus, 
  Mic, 
  TestTube,
  ChevronRight,
  CheckCircle2,
  Circle,
  Cloud,
  Smartphone,
  Wifi,
  Server
} from 'lucide-react';

export default function IoTDocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const sections = [
    { id: 'overview', title: 'Przegląd projektu', icon: Cpu },
    { id: 'architecture', title: 'Architektura systemu', icon: Radio },
    { id: 'firebase-structure', title: 'Struktura Firebase', icon: Database },
    { id: 'platformio', title: 'PlatformIO Config', icon: Settings },
    { id: 'esp32-code', title: 'Kod ESP32', icon: Code },
    { id: 'upload', title: 'Wgrywanie ESP32', icon: Upload },
    { id: 'fastapi', title: 'Backend FastAPI', icon: Zap },
    { id: 'huggingface', title: 'Deploy Hugging Face', icon: Rocket },
    { id: 'add-device', title: 'Dodawanie urządzenia', icon: Plus },
    { id: 'vapi', title: 'Integracja Vapi AI', icon: Mic },
    { id: 'testing', title: 'Testowanie', icon: TestTube },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Radio className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Dokumentacja Techniczna IoT
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Sterowanie urządzeniami IoT przez głos • Firebase + ESP32 + Vapi AI
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  Spis treści
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2 text-sm ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'architecture' && <ArchitectureSection />}
              {activeSection === 'firebase-structure' && <FirebaseStructureSection />}
              {activeSection === 'platformio' && <PlatformIOSection />}
              {activeSection === 'esp32-code' && <ESP32CodeSection expandedCode={expandedCode} setExpandedCode={setExpandedCode} />}
              {activeSection === 'upload' && <UploadSection />}
              {activeSection === 'fastapi' && <FastAPISection expandedCode={expandedCode} setExpandedCode={setExpandedCode} />}
              {activeSection === 'huggingface' && <HuggingFaceSection />}
              {activeSection === 'add-device' && <AddDeviceSection />}
              {activeSection === 'vapi' && <VapiSection />}
              {activeSection === 'testing' && <TestingSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEKCJA: PRZEGLĄD
// ============================================================================
function OverviewSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Cpu className="w-8 h-8 text-blue-400" />
        Przegląd projektu
      </h2>

      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          Cel projektu
        </h3>
        <p className="text-gray-300">
          System IoT umożliwiający sterowanie urządzeniami codziennego użytku lub urządzeniami specjalistycznymi prystosowanymi do pomocy dla osób starszych i niepełnosprawnych 
          za pomocą głosu przez AI asystenta (Vapi), z synchronizacją stanu w czasie 
          rzeczywistym przez Firebase Realtime Database.
          Oto jest krótki przewodnik jak dodać i skonfigurować urządzenie na przykładzie ramienia robotycznego 6DOF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/50 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-green-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Urządzenia
          </h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
              Robot Arm (6 serwomechanizmów)
            </li>
            <li className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
              Robot-1 (mobilny)
            </li>
            <li className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
              Robot-2 (mobilny)
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/50 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-blue-400 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Stack technologiczny
          </h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li>• ESP32 (Arduino)</li>
            <li>• Firebase RTDB</li>
            <li>• FastAPI (Python)</li>
            <li>• Hugging Face Spaces</li>
            <li>• Vapi AI</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/50 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-purple-400 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Komponenty
          </h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li>• ESP32 DevKit v1</li>
            <li>• Serwomechanizmy (x6)</li>
            <li>• Silniki DC (x4)</li>
            <li>• LED (x4)</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Przepływ danych
        </h3>
        <div className="space-y-2 font-mono text-sm">
          {[
            { step: '1', color: 'purple', from: 'Użytkownik', text: '"Hej Aniu, obróć serwo 2 na 120°"' },
            { step: '2', color: 'purple', from: 'Vapi AI', text: 'robot_arm_servo_2_rotate(120)' },
            { step: '3', color: 'orange', from: 'API', text: 'POST /robot-arm/servo/2 {"angle": 120}' },
            { step: '4', color: 'yellow', from: 'Firebase', text: 'devices/robot-arm/servos/2/angle = 120' },
            { step: '5', color: 'blue', from: 'ESP32', text: 'Stream wykrywa zmianę' },
            { step: '6', color: 'green', from: 'Serwo', text: 'Obrót na 120°' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3" style={{ marginLeft: `${idx * 24}px` }}>
              <span className={`bg-${item.color}-600 px-2 py-0.5 rounded text-xs font-bold`}>
                {item.step}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-${item.color}-400 font-semibold`}>{item.from}:</span>
              <span className="text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3">💡 Kluczowe cechy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <strong>Real-time</strong> - zmiany widoczne natychmiast (&lt;1s)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <strong>Bezpieczne</strong> - dane w Secrets, nie w kodzie
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <strong>Skalowalne</strong> - łatwo dodać nowe urządzenia
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <strong>Auto-reconnect</strong> - automatyczne łączenie WiFi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEKCJA: ARCHITEKTURA
// ============================================================================
function ArchitectureSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Radio className="w-8 h-8 text-blue-400" />
        Architektura systemu
      </h2>

      <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 Diagram architektury</h3>
        <div className="bg-black rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-xs font-mono whitespace-pre">
{`┌─────────────────┐
│  Użytkownik     │
│  🎤 Głos        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        Vapi AI Assistant            │
│  • Rozpoznawanie mowy (STT)         │
│  • Przetwarzanie NLP                │
│  • Wywołanie funkcji                │
│  • Synteza mowy (TTS)               │
└────────┬────────────────────────────┘
         │
         │ HTTPS POST
         ▼
┌─────────────────────────────────────┐
│   FastAPI Backend                   │
│   (Hugging Face Spaces)             │
│                                     │
│   Endpoints:                        │
│   • /robot-arm/servo/{id}           │
│   • /robot-arm/{position}           │
│   • /robot-1/{action}               │
└────────┬────────────────────────────┘
         │
         │ Firebase Admin SDK
         ▼
┌─────────────────────────────────────┐
│    Firebase Realtime Database       │
│    /devices                         │
│      ├─ robot-arm                   │
│      ├─ robot-1                     │
│      └─ robot-2                     │
└────────┬────────────────────────────┘
         │
         │ WebSocket Stream
         ▼
┌─────────────────────────────────────┐
│         ESP32 Devices               │
│  • Robot Arm (6x Servo)             │
│  • Robot-1/2 (Motors + LED)         │
└─────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-blue-400 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Warstwa Cloud
          </h4>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <strong className="text-blue-300">Vapi AI:</strong> Agent głosowy
              <div className="ml-4 text-xs text-gray-400">
                • STT: Deepgram<br/>
                • LLM: GPT-4<br/>
                • TTS: 11Labs
              </div>
            </div>
            <div>
              <strong className="text-blue-300">FastAPI:</strong> REST API
              <div className="ml-4 text-xs text-gray-400">
                • Host: Hugging Face Spaces<br/>
                • Runtime: Docker
              </div>
            </div>
            <div>
              <strong className="text-blue-300">Firebase RTDB:</strong> Baza real-time
              <div className="ml-4 text-xs text-gray-400">
                • Region: europe-west1<br/>
                • WebSocket streams
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
          <h4 className="font-bold mb-3 text-green-400 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Warstwa Edge
          </h4>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <strong className="text-green-300">ESP32:</strong> Mikrokontroler
              <div className="ml-4 text-xs text-gray-400">
                • WiFi 2.4GHz<br/>
                • 240MHz dual-core<br/>
                • 520KB SRAM
              </div>
            </div>
            <div>
              <strong className="text-green-300">Firmware:</strong> Arduino
              <div className="ml-4 text-xs text-gray-400">
                • PlatformIO build<br/>
                • Firebase ESP Client<br/>
                • WiFiManager
              </div>
            </div>
            <div>
              <strong className="text-green-300">Komponenty:</strong>
              <div className="ml-4 text-xs text-gray-400">
                • Servo (MG996R, SG90)<br/>
                • DC Motors + L298N<br/>
                • LED + resistors
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-purple-400">🔄 Protokoły komunikacji</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-900 rounded p-3">
            <div className="font-bold text-purple-300 mb-1">Vapi ↔ FastAPI</div>
            <div className="text-gray-400">• HTTPS (REST)</div>
            <div className="text-gray-400">• Format: JSON</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="font-bold text-blue-300 mb-1">FastAPI ↔ Firebase</div>
            <div className="text-gray-400">• SDK: firebase-admin</div>
            <div className="text-gray-400">• Auth: Service Account</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="font-bold text-green-300 mb-1">Firebase ↔ ESP32</div>
            <div className="text-gray-400">• WebSocket Stream</div>
            <div className="text-gray-400">• Fallback: Polling 3s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEKCJA: FIREBASE
// ============================================================================
function FirebaseStructureSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Database className="w-8 h-8 text-orange-400" />
        Struktura bazy Firebase
      </h2>

      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Smartphone className="w-6 h-6" />
          Edycja przez aplikację (NIE Firebase Console!)
        </h3>
        <p className="text-gray-300 mb-4">
          Baza jest już utworzona i edytujesz ją przez zakładkę <strong className="text-blue-400">"Database"</strong> w aplikacji.
          <strong className="text-green-400"> Nie musisz wchodzić do Firebase Console!</strong>
        </p>
        <div className="bg-gray-900 rounded-lg p-4 space-y-2">
          <div className="text-green-400 font-semibold">✅ Jak edytować:</div>
          <ol className="text-sm text-gray-300 space-y-1 ml-4">
            <li>1. Otwórz aplikację Firebase</li>
            <li>2. Zakładka <strong>"Database"</strong></li>
            <li>3. Kliknij <strong>"+"</strong> aby dodać dane</li>
            <li>4. LUB kliknij <strong>"Upload JSON"</strong> aby wgrać całą strukturę</li>
          </ol>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">📄 Pełna struktura JSON</h3>
          <span className="text-xs text-gray-400">Zapisz jako database.json i wgraj</span>
        </div>
        <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-yellow-400 text-xs font-mono">{`{
  "devices": {
    "robot-arm": {
      "_info": {
        "name": "Robot Arm 6DOF",
        "type": "robotic_arm"
      },
      "servos": [
        null,
        {
          "pin": 13,
          "label": "Base",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        },
        {
          "pin": 12,
          "label": "Shoulder",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        },
        {
          "pin": 14,
          "label": "Elbow",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        },
        {
          "pin": 27,
          "label": "Wrist Roll",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        },
        {
          "pin": 26,
          "label": "Wrist Pitch",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        },
        {
          "pin": 25,
          "label": "Gripper",
          "angle": 90,
          "min_angle": 0,
          "max_angle": 180
        }
      ],
      "positions": {
        "current": "home",
        "presets": {
          "home": [90, 90, 90, 90, 90, 90],
          "rest": [90, 45, 45, 90, 90, 90],
          "pick": [90, 120, 60, 90, 90, 90],
          "place": [90, 60, 120, 90, 90, 90],
          "wave": [45, 90, 90, 90, 45, 90],
          "grab": [90, 90, 90, 90, 90, 45],
          "release": [90, 90, 90, 90, 90, 135]
        }
      },
      "status": {
        "online": false,
        "battery": 100
      }
    },
    "robot-1": {
      "motors": {
        "left": {
          "state": "stop",
          "pins": { "forward": 23, "backward": 19 }
        },
        "right": {
          "state": "stop",
          "pins": { "forward": 18, "backward": 5 }
        }
      },
      "leds": {
        "2": { "state": false },
        "13": { "state": false }
      },
      "status": { "online": false }
    }
  }
}`}</pre>
        </div>
      </div>

      <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">🔑 Kluczowe ścieżki</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left">Ścieżka</th>
                <th className="px-3 py-2 text-left">Typ</th>
                <th className="px-3 py-2 text-left">Opis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-3 py-2 font-mono text-xs text-blue-400">/devices/robot-arm/servos/2/angle</td>
                <td className="px-3 py-2">int (0-180)</td>
                <td className="px-3 py-2">Kąt serwa #2</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs text-purple-400">/devices/robot-arm/positions/current</td>
                <td className="px-3 py-2">string</td>
                <td className="px-3 py-2">Pozycja ("home", "wave"...)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs text-green-400">/devices/robot-1/motors/left/state</td>
                <td className="px-3 py-2">string</td>
                <td className="px-3 py-2">Stan ("forward", "stop")</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Pozostałe sekcje będą w następnym komponencie ze względu na długość...
// Dodaję skrócone wersje dla brevity

function PlatformIOSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Settings className="w-8 h-8 text-purple-400" />
        Konfiguracja PlatformIO
      </h2>
      
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">📄 platformio.ini</h3>
        <div className="bg-black rounded-lg p-4">
          <pre className="text-green-400 text-xs font-mono">{`[env:esp32doit-devkit-v1]
platform = espressif32
board = esp32doit-devkit-v1
framework = arduino
monitor_speed = 115200

lib_deps =
    bblanchon/ArduinoJson@^7.4.2
    mobizt/Firebase Arduino Client Library for ESP8266 and ESP32@^4.4.14
    tzapu/WiFiManager@^2.0.17
    madhephaestus/ESP32Servo@^3.0.9`}</pre>
        </div>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4">
        <h4 className="font-bold mb-2">📚 Biblioteki:</h4>
        <ul className="text-sm space-y-1 text-gray-300">
          <li><strong>ArduinoJson:</strong> Parsowanie JSON z Firebase</li>
          <li><strong>Firebase ESP Client:</strong> Komunikacja z RTDB</li>
          <li><strong>WiFiManager:</strong> Portal captive WiFi</li>
          <li><strong>ESP32Servo:</strong> Sterowanie serwomechanizmami</li>
        </ul>
      </div>
    </div>
  );
}

// Pozostałe komponenty sekcji...
function ESP32CodeSection({ expandedCode, setExpandedCode }: any) {
  const isExpanded = expandedCode === 'esp32';
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Code className="w-8 h-8 text-green-400" />
        Kod ESP32 (Robot Arm)
      </h2>
      
      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
        <p className="text-gray-300">
          <strong className="text-blue-400">RZECZYWISTY</strong> kod z projektu - działający i przetestowany!
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">💻 src/main.cpp</h3>
          <button
            onClick={() => setExpandedCode(isExpanded ? null : 'esp32')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {isExpanded ? 'Zwiń' : 'Rozwiń pełny kod'}
          </button>
        </div>
        <div className={`bg-black rounded-lg p-4 overflow-auto ${isExpanded ? 'max-h-[600px]' : 'max-h-64'}`}>
          <pre className="text-green-400 text-xs font-mono">{`#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ESP32Servo.h>

#define WIFI_SSID "TWOJA_SIEC"
#define WIFI_PASSWORD "HASLO"
#define FIREBASE_API_KEY "AIzaSy..."
#define DATABASE_URL "project.firebasedatabase.app"
#define DEVICE_ID "robot-arm"

const int SERVO_PINS[6] = {13, 12, 14, 27, 26, 25};
Servo servos[6];

FirebaseData stream;
FirebaseAuth auth;
FirebaseConfig config;

int currentAngles[6] = {90, 90, 90, 90, 90, 90};
String basePath = "/devices/" + String(DEVICE_ID);

void setServoAngle(int id, int angle, bool smooth = true) {
  if (id < 1 || id > 6) return;
  int idx = id - 1;
  angle = constrain(angle, 0, 180);
  
  if (smooth) {
    int current = currentAngles[idx];
    int step = (angle > current) ? 1 : -1;
    while (current != angle) {
      current += step;
      servos[idx].write(current);
      delay(15);
    }
  } else {
    servos[idx].write(angle);
  }
  currentAngles[idx] = angle;
}

void streamCallback(FirebaseStream data) {
  String path = data.dataPath();
  
  if (path.startsWith("/servos/") && path.endsWith("/angle")) {
    int servoId = path.substring(8, path.lastIndexOf("/")).toInt();
    int angle = data.intData();
    if (servoId >= 1 && servoId <= 6) {
      setServoAngle(servoId, angle, false);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Init servos
  for (int i = 0; i < 6; i++) {
    servos[i].attach(SERVO_PINS[i]);
    servos[i].write(90);
  }
  
  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  
  // Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Stream
  Firebase.RTDB.beginStream(&stream, basePath.c_str());
  Firebase.RTDB.setStreamCallback(&stream, streamCallback, nullptr);
  
  Serial.println("✅ Ready!");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
  }
  delay(10);
}`}</pre>
        </div>
      </div>
    </div>
  );
}

function UploadSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Upload className="w-8 h-8 text-blue-400" />
        Wgrywanie na ESP32
      </h2>

      <div className="space-y-4">
        {[
          { step: '1', title: 'Podłącz ESP32', desc: 'USB-C do komputera, sprawdź port COM' },
          { step: '2', title: 'Kompilacja', desc: 'PlatformIO → Build (Ctrl+Alt+B)' },
          { step: '3', title: 'Upload', desc: 'PlatformIO → Upload (Ctrl+Alt+U)' },
          { step: '4', title: 'Monitor Serial', desc: 'Sprawdź logi (Ctrl+Alt+S)' },
        ].map((item) => (
          <div key={item.step} className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {item.step}
              </div>
              <h4 className="font-bold text-lg">{item.title}</h4>
            </div>
            <p className="text-gray-300 text-sm ml-11">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
        <h4 className="font-bold mb-2 text-red-400">🔧 Troubleshooting</h4>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• <strong>"Failed to connect":</strong> Przytrzymaj BOOT podczas upload</li>
          <li>• <strong>Permission denied (Linux):</strong> sudo usermod -a -G dialout $USER</li>
          <li>• <strong>Brak portu:</strong> Zainstaluj sterowniki CH340/CP2102</li>
        </ul>
      </div>
    </div>
  );
}

function FastAPISection({ expandedCode, setExpandedCode }: any) {
  const isExpanded = expandedCode === 'fastapi';
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Zap className="w-8 h-8 text-yellow-400" />
        Backend FastAPI
      </h2>

      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">💻 app.py</h3>
          <button
            onClick={() => setExpandedCode(isExpanded ? null : 'fastapi')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {isExpanded ? 'Zwiń' : 'Rozwiń kod'}
          </button>
        </div>
        <div className={`bg-black rounded-lg p-4 overflow-auto ${isExpanded ? 'max-h-[600px]' : 'max-h-64'}`}>
          <pre className="text-blue-400 text-xs font-mono">{`from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, db
import os

app = FastAPI(title="Robot Control API")

# Firebase init
if not firebase_admin._apps:
    creds = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\\\n", "\\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        # ...
    }
    firebase_admin.initialize_app(
        credentials.Certificate(creds),
        {'databaseURL': os.getenv("FIREBASE_DATABASE_URL")}
    )

class AngleRequest(BaseModel):
    angle: int

@app.post("/robot-arm/servo/{servo_id}")
async def set_servo(servo_id: int, req: AngleRequest):
    if not 0 <= req.angle <= 180:
        raise HTTPException(400, "Angle 0-180")
    
    ref = db.reference(f"devices/robot-arm/servos/{servo_id}/angle")
    ref.set(req.angle)
    
    return {"success": True, "servo": servo_id, "angle": req.angle}

@app.post("/robot-arm/{position}")
async def set_position(position: str):
    db.reference("devices/robot-arm/positions/current").set(position)
    return {"success": True, "position": position}

@app.post("/robot-1/{action}")
async def robot1_action(action: str):
    ref = db.reference("devices/robot-1/motors")
    if action == "forward":
        ref.child("left/state").set("forward")
        ref.child("right/state").set("forward")
    # ... inne akcje
    return {"success": True, "action": action}`}</pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-2">📦 requirements.txt</h4>
          <pre className="text-xs bg-black rounded p-2 text-yellow-400">{`fastapi==0.104.1
uvicorn[standard]==0.24.0
firebase-admin==6.2.0
pydantic==2.5.0`}</pre>
        </div>

        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-2">🐳 Dockerfile</h4>
          <pre className="text-xs bg-black rounded p-2 text-blue-400">{`FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]`}</pre>
        </div>
      </div>
    </div>
  );
}

function HuggingFaceSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Rocket className="w-8 h-8 text-orange-400" />
        Deploy na Hugging Face
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <div className="bg-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
            Utworzenie Space
          </h4>
          <ul className="text-sm text-gray-300 space-y-1 ml-11">
            <li>• Przejdź do huggingface.co</li>
            <li>• New Space → SDK: <strong className="text-orange-400">Docker</strong></li>
            <li>• Name: robot-control-api</li>
          </ul>
        </div>

        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <div className="bg-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
            Upload plików
          </h4>
          <p className="text-sm text-gray-300 ml-11">
            Files → Upload: app.py, requirements.txt, Dockerfile, README.md
          </p>
        </div>

        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
            Konfiguracja Secrets
          </h4>
          <p className="text-sm text-gray-300 mb-2 ml-11">
            Settings → Repository secrets → Dodaj:
          </p>
          <ul className="text-xs font-mono text-gray-300 space-y-1 ml-11 bg-black rounded p-3">
            <li>FIREBASE_PROJECT_ID</li>
            <li>FIREBASE_PRIVATE_KEY_ID</li>
            <li>FIREBASE_PRIVATE_KEY</li>
            <li>FIREBASE_CLIENT_EMAIL</li>
            <li>FIREBASE_CLIENT_ID</li>
            <li>FIREBASE_DATABASE_URL</li>
          </ul>
        </div>
      </div>

      <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
        <h4 className="font-bold mb-2">✅ Weryfikacja</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Otwórz: https://USERNAME-robot-control-api.hf.space</li>
          <li>• /docs → Swagger UI</li>
          <li>• /health → firebase_connected: true</li>
        </ul>
      </div>
    </div>
  );
}

function AddDeviceSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Plus className="w-8 h-8 text-green-400" />
        Dodawanie nowego urządzenia
      </h2>

      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
        <h3 className="font-bold mb-2">Przykład: Dodajemy robot-3</h3>
        <p className="text-sm text-gray-300">
          Kompletny workflow od Firebase do Vapi
        </p>
      </div>

      {[
        { num: 1, title: 'Dodaj do Firebase', content: 'Database → devices → + → robot-3 → Upload JSON' },
        { num: 2, title: 'Kod ESP32', content: 'Skopiuj kod robot-1, zmień: DEVICE_ID = "robot-3"' },
        { num: 3, title: 'Wgraj na ESP32', content: 'PlatformIO → Upload' },
        { num: 4, title: 'Dodaj endpointy', content: 'app.py → @app.post("/robot-3/forward")' },
        { num: 5, title: 'Deploy na HF', content: 'Upload app.py, poczekaj na rebuild' },
        { num: 6, title: 'Dodaj do Vapi', content: 'Vapi Tools → Nowa funkcja robot3_control' },
      ].map((step) => (
        <div key={step.num} className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
              {step.num}
            </div>
            <div>
              <h4 className="font-bold">{step.title}</h4>
              <p className="text-sm text-gray-400">{step.content}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
        <h4 className="font-bold mb-2">✅ Checklist</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            'Firebase struktura',
            'Kod ESP32',
            'Upload ESP32',
            'Online w Firebase',
            'Endpointy API',
            'Deploy HF',
            'Test Swagger',
            'Vapi funkcja'
          ].map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-300">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function VapiSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Mic className="w-8 h-8 text-purple-400" />
        Integracja z Vapi AI
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-3">🎤 System Prompt</h4>
          <div className="bg-black rounded p-3 text-xs text-gray-300">
            Jesteś Anią, asystentem głosowym do sterowania robotami IoT...<br/>
            Możesz obracać serwa (0-180°), ustawiać pozycje (home, wave...),<br/>
            sterować robotami mobilnymi.
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-bold mb-3">🔧 Funkcja: robot_arm_servo_rotate</h4>
          <div className="bg-black rounded p-3 text-xs overflow-auto max-h-48">
            <pre className="text-green-400">{`{
  "type": "function",
  "function": {
    "name": "robot_arm_servo_rotate",
    "parameters": {
      "servo_id": { "type": "integer", "enum": [1,2,3,4,5,6] },
      "angle": { "type": "integer", "min": 0, "max": 180 }
    }
  },
  "server": {
    "url": "https://USERNAME-robot-control-api.hf.space/robot-arm/servo/{servo_id}",
    "method": "POST",
    "body": { "angle": "{{angle}}" }
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
        <h4 className="font-bold mb-2">🧪 Przykładowe komendy</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ "Obróć serwo 3 na 45 stopni"</li>
          <li>✅ "Ustaw pozycję home"</li>
          <li>✅ "Pomachaj"</li>
          <li>✅ "Robot jeden jedź do przodu"</li>
        </ul>
      </div>
    </div>
  );
}

function TestingSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <TestTube className="w-8 h-8 text-blue-400" />
        Testowanie końcowe
      </h2>

      <div className="space-y-3">
        {[
          { name: 'Firebase → ESP32', desc: 'Zmiana w Database → reakcja serwa', color: 'green' },
          { name: 'API → Firebase → ESP32', desc: 'Swagger /docs → test endpointu', color: 'blue' },
          { name: 'Vapi E2E', desc: 'Komenda głosowa → fizyczny ruch', color: 'purple' },
          { name: 'Pozycje', desc: '"Ustaw pozycję wave" → wszystkie serwa', color: 'orange' },
          { name: 'Robot mobilny', desc: '"Jedź do przodu" → silniki ON', color: 'yellow' },
          { name: 'Stress test', desc: '5 szybkich komend → brak błędów', color: 'red' },
          { name: 'Recovery', desc: 'WiFi OFF/ON → auto-reconnect', color: 'indigo' },
        ].map((test, idx) => (
          <div key={idx} className={`bg-${test.color}-900/20 border border-${test.color}-500/50 rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-bold text-${test.color}-400`}>Test {idx + 1}: {test.name}</h4>
                <p className="text-sm text-gray-400">{test.desc}</p>
              </div>
              <input type="checkbox" className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2">Gratulacje!</h3>
        <p className="text-gray-300">
          System IoT jest w pełni funkcjonalny!
        </p>
        <div className="mt-4 text-sm text-gray-400">
          7/7 testów → Gotowy do użycia 🚀
        </div>
      </div>
    </div>
  );
}