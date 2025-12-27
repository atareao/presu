import React, { useState, useContext, useCallback } from 'react';
import { Navigate } from "react-router";
import { Flex, Card, Input, Button, Form, Alert, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";

import AuthContext from '@/components/AuthContext';
import { BASE_URL } from '@/constants';
import { debounce } from "@/common/utils";
import Logo from "@/assets/logo.svg";

const { Title } = Typography;

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const { isLoggedIn, role, login: authLogin } = useContext(AuthContext);
    
    const [form] = Form.useForm();
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [loading, setLoading] = useState(false);

    // Redirección si ya está autenticado
    if (isLoggedIn) {
        return <Navigate to={role === "admin" ? "/admin/" : "/"} replace />;
    }

    const hideMessage = useCallback(debounce(() => {
        setShowMessage(false);
    }, 3000), []);

    const displayMessage = (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
        setShowMessage(true);
        setMessageText(text);
        setMessageType(type);
        hideMessage();
    };


    const onFinish = async (values: any) => {
        setLoading(true);
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const responseJson = await response.json();

            if (response.ok) {
                // authLogin guarda el token y actualiza el estado global
                authLogin(responseJson.data.token);
            } else {
                displayMessage(responseJson.message || t("Error al iniciar sesión"), 'error');
            }
        } catch (error) {
            displayMessage(t("Error de conexión con el servidor"), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex 
            justify="center" 
            align="center" 
            vertical 
            style={{ minHeight: '100vh', padding: '20px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <img 
                    src={Logo} 
                    alt="Logo" 
                    style={{ width: 180, marginBottom: 10 }} 
                />
            </div>

            <Card 
                title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>{t('Iniciar sesión')}</Title>}
                style={{ width: '100%', maxWidth: 380, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 12 }}
            >
                <Form
                    form={form}
                    name="login_form"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    {showMessage && (
                        <Alert
                            description={messageText}
                            type={messageType}
                            showIcon
                            closable
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: t('Por favor introduce tu email') },
                            { type: 'email', message: t('Formato de email no válido') }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} 
                            placeholder={t('Correo electrónico')} 
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: t('Por favor introduce tu contraseña') }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                            placeholder={t('Contraseña')}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 10 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{ fontWeight: 600, height: 45 }}
                        >
                            {t('Acceder')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
};

export default LoginPage;
