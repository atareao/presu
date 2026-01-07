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
import type { User, Role } from '@/models';
import { DialogModes } from '@/common/types';
import UserDialog from '@/components/dialogs/UserDialog';
import { roleService } from '@/services';
import { userService } from '@/services';

const { Text } = Typography;

// --- Configuración Estática ---
const TITLE = 'Usuarios';

const UsersPage: React.FC = () => {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(false);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            try {
                const fetchedRoles = await roleService.readAll();
                setRoles(fetchedRoles || []);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                message.error(t('Error al cargar roles'));
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, [t]);

    const FIELDS: FieldDefinition<User>[] = [
        {
            key: 'id',
            label: 'ID',
            type: 'number',
            editable: false, 
            width: 0, // Ocultar
            fixed: "left",
        },
        {
            key: 'username',
            label: 'Usuario',
            type: 'string',
            editable: true,
            filterKey: 'username',
        },
        {
            key: 'email',
            label: 'Email',
            type: 'string',
            editable: true,
            filterKey: 'email',
        },
        {
            key: 'role_id',
            label: 'Rol',
            type: 'number',
            editable: false,
            width: 150,
            render: (role_id: number) => {
                const role = roles.find(p => p.id === role_id);
                return role ? <Text>{role.name}</Text> : <Text>{t('Desconocido')}</Text>;
            },
            filterKey: 'role_id', // Asumimos que se filtra por ID
        },
        {
            key: 'is_active',
            label: 'Activo',
            type: 'boolean',
            editable: true,
            render: (is_active: boolean) => {
                const color = is_active ? 'green' : 'red';
                return <Tag color={color}>{is_active? t('Sí'): t('No')}</Tag>;
            },
            filterKey: 'is_active',
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <CustomTable<User>
                title={t(TITLE)}
                fetchDataFunction={userService.readPaginate}
                fields={FIELDS}
                t={t}
                hasActions={true} 
                loading={loadingRoles} // Mostrar carga si los proyectos se están cargando
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
                        <UserDialog
                            dialogOpen={dialogMode !== DialogModes.NONE}
                            handleClose={handleCloseDialog}
                            dialogMode={dialogMode}
                            user={selectedItem}
                        />
                    );
                }}
            />
        </div>
    );
};

export default UsersPage;
