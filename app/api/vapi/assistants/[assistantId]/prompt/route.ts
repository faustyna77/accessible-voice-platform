import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;

// PATCH - zaktualizuj System Prompt
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('📤 PATCH System Prompt for assistant:', assistantId);
  
  try {
    const { prompt } = await req.json();
    console.log('📋 New prompt length:', prompt?.length || 0);
    
    // Pobierz aktualnego asystenta
    const getRes = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` },
    });
    const currentAssistant = await getRes.json();
    
    // Zaktualizuj System Prompt - zachowaj wszystkie ustawienia modelu
    const updatedMessages = [
      {
        role: 'system',
        content: prompt || 'Jesteś pomocnym asystentem.'
      }
    ];
    
    const updatePayload = {
      model: {
        ...currentAssistant.model,
        messages: updatedMessages
      }
    };
    
    console.log('📦 Updating System Prompt...');
    
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    
    console.log('📡 Vapi response status:', response.status);
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Vapi error:', responseData);
      return NextResponse.json({ 
        success: false, 
        error: responseData.message || JSON.stringify(responseData) 
      }, { status: response.status });
    }
    
    console.log('✅ System Prompt updated successfully');
    return NextResponse.json({ success: true, assistant: responseData });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}