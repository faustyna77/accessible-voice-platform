'use client';

import React, { useState } from 'react';
import { generateReport } from '../app/lib/gemini';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportGeneratorProps {
  assistantResponses: string[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ assistantResponses }) => {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    if (assistantResponses.length === 0) {
      setError('Brak wypowiedzi asystenta do wygenerowania raportu');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const generatedReport = await generateReport(assistantResponses);
      setReport(generatedReport);
    } catch (err: any) {
      setError('Nie udało się wygenerować raportu: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!report) return;

    try {
      const reportElement = document.getElementById('generated-report');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`raport_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Błąd generowania PDF:', err);
      setError('Nie udało się wygenerować PDF');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Generator raportów AI
          </h3>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Generator wykorzystuje Google Gemini AI do tworzenia profesjonalnych raportów 
              na podstawie wypowiedzi asystenta głosowego.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Dostępne wypowiedzi asystenta:</strong> {assistantResponses.length}
              </p>
              {assistantResponses.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <p className="text-xs text-blue-600">
                    {assistantResponses.slice(0, 3).map((response, i) => (
                      <span key={i}>• {response.substring(0, 100)}...<br /></span>
                    ))}
                    {assistantResponses.length > 3 && `...i ${assistantResponses.length - 3} więcej`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleGenerateReport}
              disabled={generating || assistantResponses.length === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generuję raport...
                </span>
              ) : (
                '🤖 Wygeneruj raport AI'
              )}
            </button>

            {report && (
              <button
                onClick={downloadAsPDF}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                📄 Pobierz PDF
              </button>
            )}
          </div>

          {report && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Wygenerowany raport</h4>
                <span className="text-sm text-gray-500">
                  Wygenerowano: {new Date().toLocaleString()}
                </span>
              </div>
              
              <div 
                id="generated-report"
                className="prose max-w-none bg-white p-6 rounded border"
                dangerouslySetInnerHTML={{ __html: report }}
              />
            </div>
          )}

          {!report && assistantResponses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">Brak wypowiedzi asystenta do wygenerowania raportu</p>
              <p className="text-sm">Przeprowadź rozmowę w dashboard, aby móc tworzyć raporty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;