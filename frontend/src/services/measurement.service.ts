import { apiClient } from "./api.client";
import type { Measurement } from "@/models";

const ENDPOINT = "/api/v1/measurements";

export const measurementService = {
    readAll: (): Promise<Measurement[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Measurement> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
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
