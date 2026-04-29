import { API_URL, TOKEN_KEY } from '../utils/constants';
import type { Post, Topic } from "../utils/types.ts";

export type CreatePostPayload = {
    title: string;
    description: string;
    pageId?: string;
    urlImage?: string;
    topicsIds?: string[];
};

export const createPost = async (payload: CreatePostPayload): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Vous devez être connecté" };
    }

    try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('description', payload.description);

        if (payload.pageId) {
            formData.append('pageId', payload.pageId);
        }

        if (payload.urlImage) {
            formData.append('urlImage', payload.urlImage);
        }

        if (payload.topicsIds && payload.topicsIds.length > 0) {
            payload.topicsIds.forEach(topicId => {
                formData.append('topicsIds', topicId);
            });
        }

        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            return { success: false, message: "Erreur lors de la création du post" };
        }

        return { success: true, message: "Post créé avec succès !" };
    } catch {
        return { success: false, message: "Erreur lors de la création du post, veuillez réessayer" };
    }
};

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

export const createTopic = async (topicName: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Vous devez être connecté" };
    }

    try {
        const response = await fetch(`${API_URL}/topics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: topicName }),
        });

        if (!response.ok) {
            return { success: false, message: "Erreur lors de la création du topic" };
        }

        return { success: true, message: "Topic créé avec succès !" };
    } catch {
        return { success: false, message: "Erreur lors de la création du topic, veuillez réessayer" };
    }
};

export const getTopic = async (): Promise<{ success: boolean; topics: Topic[]; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, topics: [], message: "Vous devez être connecté" };
    }

    try {
        const response = await fetch(`${API_URL}/topics`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return { success: false, topics: [], message: "Erreur lors de la récupération des topics" };
        }

        const data = await response.json();

        return {
            success: true,
            topics: Array.isArray(data) ? data : [],
            message: "Topics récupérés avec succès"
        };
    } catch {
        return { success: false, topics: [], message: "Erreur lors de la récupération des topics, veuillez réessayer" };
    }
};

export const deleteTopic = async (topicId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Vous devez être connecté" };
    }

    try {
        const response = await fetch(`${API_URL}/topics/${topicId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return { success: false, message: "Erreur lors de la suppression du topic" };
        }

        return { success: true, message: "Topic supprimé avec succès !" };
    } catch {
        return { success: false, message: "Erreur lors de la suppression du topic, veuillez réessayer" };
    }
};

export const deletePost = async (
    postId: string,
    token: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let details = response.statusText;
            try {
                const errorBody = (await response.json()) as { message?: string };
                if (errorBody?.message) {
                    details = errorBody.message;
                }
            } catch {
                // Keep default statusText.
            }

            return { success: false, message: `Erreur: ${response.status} ${details}` };
        }

        return { success: true, message: "Post supprimé avec succès" };
    } catch {
        return { success: false, message: "Impossible de supprimer le post pour le moment" };
    }
};