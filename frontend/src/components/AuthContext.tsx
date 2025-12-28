import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';

// Extendemos la interfaz para incluir el rol del token
interface CustomJwtPayload extends JwtPayload {
    role: string;
}

export interface AuthContextInterface {
    token: string | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    role: string;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextInterface>({
    token: null,
    isLoggedIn: false,
    isAdmin: false,
    role: "",
    login: () => {},
    logout: () => {}
});

interface Props {
    children: React.ReactNode;
}

// Función auxiliar fuera del componente para calcular el tiempo restante
const calculateRemainingTime = (expirationTime: number) => {
    const remainingTime = expirationTime * 1000 - new Date().getTime();
    return remainingTime;
};

export const AuthContextProvider: React.FC<Props> = ({ children }) => {
    // Inicialización del estado basada en el almacenamiento local
    const [authState, setAuthState] = useState<{
        token: string | null;
        role: string;
        isLoggedIn: boolean;
        isAdmin: boolean;
    }>(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded = jwtDecode<CustomJwtPayload>(storedToken);
                console.log("Decoded:", decoded);
                const expirationTime = decoded.exp ? decoded.exp : 0;
                const remainingTime = calculateRemainingTime(expirationTime);

                if (remainingTime > 0) {
                    return {
                        token: storedToken,
                        role: decoded.role || "",
                        isLoggedIn: true,
                        isAdmin: decoded.role === "admin"
                    };
                }
            } catch (error) {
                console.error("Error decoding stored token", error);
            }
        }
        localStorage.removeItem("token");
        return { token: null, role: "", isLoggedIn: false, isAdmin: false };
    });

    const logoutHandler = useCallback(() => {
        localStorage.removeItem("token");
        setAuthState({ token: null, role: "", isLoggedIn: false, isAdmin: false });
        window.history.pushState({}, "", "/login");
    }, []);

    const loginHandler = useCallback((token: string) => {
        try {
            const decoded = jwtDecode<CustomJwtPayload>(token);
            localStorage.setItem("token", token);
            
            const expirationTime = decoded.exp ? decoded.exp : 0;
            const remainingTime = calculateRemainingTime(expirationTime);

            if (remainingTime <= 0) {
                logoutHandler();
                return;
            }

            setAuthState({
                token: token,
                role: decoded.role || "",
                isLoggedIn: true,
                isAdmin: decoded.role === "admin"
            });
        } catch (error) {
            console.error("Invalid token provided", error);
        }
    }, [logoutHandler]);

    // Efecto para manejar el temporizador de auto-logout
    useEffect(() => {
        if (authState.token) {
            const decoded = jwtDecode<CustomJwtPayload>(authState.token);
            const remainingTime = calculateRemainingTime(decoded.exp || 0);
            
            const timer = setTimeout(logoutHandler, remainingTime);
            return () => clearTimeout(timer); // Limpieza al desmontar o cambiar token
        }
    }, [authState.token, logoutHandler]);

    const contextValue = useMemo(() => ({
        token: authState.token,
        role: authState.role,
        isLoggedIn: authState.isLoggedIn,
        isAdmin: authState.isAdmin,
        login: loginHandler,
        logout: logoutHandler
    }), [authState, loginHandler, logoutHandler]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
