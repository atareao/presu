// src/models/__tests__/project.test.ts
import { describe, it, expect } from 'vitest';
import type { Project } from '../project';

describe('Project Model', () => {
    it('should have the correct types for the Project interface', () => {
        const project: Project = {
            id: -1,
            code: 'PRJ-001',
            title: 'Proyecto de Test',
        };
        expect(project).toBeDefined();
    });
});
