// src/models/__tests__/role.test.ts
import { describe, it, expect } from 'vitest';
import type { Role } from '../role';

describe('Role Model', () => {
    it('should have the correct types for the Role interface', () => {
        const role: Role = {
            id: -1,
            name: 'admin',
        };
        expect(role).toBeDefined();
    });
});
