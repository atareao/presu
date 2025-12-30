// src/pages/admin/__tests__/AdminHomePage.test.tsx
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminHomePage from '../AdminHomePage';
import * as utils from '@/common/utils';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

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
    const mockUseNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as vi.Mock).mockReturnValue(mockUseNavigate);
    });

    it('fetches and displays dashboard data', async () => {
        (utils.loadData as vi.Mock)
            .mockResolvedValueOnce({ data: 10 }) // projects
            .mockResolvedValueOnce({ data: 25 }); // budgets

        await act(async () => {
            render(
                <MemoryRouter>
                    <AdminHomePage />
                </MemoryRouter>
            );
        });

        expect(screen.getByText(/Projectos/)).toBeInTheDocument();
        expect(screen.getByText(/Presupuestos/)).toBeInTheDocument();

        await act(async () => {
            // Allow promises to resolve and component to update
            await vi.waitFor(() => {
                expect(utils.loadData).toHaveBeenCalledWith('stats/projects');
                expect(utils.loadData).toHaveBeenCalledWith('stats/budgets');
            });
        });

        expect(screen.getByText('Projectos: 10')).toBeInTheDocument();
        expect(screen.getByText('Presupuestos: 25')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
        (utils.loadData as vi.Mock).mockRejectedValue(new Error('API Error'));

        await act(async () => {
            render(
                <MemoryRouter>
                    <AdminHomePage />
                </MemoryRouter>
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
