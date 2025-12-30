import { apiClient } from "./api.client";
import type { User } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/users";

export const userService = {
    readAll: (): Promise<User[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<User> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<User[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (user: Partial<User>): Promise<User> => {
        return apiClient.post(ENDPOINT, user);
    },

    update: (user: Partial<User>): Promise<User> => {
        return apiClient.patch(ENDPOINT, user);
    },

    delete: (user: Partial<User>): Promise<User> => {
        return apiClient.delete(ENDPOINT, user);
    },
};
