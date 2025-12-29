// src/models/__tests__/price.test.ts
import { describe, it, expect } from 'vitest';
import { PriceType } from '../price';
import type { Price } from '../price';

describe('Price Model', () => {
    it('should have the correct values for PriceType enum', () => {
        expect(PriceType.Base).toBe('base');
        expect(PriceType.Decomposed).toBe('decomposed');
    });

    it('should have the correct types for the Price interface', () => {
        const price: Price = {
            version_id: 1,
            code: '01.01',
            description: 'Mano de obra',
            base_price: 50,
            unit_id: 1,
            price_type: PriceType.Base,
        };
        expect(price).toBeDefined();
    });
});
