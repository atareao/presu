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

// Mock Ant Design components (Form.useForm and message are globally mocked in setup.ts)
const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

// No need to mock antd directly here, rely on global mock in setup.ts
// Except for mockFormInstance, which is specific to this test.

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
