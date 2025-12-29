import { apiClient } from "./api.client";
import type { Element } from "@/models";

const ENDPOINT = "/api/v1/elements";

export const elementService = {
    readAll: (): Promise<Element[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Element> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (element: Partial<Element>): Promise<Element> => {
        return apiClient.post(ENDPOINT, element);
    },

    update: (element: Partial<Element>): Promise<Element> => {
        return apiClient.patch(ENDPOINT, element);
    },

    delete: (id: number): Promise<Element> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
