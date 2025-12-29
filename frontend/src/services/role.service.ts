import { apiClient } from "./api.client";
import type { Role } from "@/models";

const ENDPOINT = "/api/v1/roles";

export const roleService = {
    readAll: (): Promise<Role[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Role> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (role: Partial<Role>): Promise<Role> => {
        return apiClient.post(ENDPOINT, role);
    },

    update: (role: Partial<Role>): Promise<Role> => {
        return apiClient.patch(ENDPOINT, role);
    },

    delete: (id: number): Promise<Role> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
