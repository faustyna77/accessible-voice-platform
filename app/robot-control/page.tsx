"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Battery, Wifi, Power, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Settings } from "lucide-react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

interface Robot {
  id: string;
  name: string;
  type: "mobile_robot" | "robotic_arm";
  online: boolean;
  battery: number;
  motors?: {
    left: { state: string };
    right: { state: string };
  };
  servos?: Array<{
    id: number;
    angle: number;
    label: string;
  }>;
  currentPosition?: string;
  gripperState?: string;
}

export default function MultiRobotDashboard() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<string>("robot-1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceIds = ["robot-1", "robot-2", "robot-arm"];
    const unsubscribers: Array<() => void> = [];

    deviceIds.forEach((deviceId) => {
      const deviceRef = ref(database, `devices/${deviceId}`);
      const unsubscribe = onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const robot: Robot = {
            id: deviceId,
            name: data._info?.name || deviceId,
            type: data._info?.type || "mobile_robot",
            online: data.status?.online || false,
            battery: data.status?.battery || 0,
            motors: data.motors,
            servos: data.servos
              ? Object.entries(data.servos).map(([id, servo]: [string, any]) => ({
                  id: parseInt(id),
                  angle: servo.angle,
                  label: servo.label,
                }))
              : [],
            currentPosition: data.positions?.current,
            gripperState: data.status?.gripper_state,
          };

          setRobots((prev) => {
            const filtered = prev.filter((r) => r.id !== deviceId);
            return [...filtered, robot].sort((a, b) => a.id.localeCompare(b.id));
          });
        }
        setLoading(false);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  const moveRobot = async (robotId: string, direction: string) => {
    const movements: Record<string, { left: string; right: string }> = {
      forward: { left: "forward", right: "forward" },
      backward: { left: "backward", right: "backward" },
      left: { left: "backward", right: "forward" },
      right: { left: "forward", right: "backward" },
      stop: { left: "stop", right: "stop" },
    };
    const motorStates = movements[direction];
    await Promise.all([
      set(ref(database, `devices/${robotId}/motors/left/state`), motorStates.left),
      set(ref(database, `devices/${robotId}/motors/right/state`), motorStates.right),
    ]);
  };

  const setServoAngle = async (servoId: number, angle: number) => {
    await set(ref(database, `devices/robot-arm/servos/${servoId}/angle`), angle);
  };

  const setArmPosition = async (position: string) => {
    await set(ref(database, `devices/robot-arm/positions/current`), position);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-gray-300">
        <div className="text-center font-mono">Loading system data...</div>
      </div>
    );

  const currentRobot = robots.find((r) => r.id === selectedRobot);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Robot Control Interface
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            Connected via Firebase Realtime Database
          </p>
        </header>

        {/* Robot Selector */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <button
              key={robot.id}
              onClick={() => setSelectedRobot(robot.id)}
              className={`p-5 rounded-xl border transition-all text-left ${
                selectedRobot === robot.id
                  ? "border-indigo-500 bg-[#12121a]"
                  : "border-gray-800 bg-[#101014] hover:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">{robot.name}</span>
                <div className="flex items-center gap-2">
                  <Battery
                    className={`w-4 h-4 ${
                      robot.battery > 50
                        ? "text-green-400"
                        : robot.battery > 20
                        ? "text-yellow-400"
                        : "text-red-500"
                    }`}
                  />
                  <span className="text-xs">{robot.battery}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-1">
                  <Wifi
                    className={`w-3 h-3 ${
                      robot.online ? "text-green-400" : "text-red-500"
                    }`}
                  />
                  {robot.online ? "Online" : "Offline"}
                </div>
                <span>{robot.type === "mobile_robot" ? "Mobile" : "Arm"}</span>
              </div>
            </button>
          ))}
        </section>

        {/* Control Panel */}
        {currentRobot && currentRobot.type === "mobile_robot" && (
          <section className="border border-gray-800 rounded-2xl bg-[#101014] p-8">
            <h2 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-2">
              Drive Control – {currentRobot.name}
            </h2>

            <div className="grid grid-cols-3 gap-4 w-64 mx-auto">
              <div></div>
              <button
                onClick={() => moveRobot(currentRobot.id, "forward")}
                className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div></div>

              <button
                onClick={() => moveRobot(currentRobot.id, "left")}
                className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => moveRobot(currentRobot.id, "stop")}
                className="flex items-center justify-center h-16 bg-red-700 hover:bg-red-600 rounded-md shadow-md transition"
              >
                <Square className="w-6 h-6" />
              </button>

              <button
                onClick={() => moveRobot(currentRobot.id, "right")}
                className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
              >
                <ArrowRight className="w-6 h-6" />
              </button>

              <div></div>
              <button
                onClick={() => moveRobot(currentRobot.id, "backward")}
                className="flex items-center justify-center h-16 bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-md transition"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <div></div>
            </div>
          </section>
        )}

        {/* Robotic Arm Control */}
        {currentRobot && currentRobot.type === "robotic_arm" && (
          <section className="border border-gray-800 rounded-2xl bg-[#101014] p-8 space-y-8">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">
              Robotic Arm – {currentRobot.name}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["home", "pick", "place", "wave"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setArmPosition(pos)}
                  className={`p-4 rounded-md border text-sm font-semibold transition ${
                    currentRobot.currentPosition === pos
                      ? "border-indigo-500 text-indigo-400 bg-[#141421]"
                      : "border-gray-700 hover:border-indigo-400 hover:text-indigo-300"
                  }`}
                >
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                Servo Control
              </h3>
              <div className="space-y-6">
                {currentRobot.servos?.map((servo) => (
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
                      onChange={(e) =>
                        setServoAngle(servo.id, parseInt(e.target.value))
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
