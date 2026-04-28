import {API_URL, TOKEN_KEY} from "../utils/constants.ts";
import type {Post} from "../utils/types.ts";

export const getPosts = async (): Promise<{ success: boolean; posts?: Post[], message: string }> => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter" };
        }

        const response = await fetch(`${API_URL}/posts`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return { success: false, message: "Erreur lors de la récupération des posts, veuillez réessayer" };
        }

        const data = await response.json();

        return { success: true, posts: data.content, message: "Posts récupérés avec succès" };
    } catch {
        return { success: false, message: "Erreur de lors de la récupération des posts, veuillez réessayer" };
    }
};