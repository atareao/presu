// src/services/__tests__/budget.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { budgetService } from '../budget.service';
import { BASE_URL } from '@/constants';
import type { Budget } from '@/models';
import { BudgetStatus } from '@/models/budget';

const mockBudget: Budget = {
    id: 1,
    project_id: 1,
    code: "BGT-001",
    version_number: 1,
    name: "Budget Test",
    status: BudgetStatus.Draft,
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/budgets`, async ({ request }) => {
        const newBudget = (await request.json()) as Partial<Budget>;
        return HttpResponse.json({ id: 1, ...newBudget }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/budgets`, () => {
        return HttpResponse.json([mockBudget]);
    }),
    http.get(`${BASE_URL}/api/v1/budgets/1`, () => {
        return HttpResponse.json(mockBudget);
    }),
    http.patch(`${BASE_URL}/api/v1/budgets/:id`, async ({ request }) => {
        const updatedBudget = (await request.json()) as Partial<Budget>;
        return HttpResponse.json({ ...mockBudget, ...updatedBudget });
    }),
    http.delete(`${BASE_URL}/api/v1/budgets/1`, () => {
        return HttpResponse.json(mockBudget);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Budget Service', () => {
    it('should create a budget correctly via POST', async () => {
        const { id, ...rest } = mockBudget;
        const result = await budgetService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all budgets correctly via GET', async () => {
        const result = await budgetService.readAll();
        expect(result).toEqual([mockBudget]);
    });

    it('should read a budget by id correctly via GET', async () => {
        const result = await budgetService.readById(1);
        expect(result).toEqual(mockBudget);
    });

    it('should update a budget correctly via PATCH', async () => {
        const updatedData = { name: "Updated Budget Name" };
        const result = await budgetService.update({ ...mockBudget, ...updatedData });
        expect(result.name).toBe("Updated Budget Name");
    });

    it('should delete a budget correctly via DELETE', async () => {
        const result = await budgetService.delete(1);
        expect(result).toEqual(mockBudget);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/budgets`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(budgetService.create({})).rejects.toThrow();
    });
});
