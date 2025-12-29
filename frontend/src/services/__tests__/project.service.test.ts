import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { projectService } from '../project.service';
import { BASE_URL } from '@/constants';
import type { Project } from '@/models';

// 1. Configuramos el servidor ficticio (Mock)
const server = setupServer(
    http.post(`${BASE_URL}/api/v1/projects`, async ({ request }) => {
        const newProject = (await request.json()) as Partial<Project>;
        // Simulamos la respuesta de Rust (con el ID ya asignado)
        return HttpResponse.json({ id: 1, ...newProject }, { status: 201 });
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Project Service', () => {
    it('debería crear un proyecto correctamente mediante POST', async () => {
        const mockProject = {
            code: "PRJ-001",
            title: "Proyecto de Test"
        };

        const result = await projectService.create(mockProject);

        expect(result.id).toBe(1);
        expect(result.code).toBe("PRJ-001");
    });

    it('debería lanzar un error si el servidor de Rust responde con 500', async () => {
        // Forzamos un error para este test específico
        server.use(
            http.post(`${BASE_URL}/api/v1/projects`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        await expect(projectService.create({})).rejects.toThrow();
    });
});
