import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add this after imports and before AuthProvider definition
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check token and load user info if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('http://localhost:8000/auth/users/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Token invalid or expired - clean up
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login method: gets token and user info, sets auth state
  const login = async (username: string, password: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);  // username = email in your backend
      params.append('password', password);

      const response = await axios.post('http://localhost:8000/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const userResponse = await axios.get('http://localhost:8000/auth/users/me');
      setUser(userResponse.data);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  // Register method: sends user info, then auto-login
  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post('http://localhost:8000/auth/register', {
        username,
        email,
        password,
      });
      // Auto-login immediately after successful registration
      await login(email, password);  // use email here because backend uses email as username
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  // Logout: clear token, auth header, and user info
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
