import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Navigate } from "react-router";
import { Flex, Card, Input, Button, Form, Alert, Typography, Spin } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { hashSync } from 'bcrypt-ts';

import AuthContext from '@/components/AuthContext';
import { BASE_URL } from '@/constants';
import { debounce } from "@/common/utils";
import Logo from "@/assets/logo.svg";

const { Title } = Typography;

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const { isLoggedIn, role, login: authLogin } = useContext(AuthContext);

    const [form] = Form.useForm();
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [usersCount, setUsersCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUsersCount = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/v1/stats/users`);
                if (response.ok) {
                    const result = await response.json();
                    setUsersCount(result.users || 0);
                } else {
                    setUsersCount(1); // Fallback to prevent registration if stats are down
                }
            } catch (error) {
                setUsersCount(1); // Fallback to prevent registration
            } finally {
                setLoading(false);
            }
        };
        fetchUsersCount();
    }, []);

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
        if (values.password !== values.confirm_password) {
            displayMessage(t("Las contraseñas no coinciden"), 'error');
            return;
        }
        setSubmitting(true);
        try {
            const hashedPassword = hashSync(values.password, 10);
            const data = {
                username: values.username,
                email: values.email,
                hashed_password: hashedPassword,
                role_id: 1, // First user will be admin
                is_active: true,
            };

            const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseJson = await response.json();

            if (response.ok) {
                authLogin(responseJson.data.token);
            } else {
                displayMessage(responseJson.message || t("Error en el registro"), 'error');
            }
        } catch (error) {
            displayMessage(t("Error de conexión con el servidor"), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || usersCount === null) {
        return <Spin fullscreen />;
    }

    if (usersCount > 0) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Flex
            justify="center"
            align="center"
            vertical
        >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <img
                    src={Logo}
                    alt="Logo"
                    style={{ width: 180, marginBottom: 10 }}
                />
            </div>
            <Card
                title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>{t('Registrar usuario')}</Title>}
                style={{ width: '100%', maxWidth: 380, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 12 }}
            >
                <Form
                    form={form}
                    name="register_form"
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
                        name="username"
                        rules={[{ required: true, message: t('Por favor introduce tu nombre de usuario') }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                            placeholder={t('Nombre de usuario')}
                        />
                    </Form.Item>
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
                    <Form.Item
                        name="confirm_password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: t('Por favor introduce de nuevo tu contraseña') },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('Las contraseñas no coinciden')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                            placeholder={t('Confirmar contraseña')}
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, marginTop: 10 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitting}
                            style={{ fontWeight: 600, height: 45 }}
                        >
                            {t('Registrar')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
};

export default RegisterPage;
