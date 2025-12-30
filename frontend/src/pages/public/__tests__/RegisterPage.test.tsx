import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';


describe('RegisterPage', () => {
    const login = vi.fn();
    const mockUseNavigate = vi.fn();
    const mockAuthContext = {
        isLoggedIn: false,
        role: null,
        login,
        logout: vi.fn(),
        user: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as vi.Mock).mockReturnValue(mockUseNavigate);
        mockUseNavigate.mockClear();
        global.fetch = vi.fn(); // Correctly mock global.fetch in beforeEach
    });

    it('renders register form when no users exist', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: 0 }),
        });

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <RegisterPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Registrar usuario')).toBeInTheDocument();
        });
    });

    it('redirects to login page if users exist', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: 1 }),
        });
        
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/register']}>
                    <AuthContext.Provider value={mockAuthContext}>
                        <RegisterPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(mockUseNavigate).toHaveBeenCalledWith('/login', { replace: true });
        });
    });

    it('calls login function on successful registration', async () => {
        (global.fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ users: 0 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { token: 'fake-token' } }),
            });

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <RegisterPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Registrar usuario')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'test' } });
            fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
            fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
            fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'password' } });
            fireEvent.click(screen.getByText('Registrar'));
        });

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith('fake-token');
        });
    });
});
