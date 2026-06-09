import { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken, getToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehidratar sesión al recargar página
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then(user => setCurrentUser(user))
        .catch(() => { setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.auth.login(email, password);
    setToken(token);
    setCurrentUser(user);
    return user;
  };

  // Login demo (mock) — para el selector de usuarios del login
  const loginDemo = (userId) => {
    const { users } = require('../data/mockData');
    const user = users.find(u => u.id === parseInt(userId));
    if (user) setCurrentUser(user);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, loginDemo, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
