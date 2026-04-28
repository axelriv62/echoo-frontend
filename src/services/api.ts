import { API_URL } from "../utils/constants";
import type { User } from "../utils/types";

export const getUserProfile = async (token: string): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/users/get-me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as User;
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Erreur lors de la récupération du profil", { cause: error });
    }
};

