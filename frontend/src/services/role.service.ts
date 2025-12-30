import { apiClient } from "./api.client";
import type { Role } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/roles";

export const roleService = {
    readAll: (): Promise<Role[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Role> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Role[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
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
