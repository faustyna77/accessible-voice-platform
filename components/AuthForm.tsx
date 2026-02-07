'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail, loginWithEmail, loginWithGoogle, getUserRole } from '../app/lib/auth';
import Image from 'next/image';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRedirectByRole = async () => {
    const role = await getUserRole();
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }

      // ✅ Pobieramy rolę i przekierowujemy
      await handleRedirectByRole();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle();

      // ✅ Google login też sprawdza rolę
      await handleRedirectByRole();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      

      {/* Formularz logowania/rejestracji */}
      <div className="relative z-10 max-w-md w-full bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </h2>

          <div className="mt-3 text-sm text-gray-400 space-y-1">
            <div>
              {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
              <a
                href={mode === 'login' ? '/register' : '/login'}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
              </a>
            </div>
            {mode === 'login' && (
              <div>
                <a
                  href="/reset-password"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Zapomniałeś hasła?
                </a>
              </div>
            )}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Imię i nazwisko
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Faustyna Misiura"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faustyna@example.com"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Hasło
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 znaków"
                minLength={6}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'
              )}
            </button>

            <div className="flex items-center justify-center my-2">
              <div className="border-t border-gray-700 w-full" />
              <span className="px-2 text-gray-500 text-sm">lub</span>
              <div className="border-t border-gray-700 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-2 px-4 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Kontynuuj z Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
