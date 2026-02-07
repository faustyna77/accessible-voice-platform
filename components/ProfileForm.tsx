'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../app/lib/firebase';
import { updateUserProfile, getUserProfile, updateUserPassword } from '../app/lib/auth';

const ProfileForm: React.FC = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Dane profilu
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  
  // Zmiana hasła
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setName(profile.name || '');
        setBio(profile.bio || '');
        setCompany(profile.company || '');
        setPhone(profile.phone || '');
      }
    } catch (err) {
      console.error('Błąd ładowania profilu:', err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({ name, bio, company, phone });
      setSuccess('Profil zaktualizowany pomyślnie!');
    } catch (err: any) {
      setError('Nie udało się zaktualizować profilu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserPassword(newPassword);
      setSuccess('Hasło zmienione pomyślnie!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError('Nie udało się zmienić hasła');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Profil użytkownika
          </h3>

          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informacje profilu */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Informacje osobiste</h4>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email (tylko do odczytu)
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Firma/Organizacja
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio/Opis
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Opowiedz coś o sobie..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Zapisywanie...' : 'Zaktualizuj profil'}
                </button>
              </form>
            </div>

            {/* Zmiana hasła */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Zmiana hasła</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nowe hasło
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Minimum 6 znaków"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Potwierdź nowe hasło
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Powtórz nowe hasło"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Zmienianie...' : 'Zmień hasło'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Uwaga:</strong> Po zmianie hasła zostaniesz wylogowany i będziesz musiał zalogować się ponownie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;