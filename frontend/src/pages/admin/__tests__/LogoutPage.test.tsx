import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutPage from '../LogoutPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';

describe('LogoutPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls logout and redirects to home', async () => {
        const logout = vi.fn();
        const mockUseNavigate = vi.fn();
        vi.mock('react-router-dom', async (importOriginal) => {
            const actual = await importOriginal();
            return {
                ...actual,
                useNavigate: () => mockUseNavigate,
            };
        });

        await act(async () => {
            render(
                <AuthContext.Provider value={{ logout, isAuthenticated: true, user: null, login: vi.fn() }}>
                    <LogoutPage />
                </AuthContext.Provider>
            );
        });

        expect(logout).toHaveBeenCalled();
        expect(mockUseNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
});