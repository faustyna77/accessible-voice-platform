import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function GET() {
  try {
    const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status}`);
    }

    const assistants = await response.json();
    return NextResponse.json({ success: true, assistants });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { 
      name, 
      model, 
      firstMessage, 
      systemPrompt,
      voiceProvider, 
      voiceId, 
      transcriber,
      transcriberLanguage 
    } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Brak nazwy asystenta' },
        { status: 400 }
      );
    }

    // Przygotuj messages array
    const messages: any[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Przygotuj voice config
    const voiceConfig: any = {
      provider: voiceProvider || 'vapi'
    };

    // Dla Vapi provider używamy voiceId bezpośrednio
    if (voiceProvider === 'vapi') {
      voiceConfig.voiceId = voiceId || 'Elliot';
    }
    // Dla ElevenLabs
    else if (voiceProvider === '11labs') {
      voiceConfig.voiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';
    }
    // Dla pozostałych
    else {
      voiceConfig.voiceId = voiceId;
    }

    const assistantData = {
      name: name,
      firstMessage: firstMessage || undefined, // Usuń jeśli puste
      model: {
        provider: 'openai',
        model: model || 'gpt-4o-mini',
        messages: messages.length > 0 ? messages : undefined
      },
      voice: voiceConfig,
      transcriber: {
        provider: transcriber || 'deepgram',
        model: transcriber === 'deepgram' ? 'nova-2' : undefined,
        language: transcriberLanguage || 'pl'
      }
    };

    console.log('📤 Creating assistant:', JSON.stringify(assistantData, null, 2));

    const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantData),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Vapi error:', errorData);
      return NextResponse.json(
        { success: false, error: JSON.stringify(errorData) },
        { status: response.status }
      );
    }

    const assistant = await response.json();
    console.log('✅ Assistant created:', assistant.id);
    
    return NextResponse.json({ success: true, assistant });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}