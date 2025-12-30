import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProjectListPage from '../ProjectListPage'; // Assuming this is the correct component name now
import { projectService } from '@/services';
import { Project } from '@/models';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock services
vi.mock('@/services', () => ({
    projectService: {
        readAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    },
    budgetService: vi.fn(),
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
        const mockItems: Project[] = [
            { id: 1, code: 'P1', title: 'Project Alpha' },
            { id: 2, code: 'P2', title: 'Project Beta' },
        ];
        
        // Simulate dialog state
        const [dialogVisible, setDialogVisible] = React.useState(false);
        const [selectedItem, setSelectedItem] = React.useState<Project | undefined>(undefined);
        const [dialogMode, setDialogMode] = React.useState('none');

        const onCreate = () => {
            setSelectedItem(undefined);
            setDialogMode('create');
            setDialogVisible(true);
        };
        const onEdit = (item: Project) => {
            setSelectedItem(item);
            setDialogMode('update');
            setDialogVisible(true);
        };
        const onDelete = (item: Project) => {
            setSelectedItem(item);
            setDialogMode('delete');
            setDialogVisible(true);
        };
        const handleCloseDialog = (item?: Project) => {
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
                                {fields.map(field => <td key={`${item.id}-${field.key.toString()}`}>{item[field.key as keyof Project]?.toString()}</td>)}
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

// Mock ProjectDialog since it's an external component to this test
vi.mock('@/components/dialogs/ProjectDialog', () => ({
    default: vi.fn(({ dialogOpen, onSave, handleClose, project, dialogMode }) => {
        if (!dialogOpen) return null;
        return (
            <div data-testid="project-dialog-mock">
                <p>{dialogMode === 'create' ? 'Añadir Proyecto' : 'Editar Proyecto'}</p>
                <button onClick={() => onSave({ 
                    id: project?.id, 
                    code: 'NEW_CODE', 
                    title: 'New Title' 
                } as Project)}>Save</button>
                <button onClick={() => handleClose()}>Close</button>
            </div>
        );
    }),
}));

const mockProjects: Project[] = [
  { id: 1, code: 'P1', title: 'Project Alpha' },
  { id: 2, code: 'P2', title: 'Project Beta' },
];

describe('ProjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the list of projects', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    // CustomTable is mocked, so we check if the mock was called with the correct props
    const CustomTable = require('@/components/CustomTable').default;
    expect(CustomTable).toHaveBeenCalledWith(
        expect.objectContaining({
            title: 'Proyectos',
            endpoint: 'projects',
            fields: expect.any(Array),
            hasActions: true,
        }),
        {}
    );
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('opens the ProjectDialog in create mode when "Añadir Proyecto" button is clicked', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Nuevo'));
    });

    const ProjectDialog = require('@/components/dialogs/ProjectDialog').default;
    expect(ProjectDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            project: undefined, // undefined for create mode
            dialogMode: 'create',
        }),
        {}
    );
  });

  it('opens the ProjectDialog in update mode when "Edit" button is clicked', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByTitle('Editar')[0]); // Click on the first edit button
    });

    const ProjectDialog = require('@/components/dialogs/ProjectDialog').default;
    expect(ProjectDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            project: expect.objectContaining({ id: 1, code: 'P1' }), // Should pass the selected project
            dialogMode: 'update',
        }),
        {}
    );
  });
  
  it('handles delete action', async () => {
    await act(async () => {
        render(<ProjectListPage />);
    });

    await act(async () => {
        fireEvent.click(screen.getAllByTitle('Eliminar')[0]);
    });

    // Since CustomTable is mocked, we only check if the dialog was triggered with the delete mode.
    // The actual deletion logic is within CustomTable's unmocked implementation.
    const ProjectDialog = require('@/components/dialogs/ProjectDialog').default;
    expect(ProjectDialog).toHaveBeenCalledWith(
        expect.objectContaining({
            dialogOpen: true,
            project: expect.objectContaining({ id: 1, code: 'P1' }),
            dialogMode: 'delete',
        }),
        {}
    );
  });
});