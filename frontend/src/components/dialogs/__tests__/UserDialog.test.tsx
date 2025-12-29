// src/components/dialogs/__tests__/UserDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import UserDialog from '../UserDialog';
import { DialogModes } from '@/common/types';
import { userService, roleService } from '@/services';

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

const mockRoles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'USER' },
];

describe('UserDialog', () => {
    const handleClose = vi.fn();

    beforeEach(() => {
        (roleService.readAll as vi.Mock).mockResolvedValue(mockRoles);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and fetches roles when creating a new user', async () => {
        render(
            <UserDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );

        expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Rol')).toBeInTheDocument();
        
        await vi.waitFor(() => {
            expect(roleService.readAll).toHaveBeenCalled();
        });
    });

    it('renders correctly and populates form when updating a user', () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role_id: 1, is_active: true };
        render(
            <UserDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.UPDATE}
                user={mockUser}
            />
        );

        expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    });

    it('calls userService.create when creating a new user', async () => {
        const newUser = { username: 'newuser', email: 'new@test.com', role_id: 2, is_active: true };
        (userService.create as vi.Mock).mockResolvedValue({ id: 2, ...newUser });

        render(
            <UserDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.CREATE}
            />
        );
        
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@test.com' } });
        // antd select is complex to test with fireEvent, this is a simplified approach
        // In a real scenario, you might need a more complex setup to handle dropdowns
        fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 2 } }); 

        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(userService.create).toHaveBeenCalledWith(expect.objectContaining(newUser));
        });
    });

    it('calls userService.update when updating an existing user', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role_id: 1, is_active: true };
        const updatedUserData = { username: 'updateduser' };
        (userService.update as vi.Mock).mockResolvedValue({ ...mockUser, ...updatedUserData });

        render(
            <UserDialog
                dialogOpen={true}
                handleClose={handleClose}
                dialogMode={DialogModes.UPDATE}
                user={mockUser}
            />
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'updateduser' } });
        fireEvent.click(screen.getByText('Guardar'));

        await vi.waitFor(() => {
            expect(userService.update).toHaveBeenCalledWith({ ...mockUser, username: 'updateduser' });
        });
    });
});
