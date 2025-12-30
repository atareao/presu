import { apiClient } from "./api.client";
import type { Measurement } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/measurements";

export const measurementService = {
    readAll: (): Promise<Measurement[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Measurement> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Measurement[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (measurement: Partial<Measurement>): Promise<Measurement> => {
        return apiClient.post(ENDPOINT, measurement);
    },

    update: (measurement: Partial<Measurement>): Promise<Measurement> => {
        return apiClient.patch(ENDPOINT, measurement);
    },

    delete: (id: number): Promise<Measurement> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
