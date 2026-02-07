import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicjalizacja Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// DELETE - Usuń użytkownika
export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    await admin.auth().deleteUser(params.uid);
    return NextResponse.json({ 
      success: true, 
      message: 'Użytkownik usunięty pomyślnie' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Zaktualizuj użytkownika (zmiana roli, danych)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const body = await request.json();
    const { isAdmin, disabled, displayName, email } = body;

    // Aktualizuj podstawowe dane
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (disabled !== undefined) updateData.disabled = disabled;

    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(params.uid, updateData);
    }

    // Aktualizuj custom claims (rola admina)
    if (isAdmin !== undefined) {
      await admin.auth().setCustomUserClaims(params.uid, { 
        admin: isAdmin 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Użytkownik zaktualizowany pomyślnie' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}