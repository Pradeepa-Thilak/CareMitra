import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ Safe JSON parse
  const safeParse = (value) => {
    try {
      return value && value !== "undefined" ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    const parsedUser = safeParse(storedUser);
    if (parsedUser && storedToken) {
      setUser(parsedUser);
      setToken(storedToken);
    } else {
      // Clear invalid or corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setRole(userData.role);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    const parsedUser = safeParse(storedUser);
    if (parsedUser && storedToken) {
      setUser(parsedUser);
      setToken(storedToken);
      setRole(parsedUser.role); // ✅ store role from user object
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  }, []);

  


  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
