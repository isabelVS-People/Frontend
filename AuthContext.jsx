import { createContext, useContext, useState } from 'react';
import { users } from '../data/mockData';
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

// Setear el país ANTES del primer render, no en un useEffect  
const savedUser = getSavedUser();
if (savedUser?.country) {
  setApiCountry(savedUser.country);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(savedUser);

  function loginDemo(userId) {
    const user = users.find(u => String(u.id) === String(userId));
    if (user) {
      setCurrentUser(user);
      setApiCountry(user.country);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
