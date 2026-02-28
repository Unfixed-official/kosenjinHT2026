import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    uid: 'local-user-1',
    displayName: 'Local Creator'
  });
  const [initializing] = useState(false);

  const resetUser = () => {
    const seed = Date.now().toString(36).slice(-6);
    setUser({
      uid: `local-user-${seed}`,
      displayName: `Local Creator ${seed}`
    });
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      resetUser
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
