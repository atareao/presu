// src/components/dialogs/__tests__/ProjectDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProjectDialog from '../ProjectDialog';
import { DialogModes } from '@/common/types';
import { projectService } from '@/services';

// Mock the services
vi.mock('@/services', () => ({
    projectService: {
        create: vi.fn(),
        update: vi.fn(),
    },
    userService: vi.fn(),
    roleService: vi.fn(),
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

describe('ProjectDialog', () => {
    const handleClose = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when creating a new project', () => {
        render(
            <ProjectDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
        expect(screen.getByLabelText('Código')).toBeInTheDocument();
        expect(screen.getByLabelText('Título')).toBeInTheDocument();
    });

    it('calls projectService.create when saving a new project', async () => {
        const newProject = { code: 'PRJ-002', title: 'New Project' };
        (projectService.create as vi.Mock).mockResolvedValue({ id: 2, ...newProject });

        render(
            <ProjectDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        fireEvent.change(screen.getByLabelText('Código'), { target: { value: newProject.code } });
        fireEvent.change(screen.getByLabelText('Título'), { target: { value: newProject.title } });

        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(projectService.create).toHaveBeenCalledWith(newProject);
        });
    });

    it('calls projectService.update when saving an existing project', async () => {
        const mockProject = { id: 1, code: 'PRJ-001', title: 'Existing Project' };
        const updatedData = { title: 'Updated Project Title' };
        (projectService.update as vi.Mock).mockResolvedValue({ ...mockProject, ...updatedData });

        render(
            <ProjectDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.UPDATE}
                project={mockProject}
            />
        );
        
        fireEvent.change(screen.getByLabelText('Título'), { target: { value: updatedData.title } });
        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(projectService.update).toHaveBeenCalledWith({ ...mockProject, ...updatedData });
        });
    });
});
