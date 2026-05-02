import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  profileId?: number;
  profileName?: string;
}

export interface UserPermission {
  idModule: number;
  name: string;
  key_add: boolean | number;
  key_edit: boolean | number;
  key_delete: boolean | number;
  key_export: boolean | number;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermission[];
  login: (user: User) => void;
  setPermissions: (permissions: UserPermission[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [permissions, setPermissionsState] = useState<UserPermission[]>(() => {
    const storedPerms = localStorage.getItem('permissions');
    return storedPerms ? JSON.parse(storedPerms) : [];
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const setPermissions = (newPermissions: UserPermission[]) => {
    setPermissionsState(newPermissions);
    localStorage.setItem('permissions', JSON.stringify(newPermissions));
  };

  const logout = () => {
    setUser(null);
    setPermissionsState([]);
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, permissions, login, setPermissions, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
