import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "./types";
import {
  getUser,
  getAuthToken,
  saveUser,
  saveAuthToken,
  clearUser,
  clearAuthToken,
  createMockJWT,
  parseMockJWT,
} from "./auth-utils";
import { mockApi } from "./mock-api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize demo users on first load
  useEffect(() => {
    const existingUsers = localStorage.getItem("pactle_users");
    if (!existingUsers) {
      const demoUsers = [
        {
          id: "user_1",
          name: "Abhinav Sharma",
          email: "manager@pactle.com",
          password: "password",
          role: "manager",
        },
        {
          id: "user_2",
          name: "Aakash Mishra",
          email: "sales@pactle.com",
          password: "password",
          role: "sales_rep",
        },
        {
          id: "user_3",
          name: "Ramesh Verma",
          email: "viewer@pactle.com",
          password: "password",
          role: "viewer",
        },
      ];
      localStorage.setItem("pactle_users", JSON.stringify(demoUsers));
    }
  }, []);

  // Restore auth on mount
  useEffect(() => {
    const savedUser = getUser();
    const token = getAuthToken();

    if (savedUser && token) {
      const parsed = parseMockJWT(token);
      if (parsed) {
        setUser(savedUser);
      } else {
        clearUser();
        clearAuthToken();
      }
    }

    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await mockApi.validateCredentials(email, password);
      const newUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      const token = createMockJWT(newUser);
      saveUser(newUser);
      saveAuthToken(token);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await mockApi.createUser(
        name,
        email,
        password,
        "viewer",
      );
      const newUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      const token = createMockJWT(newUser);
      saveUser(newUser);
      saveAuthToken(token);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    clearUser();
    clearAuthToken();
    setUser(null);
  };

  const switchRole = (role: Role) => {
    if (user) {
      const updatedUser = { ...user, role };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
