// src/components/dialogs/__tests__/UserDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import UserDialog from '../UserDialog';
import { DialogModes } from '@/common/types';
import { userService, roleService } from '@/services';
import React from 'react';

// Mock the services
vi.mock('@/services', () => ({
    userService: {
        create: vi.fn(),
        update: vi.fn(),
    },
    roleService: {
        readAll: vi.fn(),
    },
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
        t: (key: string) => key,
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
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
            Item: ({ children, ...props }: any) => (
                <div data-testid="form-item-mock" {...props}>
                    {children}
                </div>
            ),
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

const mockRoles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'USER' },
];

describe('UserDialog', () => {
    const handleClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (roleService.readAll as vi.Mock).mockResolvedValue(mockRoles);
        mockFormInstance.validateFields.mockResolvedValue({});
        mockFormInstance.getFieldsValue.mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and fetches roles when creating a new user', async () => {
        await act(async () => {
            render(
                <UserDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Rol')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(roleService.readAll).toHaveBeenCalled();
        });
    });

    it('renders correctly and populates form when updating a user', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role_id: 1, is_active: true };
        await act(async () => {
            render(
                <UserDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.UPDATE}
                    user={mockUser}
                />
            );
        });

        await waitFor(() => {
            expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(mockUser);
        });
        expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    });

    it('calls userService.create when creating a new user', async () => {
        const newUser = { username: 'newuser', email: 'new@test.com', role_id: 2, is_active: true };
        (userService.create as vi.Mock).mockResolvedValue({ id: 2, ...newUser });
        mockFormInstance.validateFields.mockResolvedValue(newUser);

        await act(async () => {
            render(
                <UserDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });
        
        await act(async () => {
            fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@test.com' } });
            
            // Open the dropdown
            fireEvent.mouseDown(screen.getByLabelText('Rol'));
            // Select the 'USER' option
            await screen.findByText('USER');
            fireEvent.click(screen.getByText('USER'));

            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(userService.create).toHaveBeenCalledWith(expect.objectContaining(newUser));
            expect(handleClose).toHaveBeenCalled();
        });
    });

    it('calls userService.update when updating an existing user', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role_id: 1, is_active: true };
        const updatedUserData = { username: 'updateduser' };
        (userService.update as vi.Mock).mockResolvedValue({ ...mockUser, ...updatedUserData });
        mockFormInstance.validateFields.mockResolvedValue({ ...mockUser, ...updatedUserData });

        await act(async () => {
            render(
                <UserDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.UPDATE}
                    user={mockUser}
                />
            );
        });

        await waitFor(() => {
            expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(mockUser);
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'updateduser' } });
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(userService.update).toHaveBeenCalledWith({ ...mockUser, username: 'updateduser' });
            expect(handleClose).toHaveBeenCalled();
        });
    });
});
