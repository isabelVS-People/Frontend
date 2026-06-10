import { createContext, useContext, useState } from 'react';
import { setApiCountry } from '../utils/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'visma_current_user';

function getSavedUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Restaurar país ANTES del primer render
const savedUser = getSavedUser();
if (savedUser?.country) setApiCountry(savedUser.country);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(savedUser);

  async function login(email, password) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://backend-production-62417.up.railway.app'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Credenciales inválidas');

    const user = await res.json();
    setCurrentUser(user);
    setApiCountry(user.country);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
