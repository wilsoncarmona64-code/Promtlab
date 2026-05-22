import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
  isPremium: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('promtlab_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (email: string, name?: string) => {
    if (!email.includes('@')) throw new Error('Email inválido');
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email, name, createdAt: Date.now(), isPremium: false,
    };
    localStorage.setItem('promtlab_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('promtlab_user');
    setUser(null);
  }, []);

  return {
    user, loading,
    isAuthenticated: !!user,
    isPremium: user?.isPremium ?? false,
    register, logout,
  };
}