'use client';

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

export default function Robot2Page() {
  const [robot, setRobot] = useState<Robot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const robotRef = ref(database, "devices/robot-2");
    const unsubscribe = onValue(robotRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRobot({
          online: data.status?.online || false,
          battery: data.status?.battery || 0,
        });
        setLoading(false);
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
      set(ref(database, "devices/robot-2/motors/left/state"), motorStates.left),
      set(ref(database, "devices/robot-2/motors/right/state"), motorStates.right),
    ]);
  };

  if (loading || !robot)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-gray-400">
        Loading Robot-2 data...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-indigo-400 mb-4">Robot-2 Control Panel</h1>

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-[#101014] rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <Battery
              className={`w-5 h-5 ${
                robot.battery > 50
                  ? "text-green-400"
                  : robot.battery > 20
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            />
            <span>{robot.battery}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${robot.online ? "text-green-400" : "text-red-500"}`} />
            <span>{robot.online ? "Online" : "Offline"}</span>
          </div>
        </div>

        {/* Drive Control */}
        <section className="border border-gray-800 rounded-2xl bg-[#101014] p-8">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-2">
            Drive Control – Robot-2
          </h2>

          <div className="grid grid-cols-3 gap-4 w-64 mx-auto">
            <div></div>
            <button
              onClick={() => moveRobot("forward")}
              className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div></div>

            <button
              onClick={() => moveRobot("left")}
              className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => moveRobot("stop")}
              className="flex items-center justify-center h-16 bg-red-700 hover:bg-red-600 rounded-md shadow-md transition"
            >
              <Square className="w-6 h-6" />
            </button>

            <button
              onClick={() => moveRobot("right")}
              className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>

            <div></div>
            <button
              onClick={() => moveRobot("backward")}
              className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <div></div>
          </div>
        </section>
      </div>
    </main>
  );
}
