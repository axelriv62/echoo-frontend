import { API_URL, TOKEN_KEY } from '../utils/constants.ts';
import type { Comment } from '../utils/types.ts';

export type CreateCommentPayload = {
    postId: string;
    parentCommentId?: string | null;
    content: string;
};

/**
 * Create a new comment by sending a POST request to the API with the provided payload.
 * @param payload - An object containing the postId, optional parentCommentId, and content of the comment to be created
 * @returns An object containing the success status, the created comment (if successful), and a message.
 */
export const createComment = async (
    payload: CreateCommentPayload
): Promise<{ success: boolean; comment?: Comment; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Vous devez être connecté" };
    }

    try {
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                postId: payload.postId,
                parentCommentId: payload.parentCommentId || undefined,
                content: payload.content,
            }),
        });

        if (!response.ok) {
            return {
                success: false,
                message:
                    response.status === 404
                        ? "Post ou commentaire parent non trouvé"
                        : "Erreur lors de la création du commentaire",
            };
        }

        const comment = await response.json();
        return {
            success: true,
            comment,
            message: "Commentaire créé avec succès !",
        };
    } catch {
        return {
            success: false,
            message: "Erreur lors de la création du commentaire, veuillez réessayer",
        };
    }
};

/**
 * Delete a comment by sending a DELETE request to the API with the provided comment ID.
 * @param commentId - The ID of the comment to be deleted
 * @returns An object containing the success status and a message.
 */
export const deleteComment = async (
    commentId: string
): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Vous devez être connecté" };
    }

    try {
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                return {
                    success: false,
                    message: "Vous n'avez pas la permission de supprimer ce commentaire",
                };
            }
            return {
                success: false,
                message: "Erreur lors de la suppression du commentaire",
            };
        }

        return {
            success: true,
            message: "Commentaire supprimé avec succès !",
        };
    } catch {
        return {
            success: false,
            message: "Erreur lors de la suppression du commentaire, veuillez réessayer",
        };
    }
};