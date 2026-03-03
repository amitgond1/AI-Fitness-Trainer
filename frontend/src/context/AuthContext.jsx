import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, clearAuth, getStoredAuth, storeAuth } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuth(getStoredAuth());
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(payload);
      const authPayload = { token: data.token, user: data.user };
      storeAuth(authPayload, payload.rememberMe);
      setAuth(authPayload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authApi.signup(payload);
      const authPayload = { token: data.token, user: data.user };
      storeAuth(authPayload, true);
      setAuth(authPayload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("logout request failed", error?.message);
    }
    clearAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      loading,
      login,
      signup,
      logout,
      setAuth
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
