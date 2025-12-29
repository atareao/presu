// src/pages/admin/__tests__/AdminHomePage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminHomePage from '../AdminHomePage';
import * as utils from '@/common/utils';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the utils module
vi.mock('@/common/utils', () => ({
    loadData: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('AdminHomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and displays dashboard data', async () => {
        (utils.loadData as vi.Mock)
            .mockResolvedValueOnce({ data: 10 }) // projects
            .mockResolvedValueOnce({ data: 25 }); // budgets

        render(
            <MemoryRouter>
                <AdminHomePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Projectos/)).toBeInTheDocument();
        expect(screen.getByText(/Presupuestos/)).toBeInTheDocument();

        await vi.waitFor(() => {
            expect(utils.loadData).toHaveBeenCalledWith('stats/projects');
            expect(utils.loadData).toHaveBeenCalledWith('stats/budgets');
        });

        await vi.waitFor(() => {
            expect(screen.getByText('Projectos: 10')).toBeInTheDocument();
            expect(screen.getByText('Presupuestos: 25')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        (utils.loadData as vi.Mock).mockRejectedValue(new Error('API Error'));

        render(
            <MemoryRouter>
                <AdminHomePage />
            </MemoryRouter>
        );

        await vi.waitFor(() => {
            // Check that the loading indicator is gone
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
        
        // The component should still render, but with default values
        expect(screen.getByText('Projectos: 0')).toBeInTheDocument();
        expect(screen.getByText('Presupuestos: 0')).toBeInTheDocument();
    });
});
