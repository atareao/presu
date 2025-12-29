// src/services/__tests__/element.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { elementService } from '../element.service';
import { BASE_URL } from '@/constants';
import type { Element } from '@/models';
import { ElementType } from '@/models/element';

const mockElement: Element = {
    id: 1,
    budget_id: 1,
    version_id: 1,
    element_type: ElementType.Line,
    code: "01",
    budget_code: "01"
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/elements`, async ({ request }) => {
        const newElement = (await request.json()) as Partial<Element>;
        return HttpResponse.json({ id: 1, ...newElement }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/elements`, () => {
        return HttpResponse.json([mockElement]);
    }),
    http.get(`${BASE_URL}/api/v1/elements/1`, () => {
        return HttpResponse.json(mockElement);
    }),
    http.patch(`${BASE_URL}/api/v1/elements/:id`, async ({ request }) => {
        const updatedElement = (await request.json()) as Partial<Element>;
        return HttpResponse.json({ ...mockElement, ...updatedElement });
    }),
    http.delete(`${BASE_URL}/api/v1/elements/1`, () => {
        return HttpResponse.json(mockElement);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Element Service', () => {
    it('should create an element correctly via POST', async () => {
        const { id, ...rest } = mockElement;
        const result = await elementService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all elements correctly via GET', async () => {
        const result = await elementService.readAll();
        expect(result).toEqual([mockElement]);
    });

    it('should read an element by id correctly via GET', async () => {
        const result = await elementService.readById(1);
        expect(result).toEqual(mockElement);
    });

    it('should update an element correctly via PATCH', async () => {
        const updatedData = { code: "02" };
        const result = await elementService.update({ ...mockElement, ...updatedData });
        expect(result.code).toBe("02");
    });

    it('should delete an element correctly via DELETE', async () => {
        const result = await elementService.delete(1);
        expect(result).toEqual(mockElement);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/elements`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(elementService.create({})).rejects.toThrow();
    });
});
