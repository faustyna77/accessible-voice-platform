import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// GET - pobierz szczegóły konkretnego toola
export async function GET(
  req: Request,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  console.log('📥 GET /api/vapi/tools/' + toolId);

  if (!VAPI_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'Brak klucza API'
    }, { status: 500 });
  }

  try {
    const response = await fetch(`${VAPI_BASE_URL}/tool/${toolId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vapi error:', errorText);
      throw new Error(`Vapi error: ${response.status}`);
    }

    const tool = await response.json();
    
    console.log('✅ Pobrano tool z pełnymi danymi:', {
      id: tool.id,
      name: tool.name,
      url: tool.url,
      method: tool.method,
      hasBody: !!tool.body,
      hasHeaders: !!tool.headers,
    });

    return NextResponse.json({ success: true, tool });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - usuń tool
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  console.log('🗑️ DELETE /api/vapi/tools/' + toolId);

  if (!VAPI_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'Brak klucza API'
    }, { status: 500 });
  }

  try {
    const response = await fetch(`${VAPI_BASE_URL}/tool/${toolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vapi error:', errorText);
      throw new Error(`Vapi error: ${response.status}`);
    }

    console.log('✅ Tool usunięty:', toolId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}