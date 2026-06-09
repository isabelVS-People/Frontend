import { createContext, useContext, useState } from 'react';
import { users } from '../data/mockData';
import { setApiCountry } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  function loginDemo(userId) {
    const user = users.find(u => String(u.id) === String(userId));
    if (user) setCurrentUser(user);
    setApiCountry(user.country);
  }

  function logout() {
    setCurrentUser(null);
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