// src/models/__tests__/user.test.ts
import { describe, it, expect } from 'vitest';
import type { User } from '../user';

describe('User Model', () => {
    it('should have the correct types for the User interface', () => {
        const user: User = {
            username: 'testuser',
            email: 'test@example.com',
            hashed_password: 'password',
            role_id: 1,
            is_active: true,
        };
        expect(user).toBeDefined();
    });
});
