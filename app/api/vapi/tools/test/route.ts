import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('🧪 POST /api/vapi/tools/test - Testowanie endpointu...');
  
  try {
    const body = await req.json();
    const { url, method = 'POST', body: requestBody, headers: requestHeaders } = body;
    
    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brak URL do przetestowania' 
      }, { status: 400 });
    }

    console.log('🎯 Testuję:', method, url);
    console.log('📦 Body:', requestBody);
    console.log('📋 Headers:', requestHeaders);
    
    const startTime = Date.now();
    
    // Przygotuj headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestHeaders || {})
    };
    
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: headers,
    };
    
    // Dodaj body jeśli metoda to POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }
    
    console.log('🚀 Wysyłam request z opcjami:', fetchOptions);
    
    const response = await fetch(url, fetchOptions);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('📡 Status:', response.status);
    console.log('⏱️ Czas odpowiedzi:', responseTime, 'ms');
    
    let responseData = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('📥 Odpowiedź:', responseData);
    
    const isSuccess = response.status >= 200 && response.status < 300;
    
    return NextResponse.json({ 
      success: isSuccess,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      data: responseData,
      error: isSuccess ? null : `HTTP ${response.status}: ${response.statusText}`
    });
    
  } catch (error: any) {
    console.error('❌ Błąd podczas testowania:', error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nie można połączyć się z endpointem. Sprawdź URL i upewnij się, że serwer jest dostępny.',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}