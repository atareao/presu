import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutPage from '../LogoutPage';
import AuthContext from '@/components/AuthContext';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

describe('LogoutPage', () => {
    const mockUseNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as vi.Mock).mockReturnValue(mockUseNavigate);
    });

    it('calls logout and redirects to home', async () => {
        const logout = vi.fn();

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContext.Provider value={{ logout, isAuthenticated: true, user: null, login: vi.fn() }}>
                        <LogoutPage />
                    </AuthContext.Provider>
                </MemoryRouter>
            );
        });

        expect(logout).toHaveBeenCalled();
        expect(mockUseNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
});
