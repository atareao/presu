import React, { useState, useMemo, useCallback } from 'react';

export interface ModeContextInterface {
    isDarkMode: boolean;
    toggleMode: () => void;
}

const ModeContext = React.createContext<ModeContextInterface>({
    isDarkMode: true,
    toggleMode: () => {},
});

interface Props {
    children: React.ReactNode;
}

export const ModeContextProvider: React.FC<Props> = ({ children }) => {
    // Inicialización perezosa (lazy initial state) para leer de localStorage solo una vez
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const mode = localStorage.getItem("mode");
        // Si no existe, por defecto es true (dark)
        return mode === null ? true : mode === "dark";
    });

    const toggleMode = useCallback(() => {
        setIsDarkMode((prevMode) => {
            const nextMode = !prevMode;
            localStorage.setItem("mode", nextMode ? "dark" : "light");
            console.log(`Change isDarkMode to ${nextMode}`);
            return nextMode;
        });
    }, []);

    // Memorizamos el valor para evitar re-renders innecesarios en los consumidores
    const contextValue = useMemo(() => ({
        isDarkMode,
        toggleMode
    }), [isDarkMode, toggleMode]);

    return (
        <ModeContext.Provider value={contextValue}>
            {children}
        </ModeContext.Provider>
    );
};

export default ModeContext;
