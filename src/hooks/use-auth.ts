'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  isAuthenticated: boolean;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for user data
    try {
      const userData = localStorage.getItem('querywing-user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.isAuthenticated) {
          setUser(parsedUser);
          // Keep session alive with sliding expiration
          const token = localStorage.getItem('querywing-session');
          if (token) {
            fetch(`/api/auth/session?token=${encodeURIComponent(token)}`)
              .catch(() => {})
          }
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    setIsLoaded(true);
  }, []);

  const signOut = () => {
    localStorage.removeItem('querywing-user');
    setUser(null);
    router.push('/');
  };

  const refreshUser = () => {
    try {
      const userData = localStorage.getItem('querywing-user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.isAuthenticated) {
          setUser(parsedUser);
          const token = localStorage.getItem('querywing-session');
          if (token) {
            fetch(`/api/auth/session?token=${encodeURIComponent(token)}`)
              .catch(() => {})
          }
          return;
        }
      }
      setUser(null);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setUser(null);
    }
  };

  return {
    user,
    isLoaded,
    signOut,
    refreshUser,
  };
}
