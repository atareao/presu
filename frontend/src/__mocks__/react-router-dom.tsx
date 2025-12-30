import React from 'react';
import { vi } from 'vitest';
import { MemoryRouter as OriginalMemoryRouter, useNavigate as OriginalUseNavigate, Link as OriginalLink, Outlet as OriginalOutlet, Route as OriginalRoute, Routes as OriginalRoutes, useLocation as OriginalUseLocation, useParams as OriginalUseParams, useMatch as OriginalUseMatch } from 'react-router-dom';

// Mock useNavigate to control its behavior in tests
export const useNavigate = vi.fn();

// Export actual components where possible to retain their functionality
export const MemoryRouter = OriginalMemoryRouter;
export const Link = OriginalLink;
export const Outlet = OriginalOutlet;
export const Route = OriginalRoute;
export const Routes = OriginalRoutes;
export const useLocation = OriginalUseLocation;
export const useParams = OriginalUseParams;
export const useMatch = OriginalUseMatch;
