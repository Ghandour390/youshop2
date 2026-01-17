import axiosInstance from "@/lib/axios";


interface Category {
    id: number;
    name: string;
}

export const categories = {
    getAll: async (): Promise<{success: boolean; data: Category[]; timestamp: string}> => {
        const response = await axiosInstance.get("/categories");
        return response.data;
    },
    getOne: async (id: string):
 Promise<Category> => {
        const response = await axiosInstance.get(`/categories/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await axiosInstance.post("/categories", data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/categories/${id}`);
        return response.data;
    },
}