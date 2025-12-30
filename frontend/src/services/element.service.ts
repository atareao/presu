import { apiClient } from "./api.client";
import type { Element } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/elements";

export const elementService = {
    readAll: (): Promise<Element[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Element> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Element[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (element: Partial<Element>): Promise<Element> => {
        return apiClient.post(ENDPOINT, element);
    },

    update: (element: Partial<Element>): Promise<Element> => {
        return apiClient.patch(ENDPOINT, element);
    },

    delete: (element: Partial<Element>): Promise<Element> => {
        return apiClient.delete(ENDPOINT, element);
    },
};
