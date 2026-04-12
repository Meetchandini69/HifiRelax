import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface User { id: number; email: string; name: string; role: string; account_type?: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, account_type?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ec_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.me().then(setUser).catch(() => { localStorage.removeItem("ec_token"); setToken(null); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem("ec_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string, account_type?: string) => {
    const data = await api.register({ email, password, name, account_type });
    localStorage.setItem("ec_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("ec_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    const u = await api.me();
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
