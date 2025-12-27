import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router';
import { useTranslation } from "react-i18next";
import { Flex, Typography, Avatar, Card, Button } from 'antd';

import { loadData } from "@/common/utils";
import Logo from "@/assets/logo.svg";
import { VERSION } from "@/constants";

const { Title } = Typography;
const TITLE = `Presu (${VERSION})`;

const AdminHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Estado consolidado para los datos del dashboard
    const [stats, setStats] = useState({
        loading: true,
        totalProjects: 0,
        totalBudgets: 0,
    });

    // Función para cargar datos memorizada con useCallback
    const fetchDashboardData = useCallback(async () => {
        try {
            const [projects, budgets] = await Promise.all([
                loadData("stats/projects"),
                loadData("stats/budgets"),
            ]);

            console.log("Totals loaded:", projects, budgets);

            setStats({
                loading: false,
                totalProjects: projects.data as number, // Ajuste según la estructura de tu API
                totalBudgets: budgets.data as number, // Ajuste según la estructura de tu API
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    }, []);

    // Efecto de montaje (equivalente a componentDidMount)
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <Flex 
            vertical 
            align="center" 
            justify="center" 
            gap="large" 
            style={{ minHeight: '80vh', padding: '20px' }}
        >
            <Card
                loading={stats.loading}
                style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                actions={[
                    <Button 
                        type="link" 
                        onClick={() => navigate("/admin/townships")}
                    >
                        {t("Gestionar")}
                    </Button>
                ]}
            >
                <Card.Meta
                    avatar={<Avatar src={Logo} size={64} />}
                    title={<Title level={3} style={{ margin: 0 }}>{TITLE}</Title>}
                    description={
                        <Flex vertical gap="small" style={{ marginTop: 15 }}>
                            <Title level={5} style={{ margin: 0 }}>
                                {`${t("Projectos")}: ${stats.totalProjects}`}
                            </Title>
                            <Title level={5} style={{ margin: 0 }}>
                                {`${t("Presupuestos")}: ${stats.totalBudgets}`}
                            </Title>
                        </Flex>
                    }
                />
            </Card>
        </Flex>
    );
};

export default AdminHomePage;
