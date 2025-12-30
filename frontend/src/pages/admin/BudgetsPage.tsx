import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Button, Typography, Tag, message } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';

import CustomTable from '@/components/CustomTable';
import type { FieldDefinition } from '@/common/types';
import type { Budget, Project } from '@/models';
import { BudgetStatus } from '@/models';
import { DialogModes } from '@/common/types';
import BudgetDialog from '@/components/dialogs/BudgetDialog';
import { projectService } from '@/services'; // Import projectService
import { budgetService } from '@/services';

const { Text } = Typography;

// --- Configuración Estática ---
const TITLE = 'Presupuestos';

const BudgetsPage: React.FC = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoadingProjects(true);
            try {
                const fetchedProjects = await projectService.readAll();
                setProjects(fetchedProjects.data || []);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                message.error(t('Error al cargar proyectos'));
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, [t]);

    const FIELDS: FieldDefinition<Budget>[] = [
        {
            key: 'id',
            label: 'ID',
            type: 'number',
            editable: false, 
            width: 0, // Ocultar
            fixed: "left",
        },
        {
            key: 'project_id',
            label: 'Proyecto',
            type: 'number',
            editable: false,
            width: 150,
            render: (project_id: number) => {
                const project = projects.find(p => p.id === project_id);
                return project ? <Text>{project.title}</Text> : <Text>{t('Desconocido')}</Text>;
            },
            filterKey: 'project_id', // Asumimos que se filtra por ID
        },
        {
            key: 'code',
            label: 'Código',
            type: 'string',
            editable: true,
            filterKey: 'code',
        },
        {
            key: 'name',
            label: 'Nombre',
            type: 'string',
            editable: true,
            filterKey: 'name',
        },
        {
            key: 'version_number',
            label: 'Versión',
            type: 'number',
            editable: true,
            width: 100,
        },
        {
            key: 'status',
            label: 'Estado',
            type: 'string',
            editable: true,
            render: (status: BudgetStatus) => {
                let color;
                switch (status) {
                    case BudgetStatus.Draft:
                        color = 'blue';
                        break;
                    case BudgetStatus.Approved:
                        color = 'green';
                        break;
                    case BudgetStatus.Rejected:
                        color = 'red';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{t(status)}</Tag>; // Traducir el estado
            },
            filterKey: 'status',
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <CustomTable<Budget>
                title={t(TITLE)}
                fetchDataFunction={budgetService.readPaginate}
                fields={FIELDS}
                t={t}
                hasActions={true} 
                loading={loadingProjects} // Mostrar carga si los proyectos se están cargando
                // Renderizado de las acciones de cada fila
                renderActionColumn={(item, onEdit, onDelete) => (
                    <Flex gap="small">
                        <Button 
                            onClick={() => onEdit(item)} 
                            icon={<EditOutlined />} 
                            title={t('Editar')}
                        />
                        <Button
                            onClick={() => onDelete(item)}
                            icon={<DeleteOutlined />} 
                            title={t('Eliminar')}
                        />
                    </Flex>
                )}
                
                // Renderizado de la cabecera (Título + Botón Nuevo)
                renderHeaderAction={(onCreate) => (
                    <Flex gap="small" align="center">
                        <Text style={{ fontSize: '24px' }} strong>{t(TITLE)}</Text>
                        <Button
                            type="primary"
                            onClick={onCreate}
                            icon={<PlusOutlined />}
                            title={t('Nuevo')}
                        />
                    </Flex>
                )}

                // Inyección del diálogo específico
                dialogRenderer={({ dialogMode, selectedItem, handleCloseDialog }) => {
                    if (dialogMode === DialogModes.NONE) return null;

                    return (
                        <BudgetDialog
                            dialogOpen={dialogMode !== DialogModes.NONE}
                            handleClose={handleCloseDialog}
                            dialogMode={dialogMode}
                            budget={selectedItem}
                            projects={projects} // Pasar los proyectos al diálogo
                            // project_id={selectedItem?.project_id} // Ya se pasa en 'budget'
                        />
                    );
                }}
            />
        </div>
    );
};

export default BudgetsPage;
