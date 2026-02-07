// app/api/retell/register-call/route.ts
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { agentId } = await request.json();

    // Utwórz web call (nie "register")
    const webCallResponse = await retellClient.call.createWebCall({
      agent_id: agentId,
    });

    return NextResponse.json({
      accessToken: webCallResponse.access_token,
      callId: webCallResponse.call_id,
    });
  } catch (error: any) {
    console.error('Error creating web call:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create web call',
        details: error?.message 
      },
      { status: 500 }
    );
  }
}