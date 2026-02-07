import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const generateReport = async (assistantResponses: string[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    Na podstawie poniższych wypowiedzi asystenta głosowego, stwórz profesjonalny raport w formacie HTML.
    
    Wypowiedzi asystenta:
    ${assistantResponses.join('\n---\n')}
    
    Stwórz raport który zawiera:
    1. Podsumowanie wykonawcze
    2. Główne tematy rozmowy
    3. Kluczowe informacje i ustalenia
    4. Rekomendacje i następne kroki
    5. Wnioski
    
    Format HTML z odpowiednimi nagłówkami h2, h3, listami i akapitami.
    Użyj profesjonalnego tonu biznesowego.
    Raport powinien być czytelny i dobrze zorganizowany.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};