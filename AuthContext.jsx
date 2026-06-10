import { createContext, useContext, useState } from 'react';
import { setApiCountry, setApiToken } from '../utils/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'visma_current_user';
const TOKEN_KEY = 'visma_token';

function getSavedUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

// Restaurar sesión ANTES del primer render
const savedUser = getSavedUser();
const savedToken = localStorage.getItem(TOKEN_KEY);
if (savedUser?.country) setApiCountry(savedUser.country);
if (savedToken) setApiToken(savedToken);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(savedUser);

  async function login(email, password) {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://backend-production-62417.up.railway.app'}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );
    if (!res.ok) throw new Error('Credenciales inválidas');

    const { token, user } = await res.json();

    setApiToken(token);
    setApiCountry(user.country);
    setCurrentUser(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  function logout() {
    setCurrentUser(null);
    setApiToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
