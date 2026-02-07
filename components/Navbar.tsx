'use client';

import { useAuth } from '../app/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../app/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Power, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <nav className="bg-[#0a0a0f] border-b border-gray-800 h-16 flex items-center justify-center text-gray-400 font-mono">
        Loading system...
      </nav>
    );
  }

  return (
    <nav className="bg-[#0a0a0f] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-indigo-500" />
            <Link
              href="/"
              className="text-xl font-semibold text-gray-100 tracking-wide hover:text-indigo-400 transition"
            >
              AI Voice System
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:space-x-6 mt-2 md:mt-0">
            {user ? (
              <>
                {/* --- Mobile Robots --- */}
             

                {/* --- Robotic Arm --- */}
               

                {/* --- System --- */}
              

                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                    pathname === '/dashboard'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-300 hover:text-indigo-300 hover:border-gray-700'
                  }`}
                >
                  Voice AI
                </Link>


                {/* --- DESKTOP LOGOUT BUTTON --- */}
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-600 text-red-500 hover:text-red-400 hover:border-red-500 transition flex items-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  {logoutLoading ? 'Disconnecting...' : 'Logout'}
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-indigo-400 focus:outline-none"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-800 pt-3">
            
            <div>
             
              
            

             
            </div>

            <div>
            
             
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
                System
              </p>
            
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-indigo-400 text-sm"
              >
                Voice AI
              </Link>

             
            </div>

            <div className="border-t border-gray-800 pt-3">
              <div className="px-3 py-2 text-xs text-gray-500 font-mono">
                {user.displayName || user.email}
              </div>

              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full text-left px-3 py-2 text-red-500 hover:text-red-400 text-sm"
              >
                {logoutLoading ? 'Disconnecting...' : 'Logout'}
              </button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}
