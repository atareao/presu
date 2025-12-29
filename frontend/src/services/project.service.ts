import { apiClient } from "./api.client";
import type { Project } from "@/models";

const ENDPOINT = "/api/v1/projects";

export const projectService = {
    getAll: (): Promise<Project[]> => {
        return apiClient.get(ENDPOINT);
    },

    getById: (id: number): Promise<Project> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (project: Partial<Project>): Promise<Project> => {
        return apiClient.post(ENDPOINT, project);
    },

    update: (id: number, project: Partial<Project>): Promise<Project> => {
        return apiClient.put(`${ENDPOINT}/${id}`, project);
    },

    delete: (id: number): Promise<Project> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
