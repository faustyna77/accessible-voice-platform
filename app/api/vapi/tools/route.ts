import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// GET - pobierz wszystkie tools
export async function GET() {
  console.log('📥 GET /api/vapi/tools - Pobieranie tools...');
  
  if (!VAPI_API_KEY) {
    console.error('❌ Brak VAPI_PRIVATE_API_KEY w .env.local!');
    return NextResponse.json({ 
      success: false, 
      error: 'Brak klucza API. Dodaj VAPI_PRIVATE_API_KEY do .env.local' 
    }, { status: 500 });
  }

  try {
    const response = await fetch(`${VAPI_BASE_URL}/tool`, {
      headers: { 
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('📡 Vapi response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vapi error:', errorText);
      throw new Error(`Vapi error: ${response.status} - ${errorText}`);
    }
    
    const tools = await response.json();
    console.log('✅ Pobrano tools:', tools.length);
    
    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - utwórz nowy tool jako apiRequest
export async function POST(req: Request) {
  console.log('📤 POST /api/vapi/tools - Tworzenie nowego API Request tool...');
  
  if (!VAPI_API_KEY) {
    console.error('❌ Brak VAPI_PRIVATE_API_KEY w .env.local!');
    return NextResponse.json({ 
      success: false, 
      error: 'Brak klucza API. Dodaj VAPI_PRIVATE_API_KEY do .env.local' 
    }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log('📋 Otrzymane dane:', body);
    
    const { 
      name, 
      description, 
      url, 
      method = 'POST',
      parameters = { properties: {}, required: [] },
      staticBody = {},
      headers: requestHeaders = {}
    } = body;
    
    // WALIDACJA
    if (!name || !url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brak wymaganych pól: name i url' 
      }, { status: 400 });
    }

    console.log('🔍 Parametry dynamiczne:', parameters);
    console.log('🔍 Static Body:', staticBody);

    // Połącz parametry dynamiczne ze static body
    // Static body to wartości domyślne/stałe, które należy dodać jako parametry z wartościami default
    const allProperties: any = { ...parameters.properties };
    const allRequired: string[] = [...(parameters.required || [])];
    
    // Dodaj static body jako parametry z wartościami domyślnymi
    Object.entries(staticBody).forEach(([key, value]) => {
      if (!allProperties[key]) {
        // Określ typ na podstawie wartości
        let paramType = 'string';
        if (typeof value === 'number') paramType = 'number';
        else if (typeof value === 'boolean') paramType = 'boolean';
        else if (Array.isArray(value)) paramType = 'array';
        else if (typeof value === 'object') paramType = 'object';
        
        allProperties[key] = {
          type: paramType,
          description: `Static value: ${value}`,
          default: value
        };
        allRequired.push(key);
      }
    });

    // POPRAWNA STRUKTURA dla Vapi API Request Tool
    const toolPayload = {
      type: 'apiRequest',
      name: name.trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
      async: false,
      messages: [
        {
          type: 'request-start',
          content: `Wykonuję ${name}...`,
        },
        {
          type: 'request-complete',
          content: `${name} wykonane pomyślnie.`,
        },
        {
          type: 'request-failed',
          content: `Błąd podczas wykonywania ${name}.`,
        }
      ],
      function: {
        name: name.trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
        description: description?.trim() || `Wywołaj endpoint: ${name}`,
        parameters: {
          type: 'object',
          properties: allProperties,
          required: allRequired
        }
      },
      method: method.toUpperCase(),
      url: url.trim(),
      timeoutSeconds: 20,
      // Dodaj tylko headers jeśli są niepuste
      ...(Object.keys(requestHeaders).length > 0 && { headers: requestHeaders }),
    };
    
    console.log('📦 Payload do Vapi:');
    console.log('  - Function parameters:', JSON.stringify(toolPayload.function.parameters, null, 2));
    
    console.log('📦 Wysyłam do Vapi:');
    console.log(JSON.stringify(toolPayload, null, 2));
    
    const response = await fetch(`${VAPI_BASE_URL}/tool`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolPayload),
    });
    
    console.log('📡 Vapi response status:', response.status);
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Vapi error:', JSON.stringify(responseData, null, 2));
      return NextResponse.json({ 
        success: false, 
        error: responseData.message || JSON.stringify(responseData) 
      }, { status: response.status });
    }
    
    console.log('✅ Tool utworzony:', responseData.id);
    
    return NextResponse.json({ 
      success: true, 
      tool: responseData
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}