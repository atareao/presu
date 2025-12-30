import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Input, Flex, Typography } from 'antd';
import type { GetProp, TableProps, TableColumnsType } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { debounce } from '@/common/utils';
import type { DialogMode, FieldDefinition } from '@/common/types';
import { DialogModes } from '@/common/types';
import type Response from '@/models/response';

const { Text } = Typography;
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface ActionProps<T> {
    renderActionColumn: (item: T, onEdit: (item: T) => void, onDelete: (item: T) => void) => React.ReactNode;
    renderHeaderAction: (onCreate: () => void) => React.ReactNode;
}

// Interfaz limpia para que el padre decida qué diálogo mostrar
interface DialogRendererParams<T> {
    dialogMode: DialogMode;
    selectedItem: T | undefined;
    handleCloseDialog: (item?: T | undefined) => void;
    fields: FieldDefinition<T>[];
}

type Props<T extends { id: number | string }> = {
    title: string;
    fetchDataFunction: (params: Map<string, string>) => Promise<Response<T[]>>;
    params?: Map<string, string>;
    fields: FieldDefinition<T>[];
    t: (key: string) => string;
    hasActions?: boolean;
    // Ahora es obligatorio si hasActions es true, o puedes manejar el null
    dialogRenderer: (params: DialogRendererParams<T>) => React.ReactNode | null;
} & Partial<ActionProps<T>>;

const getNestedValue = (obj: any, path: string): any => {
    const pathParts = path.split('.');
    let current = obj;
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    return current;
};

const CustomTable = <T extends { id: number | string }>(props: Props<T>) => {
    const { 
        title, fetchDataFunction, params, fields, t, 
        hasActions, dialogRenderer, renderActionColumn, renderHeaderAction 
    } = props;

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 9, total: 0 });
    const [sortField, setSortField] = useState<SorterResult<any>['field']>(undefined);
    const [sortOrder, setSortOrder] = useState<SorterResult<any>['order']>(undefined);
    const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
    const [dialogMode, setDialogMode] = useState<DialogMode>(DialogModes.NONE);
    
    const [filters, setFilters] = useState<Map<string, string>>(() => {
        const initialFilters = new Map<string, string>();
        fields.forEach(field => initialFilters.set(field.key.toString(), ""));
        return initialFilters;
    });

    const handleEdit = (item: T) => {
        setSelectedItem(item);
        setDialogMode(DialogModes.UPDATE);
    };

    const handleDelete = (item: T) => {
        setSelectedItem(item);
        setDialogMode(DialogModes.DELETE);
    };

    const handleCreate = () => {
        setSelectedItem(undefined);
        setDialogMode(DialogModes.CREATE);
    };

    const handleCloseDialog = (item?: T | undefined) => {
        if (item) {
            setItems(prevItems => {
                if (dialogMode === DialogModes.DELETE) {
                    return prevItems.filter((r) => r.id !== item.id);
                } else if (dialogMode === DialogModes.UPDATE) {
                    return prevItems.map((r) => r.id === item.id ? { ...r, ...item } : r);
                } else if (dialogMode === DialogModes.CREATE) {
                    return [...prevItems.filter(r => !r.id), item]; // Remove temporary new item if it exists, add the one with ID
                }
                return prevItems;
            });
        }
        setDialogMode(DialogModes.NONE);
        setSelectedItem(undefined);
    };

    const fetchData = useCallback(async () => {
        if (dialogMode !== DialogModes.NONE) return;

        setLoading(true);
        const sortByParam = sortField?.toString().trim() || 'created_at';
        
        const apiParams = new Map<string, string>([
            ["page", pagination.current?.toString() || "1"],
            ["limit", pagination.pageSize?.toString() || "10"],
            ["sort_by", sortByParam],
        ]);

        params?.forEach((value, key) => apiParams.set(key, value));

        if (sortOrder === 'ascend') apiParams.set("asc", 'true');
        else if (sortOrder === 'descend') apiParams.set("asc", 'false');

        filters.forEach((value, fieldKey) => {
            if (value && value.length > 0) {
                const fieldDef = fields.find(f => f.key === fieldKey);
                apiParams.set(fieldDef?.filterKey || fieldKey, value);
            }
        });

        const response = await fetchDataFunction(apiParams);
        
        if (response.status === 200 && response.data) {
            setItems(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.pagination?.records || 0,
                current: response.pagination?.page || 1,
                pageSize: response.pagination?.limit || 10,
            }));
        }
        setLoading(false);
    }, [fetchDataFunction, pagination.current, pagination.pageSize, sortField, sortOrder, filters, params, fields, dialogMode]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const debouncedUpdateFilter = useMemo(() => 
        debounce((key: string, value: string) => {
            const cleanValue = value.trim().replaceAll("*", "%");
            setFilters(prev => {
                if (prev.get(key) === cleanValue) return prev;
                const next = new Map(prev);
                next.set(key, cleanValue);
                return next;
            });
            setPagination(prev => ({ ...prev, current: 1 }));
            setItems([]);
        }, 500)
    , []);

    const handleTableChange: TableProps<T>['onChange'] = (newPagination, _filters, sorter) => {
        const s = sorter as SorterResult<T>;
        const fieldDef = fields.find(f => f.key === s.field);
        
        setSortField(fieldDef?.sortKey || s.field);
        setSortOrder(s.order);
        setPagination(prev => ({ ...prev, ...newPagination }));
        
        if (newPagination.pageSize !== pagination.pageSize || newPagination.current !== pagination.current) {
            setItems([]);
        }
    };

    const columns: TableColumnsType<T> = useMemo(() => {
        const cols: TableColumnsType<T> = fields.map((field) => {
            const fieldKey = field.key.toString();
            
            const defaultRender = (content: any) => {
                if (field.type === 'boolean') {
                    return content ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />;
                }
                return <Text>{content}</Text>;
            };

            const isNested = fieldKey.includes('.');
            let finalRender = field.render || defaultRender;

            if (isNested && !field.render) {
                finalRender = (_: any, record: T) => {
                    const value = getNestedValue(record, fieldKey);
                    if (field.type === 'boolean') {
                        return value ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />;
                    }
                    return <Text>{value ?? ''}</Text>;
                };
            }

            return {
                title: (
                    <Flex vertical justify="flex-end" align="left" gap="middle" >
                        <Text strong>{t(field.label)}</Text>
                        {(field.type === 'string' && field.filterKey) &&
                            <Input
                                placeholder={`${t('Filter by')} ${field.label}...`}
                                defaultValue={filters.get(fieldKey)?.replaceAll("%", "*")}
                                onKeyUp={(e) => debouncedUpdateFilter(fieldKey, e.currentTarget.value)}
                                onClick={e => e.stopPropagation()}
                            />
                        }
                    </Flex>
                ),
                dataIndex: fieldKey,
                key: fieldKey,
                sorter: field.type !== 'boolean',
                ellipsis: true,
                width: field.width || 100,
                render: (content: any, record: T) => field.render ? field.render(content, record) : finalRender(content, record),
                fixed: field.fixed || undefined,
            };
        });

        if (hasActions && renderActionColumn) {
            cols.push({
                title: <Text>{t('Acciones')}</Text>,
                key: "operation-actions",
                align: 'center',
                width: 10,
                fixed: 'right',
                render: (item: T) => renderActionColumn(item, handleEdit, handleDelete)
            });
        }
        return cols;
    }, [fields, filters, t, hasActions, renderActionColumn, debouncedUpdateFilter]);

    const headerUI = hasActions && renderHeaderAction ? (
        renderHeaderAction(handleCreate)
    ) : (
        <Text style={{ fontSize: '24px' }} strong>{t(title)}</Text>
    );

    return (
        <>
            {hasActions && dialogMode !== DialogModes.NONE && dialogRenderer({
                dialogMode,
                selectedItem,
                handleCloseDialog,
                fields
            })}
            <Flex vertical justify="center" align="center" gap="middle" >
                <Flex justify="center" align="center" gap="middle" >
                    {headerUI}
                </Flex>
                <Table<T>
                    style={{ width: '100%' }}
                    columns={columns}
                    rowKey={(record, index) => record.id?.toString() || `new-${index}`}
                    dataSource={items}
                    sortDirections={['ascend', 'descend']}
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </Flex>
        </>
    );
};

export default CustomTable;
