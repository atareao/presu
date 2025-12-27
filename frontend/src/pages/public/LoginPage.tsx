import React, { useState, useContext } from 'react';
import { Navigate } from "react-router";
import { Flex } from 'antd';

import AuthContext from '@/components/AuthContext';
import { BASE_URL } from '@/constants';
import Logo from "@/assets/logo.svg";
import SignIn from "@/components/SignIn";

// Definición de tipos para los datos de usuario
interface UserData {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    // 1. Acceso al contexto de autenticación mediante hooks
    const { isLoggedIn, role, login: authLogin } = useContext(AuthContext);

    // 2. Estado local simplificado
    const [responseMessage, setResponseMessage] = useState<string>("");

    // Función para manejar el envío del formulario
    const handleSubmit = (userData: UserData) => {
        console.log("Submitting user data:", userData);
        login(userData.email, userData.password);
    };

    // Lógica de autenticación con la API
    const login = async (email: string, password: string) => {
        console.log("Logging in user");
        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const responseJson = await response.json();

            if (response.ok) {
                // El token se guarda en el contexto y localStorage dentro de authLogin
                authLogin(responseJson.data.token);
                setResponseMessage(responseJson.message);
            } else {
                console.error('Login failed:', responseJson);
                setResponseMessage(responseJson.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage("Error logging in user");
        }
    };

    // 3. Lógica de redirección (reemplaza los bloques condicionales del render)
    if (isLoggedIn) {
        console.log(`Role: ${role}`);
        return <Navigate to={role === "admin" ? "/admin/" : "/"} replace />;
    }

    return (
        <Flex justify="center" align="center" style={{ minHeight: '100%' }}>
            <Flex gap="middle" align="center" vertical>
                <img 
                    src={Logo} 
                    alt="Logo" 
                    style={{ width: 200, marginBottom: 20 }} 
                />
                <SignIn
                    onSubmit={handleSubmit}
                    responseMessage={responseMessage}
                />
            </Flex>
        </Flex>
    );
};

export default LoginPage;
