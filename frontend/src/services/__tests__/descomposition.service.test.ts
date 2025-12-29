// src/services/__tests__/descomposition.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { descompositionService } from '../descomposition.service';
import { BASE_URL } from '@/constants';
import type { Descomposition } from '@/models';
import { CalculationMode } from '@/models/descomposition';

const mockDescomposition: Descomposition = {
    id: 1,
    parent_price_id: 1,
    component_price_id: 2,
    calculation_mode: CalculationMode.Fixed,
    fixed_quantity: 10,
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/descompositions`, async ({ request }) => {
        const newDescomposition = (await request.json()) as Partial<Descomposition>;
        return HttpResponse.json({ id: 1, ...newDescomposition }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/descompositions`, () => {
        return HttpResponse.json([mockDescomposition]);
    }),
    http.get(`${BASE_URL}/api/v1/descompositions/1`, () => {
        return HttpResponse.json(mockDescomposition);
    }),
    http.patch(`${BASE_URL}/api/v1/descompositions/:id`, async ({ request }) => {
        const updatedDescomposition = (await request.json()) as Partial<Descomposition>;
        return HttpResponse.json({ ...mockDescomposition, ...updatedDescomposition });
    }),
    http.delete(`${BASE_URL}/api/v1/descompositions/1`, () => {
        return HttpResponse.json(mockDescomposition);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Descomposition Service', () => {
    it('should create a descomposition correctly via POST', async () => {
        const { id, ...rest } = mockDescomposition;
        const result = await descompositionService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all descompositions correctly via GET', async () => {
        const result = await descompositionService.readAll();
        expect(result).toEqual([mockDescomposition]);
    });

    it('should read a descomposition by id correctly via GET', async () => {
        const result = await descompositionService.readById(1);
        expect(result).toEqual(mockDescomposition);
    });

    it('should update a descomposition correctly via PATCH', async () => {
        const updatedData = { fixed_quantity: 20 };
        const result = await descompositionService.update({ ...mockDescomposition, ...updatedData });
        expect(result.fixed_quantity).toBe(20);
    });

    it('should delete a descomposition correctly via DELETE', async () => {
        const result = await descompositionService.delete(1);
        expect(result).toEqual(mockDescomposition);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/descompositions`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(descompositionService.create({})).rejects.toThrow();
    });
});
