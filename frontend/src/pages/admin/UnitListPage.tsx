import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Button, Typography } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';

import CustomTable from '@/components/CustomTable';
import type { FieldDefinition } from '@/common/types';
import type { Unit } from '@/models';
import { DialogModes } from '@/common/types';
import UnitDialog from '@/components/dialogs/UnitDialog';
import { unitService } from '@/services/unit.service';

const { Text } = Typography;

// --- Configuración Estática ---
const TITLE = 'Unidades';

const FIELDS: FieldDefinition<Unit>[] = [
    {
        key: 'id',
        label: 'ID',
        type: 'number',
        editable: false, 
        width: 0, // Establecer el ancho a 0
        fixed: "left",
    },
    {
        key: 'name',
        label: 'Nombre',
        type: 'string',
        editable: true,
        filterKey: 'name',
    },
    {
        key: 'symbol',
        label: 'Símbolo',
        type: 'string',
        editable: true,
        filterKey: 'symbol',
    },
    {
        key: 'description',
        label: 'Descripción',
        type: 'string',
        editable: true,
        filterKey: 'description',
    },
    {
        key: 'formula',
        label: 'Fórmula',
        type: 'string',
        editable: true,
        filterKey: 'formula',
    },
];

const UnitListPage: React.FC = () => {
    const { t } = useTranslation();
    const params = new Map<string, string>();
    params.set("page", "1");
    return (
        <div style={{ padding: '24px' }}>
            <CustomTable<Unit>
                title={t(TITLE)}
                fetchDataFunction={unitService.readPaginate}
                fields={FIELDS}
                t={t}
                hasActions={true} 
                
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

                // Inyección del diálogo específico de Recursos Humanos
                dialogRenderer={({ dialogMode, selectedItem, handleCloseDialog }) => {
                    if (dialogMode === DialogModes.NONE) return null;

                    return (
                        <UnitDialog
                            dialogOpen={dialogMode !== DialogModes.NONE}
                            handleClose={handleCloseDialog}
                            dialogMode={dialogMode}
                            unit={selectedItem}
                        />
                    );
                }}
            />
        </div>
    );
};

export default UnitListPage;
