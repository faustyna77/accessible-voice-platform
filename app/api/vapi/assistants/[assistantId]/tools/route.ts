import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// GET - pobierz tools przypisane do asystenta
export async function GET(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('📥 GET tools for assistant:', assistantId);
  
  try {
    const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Vapi error response:', error);
      throw new Error(`Vapi error: ${response.status} - ${error}`);
    }
    
    const assistant = await response.json();
    
    // ✅ toolIds są w assistant.model.toolIds, NIE w assistant.toolIds
    const toolIds = assistant.model?.toolIds || [];
    
    console.log('📋 Assistant structure:', {
      id: assistant.id,
      name: assistant.name,
      'model.toolIds': toolIds,
      toolsCount: toolIds.length
    });
    
    return NextResponse.json({ 
      success: true, 
      toolIds: toolIds,
      assistantName: assistant.name
    });
  } catch (error: any) {
    console.error('❌ GET Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// PATCH - przypisz tools do asystenta
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('📤 PATCH tools for assistant:', assistantId);
  
  try {
    const { toolIds } = await req.json();
    
    if (!Array.isArray(toolIds)) {
      throw new Error('toolIds musi być tablicą');
    }
    
    console.log('📋 Tool IDs to assign:', toolIds);
    
    // KROK 1: Pobierz aktualny asystent
    const getResponse = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      throw new Error('Nie udało się pobrać asystenta');
    }

    const currentAssistant = await getResponse.json();
    console.log('📋 Current assistant model.toolIds:', currentAssistant.model?.toolIds);
    
    // KROK 2: Stwórz payload - toolIds muszą być w model.toolIds!
    // ✅ WAŻNE: Vapi wymaga toolIds w assistant.model.toolIds, NIE w assistant.toolIds
    const updatePayload = {
      model: {
        ...currentAssistant.model, // Zachowaj istniejące ustawienia modelu
        toolIds: toolIds // ✅ Umieść toolIds tutaj!
      }
    };
    
    console.log('📦 Update payload:', JSON.stringify(updatePayload, null, 2));
    
    // KROK 3: Wyślij PATCH
    const patchResponse = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    
    console.log('📡 Vapi response status:', patchResponse.status);
    
    const responseData = await patchResponse.json();
    
    if (!patchResponse.ok) {
      console.error('❌ Vapi PATCH error:', JSON.stringify(responseData, null, 2));
      return NextResponse.json({ 
        success: false, 
        error: Array.isArray(responseData.message) 
          ? responseData.message.join('; ')
          : responseData.message || `HTTP ${patchResponse.status}`
      }, { status: patchResponse.status });
    }
    
    // ✅ toolIds są w model.toolIds
    const updatedToolIds = responseData.model?.toolIds || [];
    
    console.log('✅ Successfully updated assistant:', {
      id: responseData.id,
      name: responseData.name,
      'model.toolIds': updatedToolIds,
      toolsCount: updatedToolIds.length
    });
    
    return NextResponse.json({ 
      success: true,
      toolIds: updatedToolIds,
      message: `Przypisano ${updatedToolIds.length} narzędzi`
    });
    
  } catch (error: any) {
    console.error('❌ PATCH Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}