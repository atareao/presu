// src/services/__tests__/measurement.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { measurementService } from '../measurement.service';
import { BASE_URL } from '@/constants';
import type { Measurement } from '@/models';

const mockMeasurement: Measurement = {
    id: 1,
    element_id: 1,
    price_id: 1,
    params_json: {},
    measured_quantity: 100
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/measurements`, async ({ request }) => {
        const newMeasurement = (await request.json()) as Partial<Measurement>;
        return HttpResponse.json({ id: 1, ...newMeasurement }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/measurements`, () => {
        return HttpResponse.json([mockMeasurement]);
    }),
    http.get(`${BASE_URL}/api/v1/measurements/1`, () => {
        return HttpResponse.json(mockMeasurement);
    }),
    http.patch(`${BASE_URL}/api/v1/measurements/:id`, async ({ request }) => {
        const updatedMeasurement = (await request.json()) as Partial<Measurement>;
        return HttpResponse.json({ ...mockMeasurement, ...updatedMeasurement });
    }),
    http.delete(`${BASE_URL}/api/v1/measurements/1`, () => {
        return HttpResponse.json(mockMeasurement);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Measurement Service', () => {
    it('should create a measurement correctly via POST', async () => {
        const { id, ...rest } = mockMeasurement;
        const result = await measurementService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all measurements correctly via GET', async () => {
        const result = await measurementService.readAll();
        expect(result).toEqual([mockMeasurement]);
    });

    it('should read a measurement by id correctly via GET', async () => {
        const result = await measurementService.readById(1);
        expect(result).toEqual(mockMeasurement);
    });

    it('should update a measurement correctly via PATCH', async () => {
        const updatedData = { measured_quantity: 200 };
        const result = await measurementService.update({ ...mockMeasurement, ...updatedData });
        expect(result.measured_quantity).toBe(200);
    });

    it('should delete a measurement correctly via DELETE', async () => {
        const result = await measurementService.delete(1);
        expect(result).toEqual(mockMeasurement);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/measurements`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(measurementService.create({})).rejects.toThrow();
    });
});
