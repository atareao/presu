import { apiClient } from "./api.client";
import type { Descomposition } from "@/models";

const ENDPOINT = "/api/v1/descompositions";

export const descompositionService = {
    readAll: (): Promise<Descomposition[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Descomposition> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (descomposition: Partial<Descomposition>): Promise<Descomposition> => {
        return apiClient.post(ENDPOINT, descomposition);
    },

    update: (descomposition: Partial<Descomposition>): Promise<Descomposition> => {
        return apiClient.patch(ENDPOINT, descomposition);
    },

    delete: (id: number): Promise<Descomposition> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
