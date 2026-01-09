import { apiClient } from "./api.client";
import type { Version } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/versions";

export const versionService = {
    readAll: (): Promise<Response<Version[]>> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Version> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Version[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (version: Partial<Version>): Promise<Version> => {
        return apiClient.post(ENDPOINT, version);
    },

    update: (version: Partial<Version>): Promise<Version> => {
        return apiClient.patch(ENDPOINT, version);
    },

    delete: (version: Partial<Version>): Promise<Version> => {
        return apiClient.delete(ENDPOINT, version);
    },

};
