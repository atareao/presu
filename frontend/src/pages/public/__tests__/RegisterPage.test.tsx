import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Navigate } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
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
        (Navigate as vi.Mock).mockClear(); // Clear Navigate mock before each test
    });

    it('renders register form when no users exist', async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: 0 }),
        });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );
        await vi.waitFor(() => {
            expect(screen.getByText('Registrar usuario')).toBeInTheDocument();
        });
    });

    it('redirects to login page if users exist', async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: 1 }),
        });
        
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter initialEntries={['/register']}>
                    <RegisterPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await vi.waitFor(() => {
            expect(screen.queryByText('Registrar usuario')).not.toBeInTheDocument();
        });
    });

    it('calls login function on successful registration', async () => {
        (fetch as vi.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ users: 0 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { token: 'fake-token' } }),
            });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await vi.waitFor(() => {
            expect(screen.getByText('Registrar usuario')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'test' } });
        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
        fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Registrar'));

        await vi.waitFor(() => {
            expect(login).toHaveBeenCalledWith('fake-token');
        });
    });
});
