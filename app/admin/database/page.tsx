// ============================================
// app/admin/database/page.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import Database from '../vapi/Database';

export default function DatabasePage() {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  // Sprawdź uprawnienia admina
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdTokenResult();
      
      if (token.claims.admin) {
        setAllowed(true);
      } else {
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  if (!allowed) {
    return <p className="text-white p-8">Ładowanie...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
          >
            ← Powrót do panelu admina
          </Link>
          <h1 className="text-3xl font-bold">🔥 Firebase Realtime Database</h1>
          <p className="text-gray-400">
            Zarządzaj robotami i grupami w czasie rzeczywistym
          </p>
        </div>

        {/* Komponent Database */}
        <Database />
      </div>
    </div>
  );
}