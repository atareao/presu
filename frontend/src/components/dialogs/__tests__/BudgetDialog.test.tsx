// src/components/dialogs/__tests__/BudgetDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import BudgetDialog from '../BudgetDialog';
import { DialogModes } from '@/common/types';
import { budgetService, projectService } from '@/services';
import { BudgetStatus } from '@/models';

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

// Mock antd message
vi.mock('antd', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
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
        (projectService.readAll as vi.Mock).mockResolvedValue(mockProjects);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches projects on create mode', async () => {
        render(
            <BudgetDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        expect(screen.getByText('Nuevo Presupuesto')).toBeInTheDocument();
        await vi.waitFor(() => {
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

        render(
            <BudgetDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        fireEvent.change(screen.getByLabelText('Código Presupuesto'), { target: { value: newBudget.code } });
        fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: newBudget.name } });

        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            // We expect a partial object, so we check for containing the fields
            expect(budgetService.create).toHaveBeenCalledWith(expect.objectContaining({
                code: newBudget.code,
                name: newBudget.name,
            }));
        });
    });
});
