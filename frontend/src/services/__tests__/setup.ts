import '@testing-library/jest-dom'; // Matchers personalizados como toBeInTheDocument()
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BASE_URL } from '@/constants';

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
