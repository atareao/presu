// src/components/dialogs/__tests__/BudgetDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import BudgetDialog from '../BudgetDialog';
import { DialogModes } from '@/common/types';
import { budgetService, projectService } from '@/services';
import { BudgetStatus } from '@/models';
import React from 'react';

// Mock the services
vi.mock('@/services', () => ({
    budgetService: {
        create: vi.fn(),
        update: vi.fn(),
    },
    projectService: {
        readAll: vi.fn(),
    },
    userService: vi.fn(),
    roleService: vi.fn(),
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

const mockProjects = [
    { id: 1, code: 'P1', title: 'Project 1' },
    { id: 2, code: 'P2', title: 'Project 2' },
];

describe('BudgetDialog', () => {
    const handleClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (projectService.readAll as vi.Mock).mockResolvedValue(mockProjects);
        mockFormInstance.validateFields.mockResolvedValue({});
        mockFormInstance.getFieldsValue.mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches projects on create mode', async () => {
        await act(async () => {
            render(
                <BudgetDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        expect(screen.getByText('Nuevo Presupuesto')).toBeInTheDocument();
        await waitFor(() => {
            expect(projectService.readAll).toHaveBeenCalled();
        });
    });

    it('calls budgetService.create when saving a new budget', async () => {
        const newBudget = { 
            project_id: 1, 
            code: 'B-001', 
            name: 'New Budget', 
            version_number: 1, 
            status: BudgetStatus.Draft 
        };
        (budgetService.create as vi.Mock).mockResolvedValue({ id: 1, ...newBudget });
        mockFormInstance.validateFields.mockResolvedValue(newBudget);

        await act(async () => {
            render(
                <BudgetDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Código Presupuesto'), { target: { value: newBudget.code } });
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: newBudget.name } });
        
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            // We expect a partial object, so we check for containing the fields
            expect(budgetService.create).toHaveBeenCalledWith(expect.objectContaining({
                code: newBudget.code,
                name: newBudget.name,
            }));
            expect(handleClose).toHaveBeenCalled();
        });
    });
});
