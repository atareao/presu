import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';


describe('LoginPage', () => {
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

    it('renders login form when there are users', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 1 }), // Simulating users exist
        });

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <LoginPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
        });
    });

    it('redirects to register page if no users exist', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 0 }), // Simulating no users
        });
        
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <AuthContext.Provider value={mockAuthContext}>
                        <LoginPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(mockUseNavigate).toHaveBeenCalledWith('/register', { replace: true });
        });
    });

    it('calls login function on successful form submission', async () => {
        (global.fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: 1 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { token: 'fake-token' } }),
            });

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <LoginPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
            fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
            fireEvent.click(screen.getByText('Acceder'));
        });

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith('fake-token');
        });
    });
});
