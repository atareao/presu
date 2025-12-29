// src/services/__tests__/role.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { roleService } from '../role.service';
import { BASE_URL } from '@/constants';
import type { Role } from '@/models';

const mockRole: Role = {
    id: 1,
    name: 'admin',
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/roles`, async ({ request }) => {
        const newRole = (await request.json()) as Partial<Role>;
        return HttpResponse.json({ id: 1, ...newRole }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/roles`, () => {
        return HttpResponse.json([mockRole]);
    }),
    http.get(`${BASE_URL}/api/v1/roles/1`, () => {
        return HttpResponse.json(mockRole);
    }),
    http.patch(`${BASE_URL}/api/v1/roles/:id`, async ({ request }) => {
        const updatedRole = (await request.json()) as Partial<Role>;
        return HttpResponse.json({ ...mockRole, ...updatedRole });
    }),
    http.delete(`${BASE_URL}/api/v1/roles/1`, () => {
        return HttpResponse.json(mockRole);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Role Service', () => {
    it('should create a role correctly via POST', async () => {
        const { id, ...rest } = mockRole;
        const result = await roleService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all roles correctly via GET', async () => {
        const result = await roleService.readAll();
        expect(result).toEqual([mockRole]);
    });

    it('should read a role by id correctly via GET', async () => {
        const result = await roleService.readById(1);
        expect(result).toEqual(mockRole);
    });

    it('should update a role correctly via PATCH', async () => {
        const updatedData = { name: "user" };
        const result = await roleService.update({ ...mockRole, ...updatedData });
        expect(result.name).toBe("user");
    });

    it('should delete a role correctly via DELETE', async () => {
        const result = await roleService.delete(1);
        expect(result).toEqual(mockRole);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/roles`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(roleService.create({})).rejects.toThrow();
    });
});
