import { apiClient } from "./api.client";
import type { Project } from "@/models";

const ENDPOINT = "/api/v1/projects";

export const projectService = {
    readAll: (): Promise<Project[]> => {
        return apiClient.get(ENDPOINT);
    },

    readById: (id: number): Promise<Project> => {
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    create: (project: Partial<Project>): Promise<Project> => {
        return apiClient.post(ENDPOINT, project);
    },

    update: (project: Partial<Project>): Promise<Project> => {
        return apiClient.patch(ENDPOINT, project);
    },

    delete: (id: number): Promise<Project> => {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
