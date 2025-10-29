import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginData, RegisterData } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to fetch current user from API to verify token is still valid
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          // Check if there's a stored user (fallback)
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        // Token is invalid or expired, clear storage
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await authService.login(data);
      setUser(response.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${response.user.name}!`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
