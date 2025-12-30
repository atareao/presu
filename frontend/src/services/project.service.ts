import { apiClient } from "./api.client";
import type { Project } from "@/models";
import type Response from "@/models/response";

const ENDPOINT = "/api/v1/projects";

export const projectService = {
    readAll: (): Promise<Project[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Project> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    readPaginate: (params: Map<string, string>): Promise<Response<Project[]>> => {
        const queryString = new URLSearchParams();
        params.forEach((value, key) => {
            queryString.append(key, value);
        });
        return apiClient.get(`${ENDPOINT}?${queryString.toString()}`);
    },

    create: (project: Partial<Project>): Promise<Project> => {
        return apiClient.post(ENDPOINT, project);
    },

    update: (project: Partial<Project>): Promise<Project> => {
        return apiClient.patch(ENDPOINT, project);
    },

    delete: (id: number): Promise<Project> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    },

};
