// src/pages/admin/__tests__/ProjectListPage.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProjectListPage from '../ProjectListPage';
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

// Mock antd components
const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

vi.mock('antd', async (importOriginal) => {
    const antd = await importOriginal();
    return {
        ...antd,
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
        },
        message: {
            success: vi.fn(),
            error: vi.fn(),
        },
        Modal: antd.Modal, // Use actual Modal component
        Table: antd.Table, // Use actual Table component
        Button: antd.Button, // Use actual Button component
        Popconfirm: antd.Popconfirm, // Use actual Popconfirm component
        Input: antd.Input, // Use actual Input component
        InputNumber: antd.InputNumber, // Use actual InputNumber component
        Select: antd.Select, // Use actual Select component
        Space: antd.Space, // Use actual Space component
    };
});

// Mock ProjectDialog since it's an external component to this test
vi.mock('@/components/dialogs', () => ({
    ProjectDialog: vi.fn(({ visible, onSave, onClose, project, dialogMode }) => {
        if (!visible) return null;
        return (
            <div data-testid="project-dialog-mock">
                <p>{dialogMode === 'create' ? 'Añadir Proyecto' : 'Editar Proyecto'}</p>
                <button onClick={() => onSave({ id: project?.id, code: 'NEW_CODE', title: 'New Title' } as Project)}>Save</button>
                <button onClick={onClose}>Close</button>
            </div>
        );
    }),
    BudgetDialog: vi.fn(() => null),
    DescompositionDialog: vi.fn(() => null),
    ElementDialog: vi.fn(() => null),
    MeasurementDialog: vi.fn(() => null),
    PriceDialog: vi.fn(() => null),
    RoleDialog: vi.fn(() => null),
    UserDialog: vi.fn(() => null),
}));

const mockProjects: Project[] = [
  { id: 1, code: 'P1', title: 'Project Alpha' },
  { id: 2, code: 'P2', title: 'Project Beta' },
];

describe('ProjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (projectService.readAll as vi.Mock).mockResolvedValue(mockProjects);
    (projectService.create as vi.Mock).mockResolvedValue(mockProjects[0]);
    (projectService.update as vi.Mock).mockResolvedValue(mockProjects[0]);
    (projectService.remove as vi.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the list of projects', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await waitFor(() => {
      expect(projectService.readAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Lista de Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('opens the ProjectDialog in create mode when "Añadir Proyecto" button is clicked', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Añadir Proyecto'));
    });

    // Check if ProjectDialog is rendered with correct props
    await waitFor(() => {
        const { ProjectDialog } = require('@/components/dialogs');
        expect(ProjectDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                visible: true,
                project: null,
                dialogMode: 'create',
            }),
            {}
        );
    });
  });

  it('opens the ProjectDialog in update mode when "Edit" button is clicked', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await waitFor(() => {
        expect(projectService.readAll).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('edit')[0]); // Click on the first edit button
    });

    // Check if ProjectDialog is rendered with correct props
    await waitFor(() => {
        const { ProjectDialog } = require('@/components/dialogs');
        expect(ProjectDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                visible: true,
                project: mockProjects[0],
                dialogMode: 'update',
            }),
            {}
        );
    });
  });

  it('deletes a project when "Delete" button is clicked and confirmed', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await waitFor(() => {
        expect(projectService.readAll).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('delete')[0]); // Click on the first delete button
    });

    // Ant Design Popconfirm triggers another button click for confirmation
    await act(async () => {
        fireEvent.click(screen.getByText('Sí')); // Confirm the deletion
    });

    await waitFor(() => {
      expect(projectService.remove).toHaveBeenCalledWith(mockProjects[0].id);
      expect(projectService.readAll).toHaveBeenCalledTimes(2); // Initial fetch + refetch after delete
      expect(screen.getByText('Proyecto eliminado correctamente')).toBeInTheDocument();
    });
  });

  it('handles successful project creation from dialog', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Añadir Proyecto'));
    });

    // Simulate saving from the dialog
    await act(async () => {
        const { ProjectDialog } = require('@/components/dialogs');
        // Call the onSave prop of the mocked ProjectDialog directly
        ProjectDialog.mock.calls[ProjectDialog.mock.calls.length - 1][0].onSave({ code: 'NEW_PROJ', title: 'New Project Title' } as Project);
    });

    await waitFor(() => {
      expect(projectService.create).toHaveBeenCalledWith({ code: 'NEW_PROJ', title: 'New Project Title' });
      expect(projectService.readAll).toHaveBeenCalledTimes(2); // Initial fetch + refetch after create
      expect(screen.getByText('Proyecto creado correctamente')).toBeInTheDocument();
    });
  });

  it('handles successful project update from dialog', async () => {
    await act(async () => {
      render(<ProjectListPage />);
    });

    await act(async () => {
        fireEvent.click(screen.getAllByLabelText('edit')[0]);
    });

    const updatedProject = { ...mockProjects[0], title: 'Updated Project Title' };

    // Simulate saving from the dialog
    await act(async () => {
        const { ProjectDialog } = require('@/components/dialogs');
        ProjectDialog.mock.calls[ProjectDialog.mock.calls.length - 1][0].onSave(updatedProject);
    });

    await waitFor(() => {
      expect(projectService.update).toHaveBeenCalledWith(updatedProject);
      expect(projectService.readAll).toHaveBeenCalledTimes(2); // Initial fetch + refetch after update
      expect(screen.getByText('Proyecto actualizado correctamente')).toBeInTheDocument();
    });
  });
});
