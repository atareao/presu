import { BASE_URL } from '@/constants';
import type Response from '@/models/response';

const STATS_BASE_PATH = `${BASE_URL}/api/v1/stats`;

export const fetchProjectsStats = async (): Promise<Response<number>> => {
    return fetchStats('projects');
};

export const fetchBudgetsStats = async (): Promise<Response<number>> => {
    return fetchStats('budgets');
};

const fetchStats = async (endpoint: string): Promise<Response<number>> => {
    const url = `${STATS_BASE_PATH}/${endpoint}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            let errorBody: { message?: string } = {};
            try {
                errorBody = await response.json();
            } catch (e) {
                // Ignore if cannot parse
            }

            return {
                status: response.status,
                message: errorBody.message || `Error HTTP: ${response.status} - ${response.statusText}`
            };
        }

        return await response.json();

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`Network Error or Fetch Failure for ${endpoint}:`, msg, error);

        return {
            status: 500,
            message: `Network or Unknown Error: ${msg}`
        };
    }
};
