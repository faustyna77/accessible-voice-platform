
<img width="902" height="437" alt="cc" src="https://github.com/user-attachments/assets/c62d6fc6-06fd-4991-a2fc-c62734557237" />
<img width="904" height="413" alt="OBRAZ1" src="https://github.com/user-attachments/assets/571ba6c8-32f9-424b-bcab-237b0af39379" />
<img width="878" height="386" alt="OBRAZ2" src="https://github.com/user-attachments/assets/385c5b17-a94b-4b34-9f4e-e86bbb02c55c" />
<img width="909" height="419" alt="OBRAZ3" src="https://github.com/user-attachments/assets/db4d08f6-80b7-4122-b272-b47ec3e66cdd" />


# Voice-Controlled IoT Assistant (Next.js + VAPI + ESP32)

A **Next.js** web application that integrates **VAPI** and AI models to control IoT devices (e.g., LED lights, lamps, motors) connected to an **ESP32** microcontroller.  
The user can interact with the assistant (via text or voice), and the system translates their intent into appropriate HTTP requests that are sent to the ESP32.

---

## ✨ Features

- Voice-controlled IoT device management.  
- **VAPI integration** (speech recognition + LLM).  
- Sends **REST (POST/GET)** requests to ESP32.  
- Easy to extend with new commands and devices.  
- Frontend built with **Next.js** (React 18 + App Router).  

---

## 🛠️ Requirements

- **Node.js 18+**  
- **VAPI API Key**  
- **ESP32 microcontroller** with firmware that exposes a REST API (e.g., a simple HTTP server).  
- Project dependencies (see `package.json`):  
  - `next`  
  - `react`  
  - `react-dom`  
  - `axios` (for ESP32 communication)  
  - `dotenv` (for environment variable management)  

---

## ⚙️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your_username/voice-iot-assistant.git
cd voice-iot-assistant
````

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Create a `.env.local` file** in the project root:

```
VAPI_KEY=your_api_key
ESP32_API_URL=http://192.168.1.50:8000
```

---

## 🚀 Run the App

1. **Start the development server:**

```bash
npm run dev
```

2. **Open in your browser:**

```
http://localhost:3000
```

3. **Example commands:**

* `"Turn off the light"` → `POST /light/off` to ESP32
* `"Turn on the LED"` → `POST /led/on`
* `"Start the motor"` → `POST /motor/start`

---

## 📡 Architecture

```
Next.js (UI + VAPI)
        ⬇
   Intent parsing (LLM)
        ⬇
   Next.js API Routes
        ⬇
 HTTP requests to ESP32
        ⬇
 IoT Devices (LED, light, motor)
```

---

## 🤝 Future Improvements

* Add a dashboard to monitor ESP32 device states.
* Integrate with a knowledge base (RAG) for IoT scenarios.
* Support multiple ESP32 devices in one network.
* Add TTS (Text-to-Speech) so the assistant can respond with voice.

---

## 📜 License

MIT – free to use and modify for any purpose.

```

