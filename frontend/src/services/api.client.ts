import { BASE_URL } from "@/constants";

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(error.message || response.statusText);
    }
    return response.json();
}

export const apiClient = {
    get: (endpoint: string) => fetch(`${BASE_URL}${endpoint}`).then(handleResponse),

    post: (endpoint: string, data: any) => fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse),

    patch: (endpoint: string, data: any) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),

    delete: (endpoint: string, data: any) => 
        fetch(`${BASE_URL}${endpoint}?id=${data.id}`, {
        method: 'DELETE'
    }).then(handleResponse),
};
