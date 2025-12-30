import { apiClient } from "./api.client";
import type { Budget } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/budgets";

export const budgetService = {
    /**
     * Recupera todos los presupuestos.
     * Soporta los parámetros de paginación y filtrado definidos en BudgetParams de Rust.
     */
    readAll: (params?: Record<string, any>): Promise<Budget[]> => {
        // Si hay parámetros (page, limit, status...), los añadimos a la URL
        const query = params ? `?${new URLSearchParams(params).toString()}` : "";
        return apiClient.get(`${ENDPOINT}${query}`);
    },

    /**
     * Recupera un presupuesto específico por su ID.
     */
    readById: (id: number): Promise<Budget> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Budget[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    /**
     * Crea un nuevo presupuesto.
     */
    create: (budget: Partial<Budget>): Promise<Budget> => {
        return apiClient.post(ENDPOINT, budget);
    },

    /**
     * Actualiza un presupuesto existente.
     * Nota: Usamos PATCH o PUT según cómo esté configurado tu endpoint en Axum.
     */
    update: (budget: Partial<Budget>): Promise<Budget> => {
        return apiClient.patch(ENDPOINT, budget);
    },

    /**
     * Elimina un presupuesto por ID.
     */
    delete: (budget: Partial<Budget>): Promise<Budget> => {
        return apiClient.delete(ENDPOINT, budget);
    }
};
