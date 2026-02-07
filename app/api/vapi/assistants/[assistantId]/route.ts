// ============================================
// /api/vapi/assistants/[assistantId]/route.ts
// Kompletny CRUD dla pojedynczego asystenta
// ============================================

import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// GET - pobierz szczegóły asystenta
export async function GET(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('📥 GET assistant:', assistantId);
  
  try {
    const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('📡 Vapi response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Vapi error response:', error);
      throw new Error(`Vapi error: ${response.status} - ${error}`);
    }
    
    const assistant = await response.json();
    console.log('✅ Assistant retrieved:', assistant.id);
    
    return NextResponse.json({ 
      success: true, 
      assistant 
    });
  } catch (error: any) {
    console.error('❌ GET Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// PATCH - edytuj asystenta
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('📝 PATCH assistant:', assistantId);
  
  try {
    const updateData = await req.json();
    console.log('📦 Update data:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    console.log('📡 Vapi response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Vapi error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: Array.isArray(errorData.message) 
            ? errorData.message.join('; ')
            : errorData.message || `HTTP ${response.status}`
        },
        { status: response.status }
      );
    }
    
    const assistant = await response.json();
    console.log('✅ Assistant updated:', assistant.id);
    
    return NextResponse.json({ 
      success: true, 
      assistant 
    });
    
  } catch (error: any) {
    console.error('❌ PATCH Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - usuń asystenta
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  const { assistantId } = await params;
  console.log('🗑️ DELETE assistant:', assistantId);
  
  try {
    const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });
    
    console.log('📡 Vapi response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Vapi error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }
    
    console.log('✅ Assistant deleted successfully');
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Error deleting assistant:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}