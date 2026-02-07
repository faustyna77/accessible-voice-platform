"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Battery, Wifi, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from "lucide-react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

interface Robot {
  online: boolean;
  battery: number;
}

export default function Robot1Page() {
  const [robot, setRobot] = useState<Robot | null>(null);

  useEffect(() => {
    const robotRef = ref(database, "devices/robot-1");
    const unsubscribe = onValue(robotRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRobot({
          online: data.status?.online || false,
          battery: data.status?.battery || 0,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const moveRobot = async (direction: string) => {
    const movements: Record<string, { left: string; right: string }> = {
      forward: { left: "forward", right: "forward" },
      backward: { left: "backward", right: "backward" },
      left: { left: "backward", right: "forward" },
      right: { left: "forward", right: "backward" },
      stop: { left: "stop", right: "stop" },
    };
    const motorStates = movements[direction];
    await Promise.all([
      set(ref(database, "devices/robot-1/motors/left/state"), motorStates.left),
      set(ref(database, "devices/robot-1/motors/right/state"), motorStates.right),
    ]);
  };

  if (!robot)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-gray-400">
        Loading Robot-1 data...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-200 p-8">
      <h1 className="text-3xl font-semibold text-indigo-400 mb-6">Robot-1 Control Panel</h1>

      <div className="flex items-center gap-4 mb-6">
        <Battery
          className={`w-5 h-5 ${
            robot.battery > 50 ? "text-green-400" : robot.battery > 20 ? "text-yellow-400" : "text-red-500"
          }`}
        />
        <span>{robot.battery}%</span>
        <Wifi className={`w-5 h-5 ${robot.online ? "text-green-400" : "text-red-500"}`} />
        <span>{robot.online ? "Online" : "Offline"}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 w-64 mx-auto">
        <div></div>
        <button onClick={() => moveRobot("forward")} className="h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md">
          <ArrowUp className="w-6 h-6 mx-auto" />
        </button>
        <div></div>

        <button onClick={() => moveRobot("left")} className="h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md">
          <ArrowLeft className="w-6 h-6 mx-auto" />
        </button>
        <button onClick={() => moveRobot("stop")} className="h-16 bg-red-700 hover:bg-red-600 rounded-md">
          <Square className="w-6 h-6 mx-auto" />
        </button>
        <button onClick={() => moveRobot("right")} className="h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md">
          <ArrowRight className="w-6 h-6 mx-auto" />
        </button>

        <div></div>
        <button onClick={() => moveRobot("backward")} className="h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md">
          <ArrowDown className="w-6 h-6 mx-auto" />
        </button>
        <div></div>
      </div>
    </main>
  );
}
