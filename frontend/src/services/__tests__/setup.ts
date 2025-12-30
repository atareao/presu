import '@testing-library/jest-dom'; // Matchers personalizados como toBeInTheDocument()
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { vi } from 'vitest';
import React from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Global mock for react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    const mockUseNavigate = vi.fn();
    return {
        ...actual,
        useNavigate: () => mockUseNavigate,
        // Use MemoryRouter for testing, which doesn't interact with the browser's URL
        BrowserRouter: actual.MemoryRouter,
    };
});

// Global mock for Ant Design Form.useForm and message
const mockFormInstance = {
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn(() => Promise.resolve({})),
    getFieldsValue: vi.fn(() => ({})),
};

vi.mock('antd', async (importOriginal) => {
    const antd = await importOriginal();
    return {
        ...antd,
        Form: {
            ...antd.Form,
            useForm: vi.fn(() => [mockFormInstance]),
        },
        message: {
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});

// 1. Definimos manejadores (handlers) globales por defecto
// Puedes añadir aquí los que se usen en casi todos los tests (ej. auth, roles)
export const handlers = [];

// 2. Creamos el servidor de MSW
export const server = setupServer(...handlers);

// 3. Ciclo de vida de los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Limpiar después de cada test para que los mocks específicos no interfieran
afterEach(() => server.resetHandlers());

// Cerrar el servidor al terminar todos los tests
afterAll(() => server.close());
