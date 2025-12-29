// src/models/__tests__/element.test.ts
import { describe, it, expect } from 'vitest';
import { ElementType } from '../element';
import type { Element } from '../element';

describe('Element Model', () => {
    it('should have the correct values for ElementType enum', () => {
        expect(ElementType.Chapter).toBe('chapter');
        expect(ElementType.Line).toBe('line');
    });

    it('should have the correct types for the Element interface', () => {
        const element: Element = {
            budget_id: 1,
            version_id: 1,
            element_type: ElementType.Line,
            code: '01',
            budget_code: '01',
        };
        expect(element).toBeDefined();
    });
});
