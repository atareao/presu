import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useNavigate, Navigate, Outlet, useLocation } from 'react-router';
import { Button, Layout, Menu, Image, theme, Typography, Flex } from 'antd';
import type { MenuProps } from 'antd';
import {
    TeamOutlined,
    LogoutOutlined,
    UserOutlined,
    ClusterOutlined,
    BookOutlined,
    SettingOutlined,
    AppstoreOutlined,
    TagsOutlined,
    BranchesOutlined,
    PushpinOutlined,
    SafetyCertificateOutlined,
    CarOutlined,
    InboxOutlined,
    DeploymentUnitOutlined,
    PartitionOutlined,
} from '@ant-design/icons';

import ModeSwitcher from '@/components/ModeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AuthContext from '@/components/AuthContext';
import logo from '@/assets/logo.svg';
import backgroundImageURL from '@/assets/backgrounds/admin-background.jpg';
import { VERSION } from "@/constants";

const { Header, Content, Footer, Sider } = Layout;
const TITLE = `Presu (${VERSION})`;
const ROLE = "admin";

type MenuItem = Required<MenuProps>['items'][number];
export type CustomMenuItem = MenuItem & {
    navigateTo?: string; // Propiedad añadida para la navegación
    children?: CustomMenuItem[]; // Aseguramos que los hijos también sean CustomMenuItem
}

const MENU_ITEMS: CustomMenuItem[] = [
    {
        key: "sub1",
        label: "Admin",
        icon: <SettingOutlined />,
        children: [
            {
                key: "sub1-1",
                label: "Proyectos",
                icon: <ClusterOutlined />,
                navigateTo: "/admin/projects",
            },
            {
                key: "sub1-2",
                label: "Presupuestos",
                icon: <BookOutlined />,
                navigateTo: "/admin/budgets",
            },
        ]
    }
];


const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { isLoggedIn, role } = useContext(AuthContext);

    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    // Lógica para encontrar las claves del menú basadas en la ruta actual
    const selectedKeys = useMemo(() => {
        const currentPath = location.pathname.split('?')[0];
        let foundKey: string[] = [];
        let foundOpenKeys: string[] = [];

        const findMatch = (items: any[], parentKeys: string[] = []) => {
            for (const item of items) {
                if (item.navigateTo && currentPath.startsWith(item.navigateTo)) {
                    foundKey = [item.key];
                    foundOpenKeys = parentKeys;
                }
                if (item.children) {
                    findMatch(item.children, [...parentKeys, item.key]);
                }
            }
        };

        findMatch(MENU_ITEMS);
        // Actualizamos las openKeys solo cuando cambia la ruta para expandir el menú correcto
        if (foundOpenKeys.length > 0) setOpenKeys(foundOpenKeys);
        return foundKey;
    }, [location.pathname]);

    // Redirección de seguridad
    if (!isLoggedIn || role !== ROLE) {
        return <Navigate to="/login" replace />;
    }
    return (
        <Layout style={{
            minHeight: '100vh',
            backgroundImage: `linear-gradient(rgba(0, 21, 41, 0.7), rgba(0, 21, 41, 0.7)), url(${backgroundImageURL})`,
            backgroundSize: 'cover',        // Asegura que ocupe todo el espacio 16:9
            backgroundPosition: 'center',   // Centra la imagen
            backgroundRepeat: 'no-repeat', // Evita que la imagen se repita
            backgroundAttachment: 'fixed',  // Mantiene el fondo quieto al hacer scroll
        }}>
            <Sider
                style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
            >
                <div style={{
                    height: 64,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: collapsed ? '0' : '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'padding 0.2s',
                }}>
                    <Flex
                        align="center"
                        gap={8}
                        style={{
                            width: '100%',
                            cursor: 'pointer',
                            justifyContent: collapsed ? 'center' : 'flex-start'
                        }}
                        onClick={() => navigate('/admin')}
                    >
                        <Image
                            src={logo}
                            preview={false}
                            style={{ width: 32, minWidth: 32, objectFit: 'contain' }}
                        />
                        {!collapsed && (
                            <Typography.Title level={5} style={{ color: 'white', margin: 0, whiteSpace: 'nowrap' }}>
                                Presu
                            </Typography.Title>
                        )}
                    </Flex>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={setOpenKeys}
                    items={MENU_ITEMS}
                    onClick={({ item }: any) => {
                        if (item.props.navigateTo) navigate(item.props.navigateTo);
                    }}
                />
            </Sider>

            <Layout style={{ background: 'transparent' }}>
                <Header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: 64,
                    paddingInline: 48,
                    background: 'rgba(0, 0, 0, 0.6)',
                }}>
                    <Button variant="solid" onClick={() => navigate('/admin/logout')}>
                        <LogoutOutlined />
                    </Button>
                    <LanguageSwitcher />
                    <ModeSwitcher />
                </Header>

                <Content>
                    <Outlet />
                </Content>

                <Footer style={{ fontSize: 14, textAlign: 'center', height: 24, padding: 0, color: 'white' }}>
                    ©{new Date().getFullYear()} {TITLE}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
