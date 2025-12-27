import React from 'react';
import { Outlet, useNavigate } from 'react-router'; // Asegúrate de usar react-router-dom
import { Button, Layout, theme } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

import ModeSwitcher from '@/components/ModeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import backgroundImageURL from '@/assets/backgrounds/public-background.jpg';
import { VERSION } from "@/constants";

const { Header, Footer, Content } = Layout;
const TITLE = `Presu (${VERSION})`;

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const { token } = theme.useToken();

    return (
        <Layout style={{
            backgroundImage: `linear-gradient(rgba(6, 94, 166, 0.55), rgba(6, 94, 166, 0.55)), url(${backgroundImageURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Header
                style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    backgroundColor: token.colorBgLayout,
                }}
            >
                <Button
                    variant="solid"
                    onClick={() => navigate('/login')}
                    style={{ marginRight: 8 }} // Añadido un pequeño margen
                >
                    <LoginOutlined />
                </Button>
                <LanguageSwitcher />
                <ModeSwitcher />
            </Header>

            <Content style={{
                paddingTop: 150,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowY: 'auto',
            }}>
                <Outlet />
            </Content>

            <Footer style={{
                padding: 5,
                height: 30,
                fontSize: 14,
                textAlign: 'center',
                backgroundColor: token.colorBgLayout,
            }}>
                ©{new Date().getFullYear()} {TITLE}
            </Footer>
        </Layout>
    );
};

export default PublicLayout;
