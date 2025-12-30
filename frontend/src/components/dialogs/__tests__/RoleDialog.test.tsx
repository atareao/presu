// src/components/dialogs/__tests__/RoleDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import RoleDialog from '../RoleDialog';
import { DialogModes } from '@/common/types';
import { roleService } from '@/services';
import React from 'react';

// Mock the roleService
vi.mock('@/services', () => ({
    roleService: {
        create: vi.fn(),
        update: vi.fn(),
    },
    userService: vi.fn(),
    projectService: vi.fn(),
    budgetService: vi.fn(),
    descompositionService: vi.fn(),
    elementService: vi.fn(),
    measurementService: vi.fn(),
    priceService: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key, // Simple pass-through mock
    }),
}));

// Mock Ant Design components
const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

vi.mock('antd', async () => {
    const antd = await vi.importActual('antd');
    return {
        ...antd,
        Modal: vi.fn(({ visible, title, children, onOk, onCancel, footer }) => {
            if (!visible) {
                return null;
            }
            return (
                <div data-testid="modal-mock">
                    <div data-testid="modal-title">{title}</div>
                    <div data-testid="modal-content">{children}</div>
                    <div data-testid="modal-footer">
                        {footer ? footer : (
                            <>
                                <button onClick={onCancel}>Cancel</button>
                                <button onClick={onOk}>OK</button>
                            </>
                        )}
                    </div>
                </div>
            );
        }),
        // Do not mock Form or Form.Item, let them be actual components
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
        },
        Input: (props: any) => <input data-testid="input-mock" {...props} />,
        InputNumber: (props: any) => <input type="number" data-testid="input-number-mock" {...props} />,
        Select: ({ children, value, onChange }: any) => (
            <select data-testid="select-mock" value={value} onChange={e => onChange(e.target.value)}>
                {children}
            </select>
        ),
        Button: (props: any) => <button {...props} />,
        message: {
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});

describe('RoleDialog', () => {
    const handleClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockFormInstance.validateFields.mockResolvedValue({});
        mockFormInstance.getFieldsValue.mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when creating a new role', async () => {
        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        expect(screen.getByText('Nuevo Rol')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre del Rol')).toBeInTheDocument();
        expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    it('renders correctly and populates form when updating a role', async () => {
        const mockRole = { id: 1, name: 'ADMIN_USER' };
        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.UPDATE}
                    role={mockRole}
                />
            );
        });

        await waitFor(() => {
            expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(mockRole);
        });
        expect(screen.getByText('Editar Rol')).toBeInTheDocument();
    });

    it('calls roleService.create when creating a new role', async () => {
        const newRole = { name: 'NEW_ROLE' };
        (roleService.create as vi.Mock).mockResolvedValue({ id: 2, ...newRole });
        mockFormInstance.validateFields.mockResolvedValue(newRole);

        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
                target: { value: 'NEW_ROLE' },
            });
        
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(roleService.create).toHaveBeenCalledWith({ name: 'NEW_ROLE' });
            expect(handleClose).toHaveBeenCalledWith({ id: 2, name: 'NEW_ROLE' });
        });
    });

    it('calls roleService.update when updating an existing role', async () => {
        const mockRole = { id: 1, name: 'ADMIN_USER' };
        const updatedRoleData = { name: 'UPDATED_ADMIN' };
        (roleService.update as vi.Mock).mockResolvedValue({ ...mockRole, ...updatedRoleData });
        mockFormInstance.validateFields.mockResolvedValue({ ...mockRole, ...updatedRoleData });

        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.UPDATE}
                    role={mockRole}
                />
            );
        });

        await waitFor(() => {
            expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(mockRole);
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
                target: { value: 'UPDATED_ADMIN' },
            });
        
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(roleService.update).toHaveBeenCalledWith({ ...mockRole, name: 'UPDATED_ADMIN' });
            expect(handleClose).toHaveBeenCalledWith({ ...mockRole, ...updatedRoleData });
        });
    });

    it('calls handleClose when the cancel button is clicked', async () => {
        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Cancelar'));
        });
        expect(handleClose).toHaveBeenCalledWith();
    });

    it('shows validation error for invalid input', async () => {
        mockFormInstance.validateFields.mockRejectedValue({
            errorFields: [{ name: ['name'], errors: ['Usa solo mayúsculas y guiones bajos (SNAKE_CASE)'] }],
        });

        await act(async () => {
            render(
                <RoleDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
                target: { value: 'invalid-role' },
            });
        
            fireEvent.click(screen.getByText('Guardar'));
        });

        expect(await screen.findByText('Usa solo mayúsculas y guiones bajos (SNAKE_CASE)')).toBeInTheDocument();
        expect(roleService.create).not.toHaveBeenCalled();
        expect(handleClose).not.toHaveBeenCalled();
    });
});
