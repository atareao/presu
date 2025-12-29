// src/models/__tests__/budget.test.ts
import { describe, it, expect } from 'vitest';
import { BudgetStatus } from '../index';

describe('Budget Model', () => {
    it('debería tener el estado inicial como Draft', () => {
        const status = BudgetStatus.Draft;
        expect(status).toBe('draft');
    });
});
