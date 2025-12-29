// src/components/dialogs/__tests__/RoleDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RoleDialog from '../RoleDialog';
import { DialogModes } from '@/common/types';
import { roleService } from '@/services';

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

describe('RoleDialog', () => {
    const handleClose = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when creating a new role', () => {
        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        expect(screen.getByText('Nuevo Rol')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre del Rol')).toBeInTheDocument();
        expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    it('renders correctly and populates form when updating a role', () => {
        const mockRole = { id: 1, name: 'ADMIN_USER' };
        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.UPDATE}
                role={mockRole}
            />
        );

        expect(screen.getByText('Editar Rol')).toBeInTheDocument();
        expect(screen.getByDisplayValue('ADMIN_USER')).toBeInTheDocument();
    });

    it('calls roleService.create when creating a new role', async () => {
        const newRole = { name: 'NEW_ROLE' };
        (roleService.create as vi.Mock).mockResolvedValue({ id: 2, ...newRole });

        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
            target: { value: 'NEW_ROLE' },
        });

        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(roleService.create).toHaveBeenCalledWith({ name: 'NEW_ROLE' });
        });
        
        await vi.waitFor(() => {
            expect(handleClose).toHaveBeenCalledWith({ id: 2, name: 'NEW_ROLE' });
        });
    });

    it('calls roleService.update when updating an existing role', async () => {
        const mockRole = { id: 1, name: 'ADMIN_USER' };
        const updatedRoleData = { name: 'UPDATED_ADMIN' };
        (roleService.update as vi.Mock).mockResolvedValue({ ...mockRole, ...updatedRoleData });

        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.UPDATE}
                role={mockRole}
            />
        );

        fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
            target: { value: 'UPDATED_ADMIN' },
        });

        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(roleService.update).toHaveBeenCalledWith({ ...mockRole, name: 'UPDATED_ADMIN' });
        });
        
        await vi.waitFor(() => {
            expect(handleClose).toHaveBeenCalledWith({ ...mockRole, ...updatedRoleData });
        });
    });

    it('calls handleClose when the cancel button is clicked', () => {
        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        fireEvent.click(screen.getByText('Cancelar'));
        expect(handleClose).toHaveBeenCalledWith();
    });

    it('shows validation error for invalid input', async () => {
        render(
            <RoleDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        fireEvent.change(screen.getByLabelText('Nombre del Rol'), {
            target: { value: 'invalid-role' },
        });

        fireEvent.click(screen.getByText('Guardar'));

        expect(await screen.findByText('Usa solo mayúsculas y guiones bajos (SNAKE_CASE)')).toBeInTheDocument();
        expect(roleService.create).not.toHaveBeenCalled();
        expect(handleClose).not.toHaveBeenCalled();
    });
});
