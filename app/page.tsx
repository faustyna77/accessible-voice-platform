'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 3000);
    if (!loading) {
      clearTimeout(timer);
      setInitialLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading && !initialLoading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, initialLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md border border-gray-700">
          <h2 className="text-red-500 text-xl font-bold mb-4">Błąd</h2>
          <p className="text-gray-300 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
       
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Ładowanie...</p>
          {initialLoading && (
            <button
              onClick={() => setInitialLoading(false)}
              className="mt-4 text-indigo-400 underline text-sm"
            >
              Pomiń ładowanie
            </button>
          )}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-gray-300">
        <p>Przekierowywanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative flex flex-col items-center justify-center text-center text-white overflow-hidden">
     

      <div className="relative z-10 p-8 max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">
  System AI Voice dla Osób Starszych i Niepełnosprawnych
</h1>
<p className="text-lg text-gray-300 mb-10 leading-relaxed">
  Steruj urządzeniami domowymi za pomocą głosu. System wspiera osoby starsze 
  i niepełnosprawne, rozumiejąc proste komendy, tolerując wady wymowy i 
  reagując w czasie rzeczywistym. Włącz światło, zmień temperaturę lub 
  sprawdź status urządzeń - wystarczy jedno słowo.
</p>

        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg"
          >
            Zarejestruj się
          </Link>
          <Link
            href="/login"
            className="inline-block bg-transparent border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
          >
            Zaloguj się
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © {new Date().getFullYear()} SmartControl Robotics • All Rights Reserved
      </footer>
    </div>
  );
}
