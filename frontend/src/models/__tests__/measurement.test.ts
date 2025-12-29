// src/models/__tests__/measurement.test.ts
import { describe, it, expect } from 'vitest';
import type { Measurement } from '../measurement';

describe('Measurement Model', () => {
    it('should have the correct types for the Measurement interface', () => {
        const measurement: Measurement = {
            element_id: 1,
            price_id: 1,
            params_json: {},
            measured_quantity: 100,
        };
        expect(measurement).toBeDefined();
    });
});
