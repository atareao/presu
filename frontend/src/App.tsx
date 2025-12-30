import React, { useContext, lazy, Suspense } from 'react';
import { ConfigProvider, theme } from 'antd';
import { BrowserRouter, Routes, Route } from "react-router";

import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es_antd from 'antd/locale/es_ES';
import va_antd from 'antd/locale/ca_ES';
import Backend from "i18next-http-backend";

import ModeContext, { ModeContextProvider } from '@/components/ModeContext';
import { AuthContextProvider } from "@/components/AuthContext";

import es_location from "@/assets/locales/es/translation.json";
import va_location from "@/assets/locales/va/translation.json";

import '@/App.css';
const PublicLayout = lazy(() => import('@/layouts/PublicLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
/** Public **/
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'));
/** Admin **/
const LogoutPage = lazy(() => import('@/pages/admin/LogoutPage'));
const AdminHomePage = lazy(() => import('@/pages/admin/AdminHomePage'));
const ProjectsPage = lazy(() => import('@/pages/admin/ProjectsPage'));
const BudgetsPage = lazy(() => import('@/pages/admin/BudgetsPage'));

// Inicialización de i18n
i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem("i18nextLng") || "es",
        fallbackLng: "es",
        debug: false,
        resources: {
            es: { translation: es_location },
            va: { translation: va_location }
        },
        interpolation: { escapeValue: false }
    });

/**
 * Componente que envuelve la lógica del tema y las rutas.
 * Debe estar dentro de ModeContextProvider para poder usar useContext.
 */
const AppContent = () => {
    const { isDarkMode } = useContext(ModeContext);
    const { i18n: i18nInstance } = useTranslation();

    const algorithm = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;

    const customTheme = {
        algorithm: algorithm,
        token: {
            colorPrimary: "#095eae",
            colorBgLayout: isDarkMode ? "#032342" : "#095eae",
            borderRadius: 6,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 16 // Un tamaño de 16px es muy estándar para apps de datos
        }
    };

    // Determinamos el idioma de Antd (es/va)
    const locale = i18nInstance.language.startsWith('es') ? es_antd : va_antd;

    return (
        <ConfigProvider theme={customTheme} locale={locale}>
            <BrowserRouter>
                <Suspense fallback={<div style={{ padding: 50, textAlign: 'center' }}>Loading...</div>}>
                    <Routes>
                        {/* Tus rutas se mantienen exactamente igual */}
                        <Route path="/" element={<PublicLayout />} >
                            <Route index element={<LoginPage />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />
                        </Route>
                        <Route path="/admin" element={<AdminLayout />} >
                            <Route index element={<AdminHomePage />} />
                            <Route path="logout" element={<LogoutPage />} />
                            <Route path="projects" element={<ProjectsPage />} />
                            <Route path="budgets" element={<BudgetsPage />} />
                        </Route>                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ConfigProvider>
    );
};

/**
 * Componente Principal
 */
const App: React.FC = () => {
    return (
        <AuthContextProvider>
            <ModeContextProvider>
                <AppContent />
            </ModeContextProvider>
        </AuthContextProvider>
    );
};

export default App;
