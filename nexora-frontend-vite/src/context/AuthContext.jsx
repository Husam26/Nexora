import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // add `id` alias for frontend convenience
        setUser({ ...res.data, id: res.data._id });
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser({ ...data.user, id: data.user.id });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
