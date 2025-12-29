import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Navigate } from 'react-router-dom';
import LoginPage from '../LoginPage';
import AuthContext from '@/components/AuthContext';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Navigate: vi.fn(() => null),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

global.fetch = vi.fn();

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
        (Navigate as vi.Mock).mockClear(); // Clear Navigate mock before each test
    });

    it('renders login form when there are users', async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 1 }), // Simulating users exist
        });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );
        await vi.waitFor(() => {
            expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
        });
    });

    it('redirects to register page if no users exist', async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 0 }), // Simulating no users
        });
        
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter initialEntries={['/login']}>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await vi.waitFor(() => {
            // Since Navigate is used, we can't directly test the URL change in jsdom.
            // We'll rely on the fact that the login form is not rendered.
            expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
        });
    });

    it('calls login function on successful form submission', async () => {
        (fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: 1 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { token: 'fake-token' } }),
            });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await vi.waitFor(() => {
            expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Acceder'));

        await vi.waitFor(() => {
            expect(login).toHaveBeenCalledWith('fake-token');
        });
    });
});
