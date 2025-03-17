"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  
  const [isAuth, setIsAuth] = useState(() => {
    if (typeof window !== "undefined") {
      const storedAuth = window.localStorage.getItem("isAuth");
      return storedAuth ? JSON.parse(storedAuth) : false;
    }
  });

  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      const storedRole = window.localStorage.getItem("role");
      return storedRole || "guest";
    }
  });

  const updateAuthStatus = (newStatus, newRole = "guest") => {
    setIsAuth(newStatus);
    setRole(newRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("isAuth", JSON.stringify(newStatus));
      window.localStorage.setItem("role", newRole);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("isAuth", JSON.stringify(isAuth));
      window.localStorage.setItem("role", role);
    }
  }, [isAuth, role]);

  return (
    <AuthContext.Provider value={{ isAuth, role, updateAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
