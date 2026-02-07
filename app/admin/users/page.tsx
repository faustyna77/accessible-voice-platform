'use client';
import { useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignIn?: string;
  isAdmin: boolean;
  providerData: string[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Formularz dodawania użytkownika
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    isAdmin: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error: any) {
      showMessage('Błąd ładowania użytkowników: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      showMessage('Wypełnij email i hasło!', 'error');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Użytkownik dodany pomyślnie!');
        setNewUser({ email: '', password: '', displayName: '', isAdmin: false });
        setIsAddingUser(false);
        loadUsers();
      } else {
        showMessage('Błąd: ' + data.error, 'error');
      }
    } catch (error: any) {
      showMessage('Błąd: ' + error.message, 'error');
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${email}?`)) return;

    try {
      const response = await fetch(`/api/users/${uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Użytkownik usunięty!');
        loadUsers();
      } else {
        showMessage('Błąd: ' + data.error, 'error');
      }
    } catch (error: any) {
      showMessage('Błąd: ' + error.message, 'error');
    }
  };

  const handleToggleAdmin = async (uid: string, currentIsAdmin: boolean) => {
    try {
      const response = await fetch(`/api/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          currentIsAdmin 
            ? 'Odebrano uprawnienia admina' 
            : 'Nadano uprawnienia admina'
        );
        loadUsers();
      } else {
        showMessage('Błąd: ' + data.error, 'error');
      }
    } catch (error: any) {
      showMessage('Błąd: ' + error.message, 'error');
    }
  };

  const handleToggleDisabled = async (uid: string, currentDisabled: boolean) => {
    try {
      const response = await fetch(`/api/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: !currentDisabled }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          currentDisabled 
            ? 'Użytkownik odblokowany' 
            : 'Użytkownik zablokowany'
        );
        loadUsers();
      } else {
        showMessage('Błąd: ' + data.error, 'error');
      }
    } catch (error: any) {
      showMessage('Błąd: ' + error.message, 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.includes(searchTerm)
  );

  const getProviderIcon = (providers: string[]) => {
    if (providers.includes('google.com')) return '🔍';
    if (providers.includes('password')) return '📧';
    return '👤';
  };

  if (loading) {
    return <div className="text-white p-8">Ładowanie użytkowników...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Zarządzanie użytkownikami</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          ➕ Dodaj użytkownika
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Formularz dodawania użytkownika */}
      {isAddingUser && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Nowy użytkownik</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Hasło *</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="min. 6 znaków"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Nazwa (opcjonalnie)</label>
              <input
                type="text"
                value={newUser.displayName}
                onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                className="w-full bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jan Kowalski"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-white">Administrator</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddUser}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition"
            >
              ✓ Dodaj
            </button>
            <button
              onClick={() => {
                setIsAddingUser(false);
                setNewUser({ email: '', password: '', displayName: '', isAdmin: false });
              }}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition"
            >
              ✗ Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-4">
        <input
          type="text"
          placeholder="🔍 Szukaj po email, nazwie lub UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Wszyscy użytkownicy</div>
          <div className="text-3xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Administratorzy</div>
          <div className="text-3xl font-bold text-blue-400">
            {users.filter(u => u.isAdmin).length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Zweryfikowani</div>
          <div className="text-3xl font-bold text-green-400">
            {users.filter(u => u.emailVerified).length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Zablokowani</div>
          <div className="text-3xl font-bold text-red-400">
            {users.filter(u => u.disabled).length}
          </div>
        </div>
      </div>

      {/* Tabela użytkowników */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Użytkownik</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Provider</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Utworzono</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ostatnie logowanie</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.uid} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                        {getProviderIcon(user.providerData)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {user.displayName || 'Bez nazwy'}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="text-xs text-gray-500 font-mono">{user.uid}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.providerData.map((provider) => (
                      <span
                        key={provider}
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                      >
                        {provider === 'google.com' ? 'Google' : 'Email'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {user.lastSignIn 
                    ? new Date(user.lastSignIn).toLocaleDateString('pl-PL')
                    : 'Nigdy'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {user.isAdmin && (
                      <span className="px-2 py-1 bg-purple-600 rounded text-xs inline-block w-fit">
                        👑 Admin
                      </span>
                    )}
                    {user.emailVerified && (
                      <span className="px-2 py-1 bg-green-600 rounded text-xs inline-block w-fit">
                        ✓ Zweryfikowany
                      </span>
                    )}
                    {user.disabled && (
                      <span className="px-2 py-1 bg-red-600 rounded text-xs inline-block w-fit">
                        🚫 Zablokowany
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAdmin(user.uid, user.isAdmin)}
                      className={`px-3 py-1 rounded text-xs transition ${
                        user.isAdmin
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      title={user.isAdmin ? 'Odbierz uprawnienia admina' : 'Nadaj uprawnienia admina'}
                    >
                      {user.isAdmin ? '👑→👤' : '👤→👑'}
                    </button>
                    <button
                      onClick={() => handleToggleDisabled(user.uid, user.disabled)}
                      className={`px-3 py-1 rounded text-xs transition ${
                        user.disabled
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                      title={user.disabled ? 'Odblokuj użytkownika' : 'Zablokuj użytkownika'}
                    >
                      {user.disabled ? '🔓' : '🔒'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid, user.email || '')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                      title="Usuń użytkownika"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nie znaleziono użytkowników
          </div>
        )}
      </div>
    </div>
  );
}