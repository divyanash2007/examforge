import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize user from token ONCE on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry?
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({ ...decoded, token });
                } else {
                    localStorage.removeItem("token");
                }
            } catch (e) {
                console.error("Invalid token on mount", e);
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []); // Empty dependency array = run once

    const login = async (email, password) => {
        console.log("LOGIN PAYLOAD:", { email, password });
        try {
            const res = await api.post("/auth/login", {
                email: email,
                password: password,
            });

            console.log("LOGIN RESPONSE:", res.data);

            const { access_token } = res.data;
            localStorage.setItem("token", access_token);

            // Decode and Update State
            const decoded = jwtDecode(access_token);
            setUser({ ...decoded, token: access_token });

        } catch (e) {
            console.error("LOGIN FAILED:", e.response ? e.response.data : e);
            throw e;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
