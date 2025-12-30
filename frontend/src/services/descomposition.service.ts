import { apiClient } from "./api.client";
import type { Descomposition } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/descompositions";

export const descompositionService = {
    readAll: (): Promise<Descomposition[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Descomposition> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Descomposition[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (descomposition: Partial<Descomposition>): Promise<Descomposition> => {
        return apiClient.post(ENDPOINT, descomposition);
    },

    update: (descomposition: Partial<Descomposition>): Promise<Descomposition> => {
        return apiClient.patch(ENDPOINT, descomposition);
    },

    delete: (descomposition: Partial<Descomposition>): Promise<Descomposition> => {
        return apiClient.delete(ENDPOINT, descomposition);
    },
};
