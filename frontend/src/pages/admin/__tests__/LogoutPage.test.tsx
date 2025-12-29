import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import LogoutPage from '../LogoutPage';
import AuthContext from '@/components/AuthContext';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ element }: { element: React.ReactElement }) => element,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Navigate: vi.fn(() => null),
}));

describe('LogoutPage', () => {
    it('calls logout and redirects to home', () => {
        const logout = vi.fn();

        render(
            <AuthContext.Provider value={{ logout, isAuthenticated: true, user: null, login: vi.fn() }}>
                <MemoryRouter initialEntries={['/logout']}>
                    <Routes>
                        <Route path="/logout" element={<LogoutPage />} />
                        <Route path="/" element={<div>Home Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(logout).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith({ to: "/" }, { replace: true });
    });
});
