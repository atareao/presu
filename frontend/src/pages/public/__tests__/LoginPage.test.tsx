import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';

describe('LoginPage', () => {
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

    it('renders login form when there are users', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 1 }), // Simulating users exist
        });

        await act(async () => {
            render(
                <AuthContext.Provider value={mockAuthContext}>
                    <LoginPage />
                </AuthContext.Provider>
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
                <AuthContext.Provider value={mockAuthContext}>
                    <LoginPage />
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            const { useNavigate } = require('react-router-dom');
            const mockUseNavigate = useNavigate();
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
                <AuthContext.Provider value={mockAuthContext}>
                    <LoginPage />
                </AuthContext.Provider>
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