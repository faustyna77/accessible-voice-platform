'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

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
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Ładowanie...</p>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/admin/vapi',
      icon: '🎛️',
      title: 'Zarządzanie Vapi',
      description: 'Dodawaj endpointy, przypisuj je do agentów AI, zarządzaj konfiguracją głosową',
      color: 'blue',
    },
    {
      href: '/admin/database',
      icon: '🗄️',
      title: 'Baza danych',
      description: 'Zarządzaj danymi w Firebase, przeglądaj rekordy',
      color: 'green',
    },
    {
      href: '/admin/users',
      icon: '👥',
      title: 'Użytkownicy',
      description: 'Zarządzaj kontami użytkowników i uprawnieniami',
      color: 'yellow',
    },
    {
      href: '/admin/startup-test',
      icon: '🚀',
      title: 'Test uruchomieniowy',
      description: 'Przeprowadź kompleksowy test systemu przed uruchomieniem',
      color: 'orange',
    },
    {
      href: '/admin/developer-guide',
      icon: '📚',
      title: 'Instruktaż developera',
      description: 'Przewodnik po konfiguracji i wdrażaniu nowych urządzeń',
      color: 'cyan',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'hover:border-blue-500 hover:shadow-blue-500/20',
      green: 'hover:border-green-500 hover:shadow-green-500/20',
      purple: 'hover:border-purple-500 hover:shadow-purple-500/20',
      yellow: 'hover:border-yellow-500 hover:shadow-yellow-500/20',
      orange: 'hover:border-orange-500 hover:shadow-orange-500/20',
      cyan: 'hover:border-cyan-500 hover:shadow-cyan-500/20',
    };
    return colors[color] || 'hover:border-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Panel Developera
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Kompleksowe narzędzie do zarządzania systemem AI Voice. 
            Wybierz moduł poniżej, aby rozpocząć konfigurację.
          </p>
        </div>

        {/* Menu Grid - Lepszy układ dla 5 kart */}
        <div className="max-w-5xl mx-auto">
          {/* Pierwszy rząd - 3 karty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {menuItems.slice(0, 3).map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 
                    cursor-pointer transition-all duration-300 
                    border border-gray-700 
                    ${getColorClasses(item.color)}
                    hover:scale-105 hover:shadow-2xl
                    transform h-full
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Icon */}
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Drugi rząd - 2 karty (wycentrowane) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {menuItems.slice(3, 5).map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 
                    cursor-pointer transition-all duration-300 
                    border border-gray-700 
                    ${getColorClasses(item.color)}
                    hover:scale-105 hover:shadow-2xl
                    transform h-full
                  `}
                  style={{
                    animationDelay: `${(index + 3) * 100}ms`,
                  }}
                >
                  {/* Icon */}
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">5</div>
            <div className="text-gray-400 text-sm">Modułów dostępnych</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-400 text-sm">Dostępność systemu</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
            <div className="text-gray-400 text-sm">Możliwości konfiguracji</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span>
            <span>Szybkie akcje</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/admin/vapi"
              className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 transition border border-gray-700 hover:border-blue-500"
            >
              <div className="font-semibold mb-1">➕ Utwórz nowego agenta</div>
              <div className="text-xs text-gray-400">Dodaj nowego asystenta AI do systemu</div>
            </Link>
            <Link
              href="/admin/startup-test"
              className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 transition border border-gray-700 hover:border-orange-500"
            >
              <div className="font-semibold mb-1">🧪 Przetestuj system</div>
              <div className="text-xs text-gray-400">Sprawdź działanie wszystkich modułów</div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/developer-guide"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <span>📖</span>
            <span>Potrzebujesz pomocy? Zobacz instruktaż developera</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
