import React from 'react';
import { vi } from 'vitest';

export const useNavigate = vi.fn(() => vi.fn());
export const MemoryRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ element }: { element: React.ReactElement }) => element;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Navigate = vi.fn(() => null);
