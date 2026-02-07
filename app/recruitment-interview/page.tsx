'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import HeygenAvatar from '@/components/HeygenAvatar';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

interface RobotData {
  online: boolean;
  battery: number;
  sensors: Record<string, number>;
}

export default function RobotMonitoringPage() {
  const [robots, setRobots] = useState<Record<string, RobotData>>({});

  useEffect(() => {
    const devicesRef = ref(database, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData: Record<string, RobotData> = {};
        Object.keys(data).forEach((robotId) => {
          formattedData[robotId] = {
            online: data[robotId]?.status?.online || false,
            battery: data[robotId]?.status?.battery || 0,
            sensors: data[robotId]?.sensors || {},
          };
        });
        setRobots(formattedData);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">🤖 Robot & Sensor Monitoring</h1>

          {Object.keys(robots).length === 0 ? (
            <p className="text-gray-600">Loading robot data...</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(robots).map(([robotId, robot]) => (
                <div
                  key={robotId}
                  className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
                >
                  <h2 className="text-2xl font-semibold text-indigo-600 mb-3">{robotId}</h2>
                  <p className="text-gray-700 mb-2">
                    Status:{' '}
                    <span className={robot.online ? 'text-green-600' : 'text-red-600'}>
                      {robot.online ? 'Online' : 'Offline'}
                    </span>
                  </p>
                  <p className="text-gray-700 mb-2">Battery: {robot.battery}%</p>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Sensors:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {Object.entries(robot.sensors).map(([sensor, value]) => (
                        <li key={sensor}>
                          {sensor}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HeyGen Avatar - floating widget */}
        <HeygenAvatar />
      </div>
    </ProtectedRoute>
  );
}
