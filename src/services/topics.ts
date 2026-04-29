import {API_URL, TOKEN_KEY} from "../utils/constants.ts";
import type {Topic} from "../utils/types.ts";

/**
 * Get all topics from the API.
 * @returns An object containing the success status, an array of topics, and a message.
 */
export const getTopics = async (): Promise<{ success: boolean; topics: Topic[]; message: string }> => {
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

/**
 * Create a new topic by sending a POST request to the API with the provided topic name.
 * @returns An object containing the success status and a message.
 * @param topicName - The name of the topic to be created
 */
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

/**
 * Delete a topic by sending a DELETE request to the API with the provided topic ID.
 * @returns An object containing the success status and a message.
 * @param topicId - The ID of the topic to be deleted
 */
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