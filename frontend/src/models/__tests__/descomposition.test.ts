// src/models/__tests__/descomposition.test.ts
import { describe, it, expect } from 'vitest';
import { CalculationMode } from '../descomposition';
import type { Descomposition } from '../descomposition';

describe('Descomposition Model', () => {
    it('should have the correct values for CalculationMode enum', () => {
        expect(CalculationMode.Fixed).toBe('fixed');
        expect(CalculationMode.Formula).toBe('formula');
    });

    it('should have the correct types for the Descomposition interface', () => {
        const descomposition: Descomposition = {
            parent_price_id: 1,
            component_price_id: 2,
            calculation_mode: CalculationMode.Fixed,
        };
        expect(descomposition).toBeDefined();
    });
});
