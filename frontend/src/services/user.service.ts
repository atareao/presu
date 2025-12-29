import { apiClient } from "./api.client";
import type { User } from "@/models";

const ENDPOINT = "/api/v1/users";

export const userService = {
    readAll: (): Promise<User[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<User> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (user: Partial<User>): Promise<User> => {
        return apiClient.post(ENDPOINT, user);
    },

    update: (user: Partial<User>): Promise<User> => {
        return apiClient.patch(ENDPOINT, user);
    },

    delete: (id: number): Promise<User> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
