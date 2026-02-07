import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicjalizacja Firebase Admin (tylko raz)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// GET - Pobierz wszystkich użytkowników
export async function GET() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    
    const users = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        // Pobierz custom claims (role)
        const user = await admin.auth().getUser(userRecord.uid);
        
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          emailVerified: userRecord.emailVerified,
          createdAt: userRecord.metadata.creationTime,
          lastSignIn: userRecord.metadata.lastSignInTime,
          isAdmin: user.customClaims?.admin === true,
          providerData: userRecord.providerData.map(p => p.providerId),
        };
      })
    );

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Dodaj nowego użytkownika
export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, isAdmin } = await request.json();

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Ustaw rolę admina jeśli wybrano
    if (isAdmin) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    }

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid,
      message: 'Użytkownik utworzony pomyślnie' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}