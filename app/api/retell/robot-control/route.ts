// app/api/retell/robot-control/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// ===================== CORS =====================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Możesz podać konkretną domenę np. 'https://app.retell.ai'
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// ===================== OPTIONS (preflight) =====================
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// ===================== INICJALIZACJA FIREBASE =====================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

// ===================== TYPY =====================
interface RobotControlRequest {
  robot_id?: string;
  action: string;
  value?: string | number | boolean;
  led?: string;
  servo_id?: number;
  angle?: number;
  position?: string;
}

// ===================== FUNKCJE =====================
async function moveRobot(robotId: string, direction: string) {
  if (!['robot-1', 'robot-2'].includes(robotId)) throw new Error('Invalid robot ID');
  const movements: Record<string, { left: string; right: string }> = {
    forward: { left: 'forward', right: 'forward' },
    backward: { left: 'backward', right: 'backward' },
    left: { left: 'backward', right: 'forward' },
    right: { left: 'forward', right: 'backward' },
    stop: { left: 'stop', right: 'stop' },
  };
  const motorStates = movements[direction];
  if (!motorStates) throw new Error(`Invalid direction: ${direction}`);
  await Promise.all([
    db.ref(`devices/${robotId}/motors/left/state`).set(motorStates.left),
    db.ref(`devices/${robotId}/motors/right/state`).set(motorStates.right),
  ]);
  return { success: true, robot: robotId, direction, motors: motorStates };
}

async function toggleLED(robotId: string, led: string) {
  if (!['robot-1', 'robot-2'].includes(robotId)) throw new Error('Invalid robot ID');
  const ledPins: Record<string, string> = { front: '2', back: '13' };
  const pin = ledPins[led];
  if (!pin) throw new Error('Invalid LED');
  const snapshot = await db.ref(`devices/${robotId}/leds/${pin}/state`).once('value');
  const newState = !snapshot.val();
  await db.ref(`devices/${robotId}/leds/${pin}/state`).set(newState);
  return { success: true, robot: robotId, led, state: newState };
}

async function setLED(robotId: string, led: string, state: boolean) {
  if (!['robot-1', 'robot-2'].includes(robotId)) throw new Error('Invalid robot ID');
  const ledPins: Record<string, string> = { front: '2', back: '13' };
  const pin = ledPins[led];
  if (!pin) throw new Error('Invalid LED');
  await db.ref(`devices/${robotId}/leds/${pin}/state`).set(state);
  return { success: true, robot: robotId, led, state };
}

async function stopAllRobots() {
  await Promise.all([
    db.ref('devices/robot-1/motors/left/state').set('stop'),
    db.ref('devices/robot-1/motors/right/state').set('stop'),
    db.ref('devices/robot-2/motors/left/state').set('stop'),
    db.ref('devices/robot-2/motors/right/state').set('stop'),
  ]);
  return { success: true, message: 'All mobile robots stopped' };
}

async function setArmPosition(position: string) {
  const validPositions = ['home', 'rest', 'pick', 'place', 'wave', 'stretch', 'grab', 'release'];
  if (!validPositions.includes(position)) throw new Error(`Invalid position: ${position}`);
  await db.ref('devices/robot-arm/positions/current').set(position);
  return { success: true, position };
}

async function setServoAngle(servoId: number, angle: number) {
  if (servoId < 1 || servoId > 6) throw new Error(`Invalid servoId: ${servoId}`);
  if (angle < 0 || angle > 180) throw new Error(`Invalid angle: ${angle}`);
  await db.ref(`devices/robot-arm/servos/${servoId}/angle`).set(angle);
  return { success: true, servoId, angle };
}

async function getRobotStatus(robotId: string) {
  const snapshot = await db.ref(`devices/${robotId}`).once('value');
  const data = snapshot.val();
  if (!data) throw new Error('Robot not found');
  return { success: true, robot: robotId, data };
}

async function getAllRobotsStatus() {
  const snapshot = await db.ref('devices').once('value');
  const devices = snapshot.val();
  const statuses = Object.entries(devices).map(([id, data]: [string, any]) => ({
    id,
    name: data._info?.name,
    type: data._info?.type,
    online: data.status?.online || false,
    battery: data.status?.battery || 0,
  }));
  return { success: true, robots: statuses };
}

// ===================== POST HANDLER =====================
export async function POST(req: NextRequest) {
  try {
    const body: RobotControlRequest = await req.json();
    const { action, robot_id, value, led, servo_id, angle, position } = body;
    let result: any;

    switch (action) {
      case 'move':
        if (!robot_id || !value) throw new Error('Missing robot_id or value');
        result = await moveRobot(robot_id, value as string);
        break;
      case 'toggle_led':
        if (!robot_id || !led) throw new Error('Missing robot_id or led');
        result = await toggleLED(robot_id, led);
        break;
      case 'set_led':
        if (!robot_id || !led || value === undefined) throw new Error('Missing robot_id, led, or value');
        result = await setLED(robot_id, led, value as boolean);
        break;
      case 'stop_all':
        result = await stopAllRobots();
        break;
      case 'arm_position':
        if (!position) throw new Error('Missing position');
        result = await setArmPosition(position);
        break;
      case 'set_servo':
        if (!servo_id || angle === undefined) throw new Error('Missing servo_id or angle');
        result = await setServoAngle(servo_id, angle);
        break;
      case 'status':
        if (!robot_id) throw new Error('Missing robot_id');
        result = await getRobotStatus(robot_id);
        break;
      case 'all_status':
        result = await getAllRobotsStatus();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 400, headers: corsHeaders });
  }
}

// ===================== GET HANDLER =====================
export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'Robot Control API v2.0 (READY)' },
    { headers: corsHeaders }
  );
}
