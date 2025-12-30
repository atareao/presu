import AdminHomePage from '../AdminHomePage';
import * as statsService from '@/services/stats.service';
import React from 'react';

// Mock the services module
vi.mock('@/services/stats.service', () => ({
    fetchProjectsStats: vi.fn(),
    fetchBudgetsStats: vi.fn(),
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
        (statsService.fetchProjectsStats as vi.Mock)
            .mockResolvedValue({ data: 10 }); 
        (statsService.fetchBudgetsStats as vi.Mock)
            .mockResolvedValue({ data: 25 }); 

        await act(async () => {
            render(
                <AdminHomePage />
            );
        });

        expect(screen.getByText(/Projectos/)).toBeInTheDocument();
        expect(screen.getByText(/Presupuestos/)).toBeInTheDocument();

        await act(async () => {
            // Allow promises to resolve and component to update
            await vi.waitFor(() => {
                expect(statsService.fetchProjectsStats).toHaveBeenCalledTimes(1);
                expect(statsService.fetchBudgetsStats).toHaveBeenCalledTimes(1);
            });
        });

        expect(screen.getByText('Projectos: 10')).toBeInTheDocument();
        expect(screen.getByText('Presupuestos: 25')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
        (statsService.fetchProjectsStats as vi.Mock).mockRejectedValue(new Error('API Error'));
        (statsService.fetchBudgetsStats as vi.Mock).mockRejectedValue(new Error('API Error'));

        await act(async () => {
            render(
                <AdminHomePage />
            );
        });

        await act(async () => {
            // Check that the loading indicator is gone
            await vi.waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
        
        // The component should still render, but with default values
        expect(screen.getByText('Projectos: 0')).toBeInTheDocument();
        expect(screen.getByText('Presupuestos: 0')).toBeInTheDocument();
    });
});