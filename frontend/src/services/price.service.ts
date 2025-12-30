import { apiClient } from "./api.client";
import type { Price } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/prices";

export const priceService = {
    readAll: (): Promise<Price[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Price> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Price[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (price: Partial<Price>): Promise<Price> => {
        return apiClient.post(ENDPOINT, price);
    },

    update: (price: Partial<Price>): Promise<Price> => {
        return apiClient.patch(ENDPOINT, price);
    },

    delete: (id: number): Promise<Price> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
