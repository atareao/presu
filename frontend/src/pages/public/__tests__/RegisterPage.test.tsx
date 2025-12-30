import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';

describe('RegisterPage', () => {
    const login = vi.fn();
    const mockAuthContext = {
        isLoggedIn: false,
        role: null,
        login,
        logout: vi.fn(),
        user: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock useNavigate locally since the global mock in setup.ts might be overwritten by other imports
        const mockUseNavigate = vi.fn();
        vi.mock('react-router-dom', async (importOriginal) => {
            const actual = await importOriginal();
            return {
                ...actual,
                useNavigate: () => mockUseNavigate,
            };
        });
        global.fetch = vi.fn(); // Correctly mock global.fetch in beforeEach
    });

    it('renders register form when no users exist', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: 0 }),
        });

        await act(async () => {
            render(
                <AuthContext.Provider value={mockAuthContext}>
                    <RegisterPage />
                </AuthContext.Provider>
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
                <AuthContext.Provider value={mockAuthContext}>
                    <RegisterPage />
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            const { useNavigate } = require('react-router-dom');
            const mockUseNavigate = useNavigate();
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
                <AuthContext.Provider value={mockAuthContext}>
                    <RegisterPage />
                </AuthContext.Provider>
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