// src/services/__tests__/price.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { priceService } from '../price.service';
import { BASE_URL } from '@/constants';
import type { Price } from '@/models';
import { PriceType } from '@/models/price';

const mockPrice: Price = {
    id: 1,
    version_id: 1,
    code: "01.01",
    description: "Mano de obra",
    base_price: 50,
    unit_id: 1,
    price_type: PriceType.Base,
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/prices`, async ({ request }) => {
        const newPrice = (await request.json()) as Partial<Price>;
        return HttpResponse.json({ id: 1, ...newPrice }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/prices`, () => {
        return HttpResponse.json([mockPrice]);
    }),
    http.get(`${BASE_URL}/api/v1/prices/1`, () => {
        return HttpResponse.json(mockPrice);
    }),
    http.patch(`${BASE_URL}/api/v1/prices/:id`, async ({ request }) => {
        const updatedPrice = (await request.json()) as Partial<Price>;
        return HttpResponse.json({ ...mockPrice, ...updatedPrice });
    }),
    http.delete(`${BASE_URL}/api/v1/prices/1`, () => {
        return HttpResponse.json(mockPrice);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Price Service', () => {
    it('should create a price correctly via POST', async () => {
        const { id, ...rest } = mockPrice;
        const result = await priceService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all prices correctly via GET', async () => {
        const result = await priceService.readAll();
        expect(result).toEqual([mockPrice]);
    });

    it('should read a price by id correctly via GET', async () => {
        const result = await priceService.readById(1);
        expect(result).toEqual(mockPrice);
    });

    it('should update a price correctly via PATCH', async () => {
        const updatedData = { base_price: 60 };
        const result = await priceService.update({ ...mockPrice, ...updatedData });
        expect(result.base_price).toBe(60);
    });

    it('should delete a price correctly via DELETE', async () => {
        const result = await priceService.delete(1);
        expect(result).toEqual(mockPrice);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/prices`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(priceService.create({})).rejects.toThrow();
    });
});
