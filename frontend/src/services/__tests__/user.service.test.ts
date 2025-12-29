// src/services/__tests__/user.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { userService } from '../user.service';
import { BASE_URL } from '@/constants';
import type { User } from '@/models';

const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    hashed_password: 'password',
    role_id: 1,
    is_active: true,
};

const server = setupServer(
    http.post(`${BASE_URL}/api/v1/users`, async ({ request }) => {
        const newUser = (await request.json()) as Partial<User>;
        return HttpResponse.json({ id: 1, ...newUser }, { status: 201 });
    }),
    http.get(`${BASE_URL}/api/v1/users`, () => {
        return HttpResponse.json([mockUser]);
    }),
    http.get(`${BASE_URL}/api/v1/users/1`, () => {
        return HttpResponse.json(mockUser);
    }),
    http.patch(`${BASE_URL}/api/v1/users/:id`, async ({ request }) => {
        const updatedUser = (await request.json()) as Partial<User>;
        return HttpResponse.json({ ...mockUser, ...updatedUser });
    }),
    http.delete(`${BASE_URL}/api/v1/users/1`, () => {
        return HttpResponse.json(mockUser);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('User Service', () => {
    it('should create a user correctly via POST', async () => {
        const { id, ...rest } = mockUser;
        const result = await userService.create(rest);
        expect(result.id).toBe(1);
    });

    it('should read all users correctly via GET', async () => {
        const result = await userService.readAll();
        expect(result).toEqual([mockUser]);
    });

    it('should read a user by id correctly via GET', async () => {
        const result = await userService.readById(1);
        expect(result).toEqual(mockUser);
    });

    it('should update a user correctly via PATCH', async () => {
        const updatedData = { is_active: false };
        const result = await userService.update({ ...mockUser, ...updatedData });
        expect(result.is_active).toBe(false);
    });

    it('should delete a user correctly via DELETE', async () => {
        const result = await userService.delete(1);
        expect(result).toEqual(mockUser);
    });

    it('should throw an error if the server responds with 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/v1/users`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        await expect(userService.create({})).rejects.toThrow();
    });
});
