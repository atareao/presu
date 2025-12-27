import React from 'react';
import { useTranslation } from "react-i18next";
import { Card, Input, Button, Form, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

interface SignInProps {
    onSubmit: (userData: any) => void;
    responseMessage: string;
}

const SignIn: React.FC<SignInProps> = ({ onSubmit, responseMessage }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    // Antd Form nos da directamente los valores validados
    const onFinish = (values: any) => {
        console.log("Form values:", values);
        onSubmit(values);
    };

    return (
        <Card
            title={t('Login')}
            style={{ width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
            <Form
                form={form}
                name="login_form"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                {/* Campo Email con validación */}
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: t('Por favor introduce tu email') },
                        { type: 'email', message: t('El formato no es un email válido') }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder={t('Email')}
                        size="large"
                    />
                </Form.Item>

                {/* Campo Password */}
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: t('Por favor introduce tu contraseña') }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder={t('Password')}
                        size="large"
                    />
                </Form.Item>

                {/* Mensaje de error de la API si existe */}
                {responseMessage && (
                    <Form.Item>
                        <Alert
                            message={responseMessage}
                            type="error"
                            showIcon
                            closable
                        />
                    </Form.Item>
                )}

                <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                    >
                        {t('Sign in')}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default SignIn;
