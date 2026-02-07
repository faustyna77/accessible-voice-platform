"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

interface Servo {
  id: number;
  label: string;
  angle: number;
}

export default function RobotArmPage() {
  const [servos, setServos] = useState<Servo[]>([]);
  const [currentPosition, setCurrentPosition] = useState<string>("");

  useEffect(() => {
    const armRef = ref(database, "devices/robot-arm");
    const unsubscribe = onValue(armRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.servos) {
        const parsed = Object.entries(data.servos).map(([id, servo]: [string, any]) => ({
          id: parseInt(id),
          label: servo.label,
          angle: servo.angle,
        }));
        setServos(parsed);
      }
      setCurrentPosition(data.positions?.current || "");
    });
    return () => unsubscribe();
  }, []);

  const setServoAngle = async (servoId: number, angle: number) => {
    await set(ref(database, `devices/robot-arm/servos/${servoId}/angle`), angle);
  };

  const moveArmTo = async (pos: string) => {
    await set(ref(database, "devices/robot-arm/positions/current"), pos);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-200 p-8">
      <h1 className="text-3xl font-semibold text-indigo-400 mb-6">Robotic Arm Control</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {["home", "pick", "place", "wave"].map((pos) => (
          <button
            key={pos}
            onClick={() => moveArmTo(pos)}
            className={`p-4 rounded-md border text-sm font-semibold transition ${
              currentPosition === pos
                ? "border-indigo-500 text-indigo-400 bg-[#141421]"
                : "border-gray-700 hover:border-indigo-400 hover:text-indigo-300"
            }`}
          >
            {pos.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {servos.map((servo) => (
          <div key={servo.id}>
            <div className="flex justify-between mb-2 text-xs font-mono text-gray-400">
              <span>{servo.label}</span>
              <span>{servo.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={servo.angle}
              onChange={(e) => setServoAngle(servo.id, parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
