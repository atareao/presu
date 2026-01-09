import { apiClient } from "./api.client";
import type { Unit } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/units";

export const unitService = {
    readAll: (): Promise<Response<Unit[]>> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Unit> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Unit[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (unit: Partial<Unit>): Promise<Unit> => {
        return apiClient.post(ENDPOINT, unit);
    },

    update: (unit: Partial<Unit>): Promise<Unit> => {
        return apiClient.patch(ENDPOINT, unit);
    },

    delete: (unit: Partial<Unit>): Promise<Unit> => {
        return apiClient.delete(ENDPOINT, unit);
    },

};
