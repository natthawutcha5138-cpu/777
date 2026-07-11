import { createContext, useContext } from "react";
import type { AuthUser } from "@/hooks/useAuth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}
