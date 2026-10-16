import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem("restock-token")));
  useEffect(() => {
    let active = true;
    if (sessionStorage.getItem("restock-token")) {
      axiosClient.get("/auth/me").then(({ data }) => { if (active) setUser(data.user); })
        .catch(() => { sessionStorage.removeItem("restock-token"); })
        .finally(() => { if (active) setLoading(false); });
    }
    const expire = () => { setUser(null); sessionStorage.removeItem("restock-token"); };
    window.addEventListener("restock-session-expired", expire);
    return () => { active = false; window.removeEventListener("restock-session-expired", expire); };
  }, []);
  async function authenticate(mode, credentials) {
    const { data } = await axiosClient.post(`/auth/${mode}`, credentials);
    sessionStorage.setItem("restock-token", data.token);
    setUser(data.user);
  }
  function logout() { sessionStorage.removeItem("restock-token"); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
