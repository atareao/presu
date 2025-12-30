// src/components/dialogs/__tests__/ProjectDialog.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import ProjectDialog from '../ProjectDialog';
import { DialogModes } from '@/common/types';
import { projectService } from '@/services';
import React from 'react';

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

const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

// Ant Design Form.useForm and message are globally mocked in setup.ts

describe('ProjectDialog', () => {
    const handleClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockFormInstance.validateFields.mockResolvedValue({});
        mockFormInstance.getFieldsValue.mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when creating a new project', async () => {
        await act(async () => {
            render(
                <ProjectDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
        expect(screen.getByLabelText('Código')).toBeInTheDocument();
        expect(screen.getByLabelText('Título')).toBeInTheDocument();
    });

    it('calls projectService.create when saving a new project', async () => {
        const newProject = { code: 'PRJ-002', title: 'New Project' };
        (projectService.create as vi.Mock).mockResolvedValue({ id: 2, ...newProject });
        mockFormInstance.validateFields.mockResolvedValue(newProject);

        await act(async () => {
            render(
                <ProjectDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.CREATE}
                />
            );
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Código'), { target: { value: newProject.code } });
            fireEvent.change(screen.getByLabelText('Título'), { target: { value: newProject.title } });
    
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(projectService.create).toHaveBeenCalledWith(newProject);
            expect(handleClose).toHaveBeenCalled();
        });
    });

    it('calls projectService.update when saving an existing project', async () => {
        const mockProject = { id: 1, code: 'PRJ-001', title: 'Existing Project' };
        const updatedData = { title: 'Updated Project Title' };
        (projectService.update as vi.Mock).mockResolvedValue({ ...mockProject, ...updatedData });
        mockFormInstance.validateFields.mockResolvedValue({ ...mockProject, ...updatedData });

        await act(async () => {
            render(
                <ProjectDialog
                    dialogOpen={true}
                    handleClose={handleClose}
                    dialogMode={DialogModes.UPDATE}
                    project={mockProject}
                />
            );
        });

        await waitFor(() => {
            expect(mockFormInstance.setFieldsValue).toHaveBeenCalledWith(mockProject);
        });
        
        await act(async () => {
            fireEvent.change(screen.getByLabelText('Título'), { target: { value: updatedData.title } });
            fireEvent.click(screen.getByText('Guardar'));
        });

        await waitFor(() => {
            expect(projectService.update).toHaveBeenCalledWith({ ...mockProject, ...updatedData });
            expect(handleClose).toHaveBeenCalled();
        });
    });
});
