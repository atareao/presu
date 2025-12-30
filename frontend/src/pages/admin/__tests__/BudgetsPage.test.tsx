import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BudgetsPage from '../BudgetsPage';
import { budgetService } from '@/services';
import { Budget, BudgetStatus } from '@/models';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock services
vi.mock('@/services', () => ({
    budgetService: {
        readAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    },
    projectService: {
        readAll: vi.fn(),
    },
    descompositionService: vi.fn(),
    elementService: vi.fn(),
    measurementService: vi.fn(),
    priceService: vi.fn(),
    roleService: vi.fn(),
    userService: vi.fn(),
}));

// Mock CustomTable since it's an external component to this test
vi.mock('@/components/CustomTable', () => ({
    default: vi.fn(({ title, endpoint, fields, t, hasActions, renderActionColumn, renderHeaderAction, dialogRenderer }) => {
        const mockItems: Budget[] = [
            { id: 1, project_id: 1, code: 'B1', name: 'Budget Alpha', version_number: 1, status: BudgetStatus.Draft },
            { id: 2, project_id: 1, code: 'B2', name: 'Budget Beta', version_number: 1, status: BudgetStatus.Approved },
        ];
        
        // Simulate dialog state
        const [dialogVisible, setDialogVisible] = React.useState(false);
        const [selectedItem, setSelectedItem] = React.useState<Budget | undefined>(undefined);
        const [dialogMode, setDialogMode] = React.useState('none');

        const onCreate = () => {
            setSelectedItem(undefined);
            setDialogMode('create');
            setDialogVisible(true);
        };
        const onEdit = (item: Budget) => {
            setSelectedItem(item);
            setDialogMode('update');
            setDialogVisible(true);
        };
        const onDelete = (item: Budget) => {
            setSelectedItem(item);
            setDialogMode('delete');
            setDialogVisible(true);
        };
        const handleCloseDialog = (item?: Budget) => {
            if (item) {
                // Here, you'd typically update the mockItems based on the dialog's action
                // For simplicity in the mock, we just close.
            }
            setDialogVisible(false);
            setDialogMode('none');
            setSelectedItem(undefined);
        };

        return (
            <div>
                <h1>{title}</h1>
                {hasActions && renderHeaderAction && renderHeaderAction(onCreate)}
                <table>
                    <thead>
                        <tr>
                            {fields.map(field => <th key={field.key.toString()}>{t(field.label)}</th>)}
                            {hasActions && <th>{t('Acciones')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {mockItems.map(item => (
                            <tr key={item.id}>
                                {fields.map(field => <td key={`${item.id}-${field.key.toString()}`}>{item[field.key as keyof Budget]?.toString()}</td>)}
                                {hasActions && <td>{renderActionColumn && renderActionColumn(item, onEdit, onDelete)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {dialogVisible && dialogRenderer && dialogRenderer({
                    dialogMode: dialogMode as any, // Cast to DialogModes
                    selectedItem,
                    handleCloseDialog,
                    endpoint,
                    fields: fields as any, // Cast to FieldDefinition<T>[]
                })}
            </div>
        );
    }),
}));

// Mock BudgetDialog since it's an external component to this test
vi.mock('@/components/dialogs/BudgetDialog', () => ({
    default: vi.fn(({ dialogOpen, onSave, handleClose, budget, dialogMode }) => {
        if (!dialogOpen) return null;
        return (
            <div data-testid="budget-dialog-mock">
                <p>{dialogMode === 'create' ? 'Añadir Presupuesto' : 'Editar Presupuesto'}</p>
                <button onClick={() => onSave({ 
                    id: budget?.id, 
                    project_id: budget?.project_id || 1, 
                    code: 'NEW_CODE', 
                    name: 'New Budget Name', 
                    version_number: 1, 
                    status: BudgetStatus.Draft 
                } as Budget)}>Save</button>
                <button onClick={() => handleClose()}>Close</button>
            </div>
        );
    }),
}));

describe('BudgetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the list of budgets', async () => {
    await act(async () => {
      render(<BudgetsPage />);
    });

    // CustomTable is mocked, so we check if the mock was called with the correct props
    const CustomTable = require('@/components/CustomTable').default;
    expect(CustomTable).toHaveBeenCalledWith(
        expect.objectContaining({
            title: 'Presupuestos',
            endpoint: 'budgets',
            fields: expect.any(Array),
            hasActions: true,
        }),
        {}
    );
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
    expect(screen.getByText('Budget Alpha')).toBeInTheDocument();
    expect(screen.getByText('Budget Beta')).toBeInTheDocument();
  });

  it('opens the BudgetDialog in create mode when "Nuevo" button is clicked', async () => {
    await act(async () => {
      render(<BudgetsPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Nuevo'));
    });

    const BudgetDialog = require('@/components/dialogs/BudgetDialog').default;
    expect(BudgetDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            budget: undefined, // undefined for create mode
            dialogMode: 'create',
        }),
        {}
    );
  });

  it('opens the BudgetDialog in update mode when "Edit" button is clicked', async () => {
    await act(async () => {
      render(<BudgetsPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByTitle('Editar')[0]); // Click on the first edit button
    });

    const BudgetDialog = require('@/components/dialogs/BudgetDialog').default;
    expect(BudgetDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            budget: expect.objectContaining({ id: 1, code: 'B1' }), // Should pass the selected budget
            dialogMode: 'update',
        }),
        {}
    );
  });
  
  it('handles delete action', async () => {
    await act(async () => {
        render(<BudgetsPage />);
    });

    await act(async () => {
        fireEvent.click(screen.getAllByTitle('Eliminar')[0]);
    });

    // Since CustomTable is mocked, we only check if the dialog was triggered with the delete mode.
    // The actual deletion logic is within CustomTable's unmocked implementation.
    const BudgetDialog = require('@/components/dialogs/BudgetDialog').default;
    expect(BudgetDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            budget: expect.objectContaining({ id: 1, code: 'B1' }),
            dialogMode: 'delete',
        }),
        {}
    );
  });
});