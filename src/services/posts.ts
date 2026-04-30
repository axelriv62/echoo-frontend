import { API_URL, TOKEN_KEY } from '../utils/constants.ts';
import type { Post } from "../utils/types.ts";

export type CreatePostPayload = {
    title: string;
    description: string;
    pageId?: string;
    urlImage?: File;
    topicsIds?: string[];
};

/**
 * Retrieve all posts by sending a GET request to the API. The function checks for a valid authentication token before making the request and returns an object containing the success status, an array of posts if successful, and a message to be displayed to the user.
 * @returns An object containing the success status, an array of posts if successful, and a message to be displayed to the user.
 */
export const getPosts = async (): Promise<{ success: boolean; posts?: Post[], message: string }> => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter" };
        }

        const response = await fetch(`${API_URL}/posts?size=10000`, {
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
}

/**
 * Create a new post by sending a POST request to the API with the provided payload.
 * The payload includes the title, description, optional pageId, optional urlImage, and optional array of topic IDs.
 * The function checks for a valid authentication token before making the request and returns an object indicating the success status and a message to be displayed to the user.
 * @param payload - An object containing the title, description, optional pageId, optional urlImage, and optional array of topic IDs for the new post
 * @returns An object containing the success status and a message to be displayed to the user
 */
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

/**
 * Delete a post by sending a DELETE request to the API with the provided post ID. The function checks for a valid authentication token before making the request and returns an object indicating the success status and a message to be displayed to the user.
 * @param postId - The ID of the post to be deleted
 * @returns An object containing the success status and a message to be displayed to the user
 */
export const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter" };
    }

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

/**
 * Search for posts by sending a GET request to the API with the provided query string. The function checks for a valid authentication token before making the request and returns an object containing the success status, an array of matching posts if successful, and a message to be displayed to the user.
 * @param query - The search query string to find matching posts
 * @returns An object containing the success status, an array of matching posts if successful, and a message to be displayed to the user
 */
export const searchPosts = async (query: string): Promise<{ success: boolean; message: string; posts: Post[] }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter.", posts: [] };
    }

    if (!query.trim()) {
        return { success: true, message: "Requête vide", posts: [] };
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/posts/search?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            return { success: false, message: `Erreur: ${response.status} ${response.statusText}`, posts: [] };
        }

        const data = await response.json();
        const posts = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.posts)
                    ? data.posts
                    : [];

        return { success: true, message: "Posts trouvés", posts };
    } catch {
        return { success: false, message: "Erreur lors de la recherche des posts", posts: [] };
    }
};

/**
 * Retrieve posts created by a specific user by sending a GET request to the API with the provided user ID. The function checks for a valid authentication token before making the request and returns an object containing the success status, an array of posts created by the specified user if successful, and a message to be displayed to the user.
 * @param userId - The ID of the user whose posts are to be retrieved
 * @returns An object containing the success status, an array of posts created by the specified user if successful, and a message to be displayed to the user
 */
export const getPostsByUser = async (userId: string): Promise<{ success: boolean; message: string; posts: Post[] }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter.", posts: [] };
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/posts/user/${encodeURIComponent(userId)}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            return { success: false, message: `Erreur: ${response.status} ${response.statusText}`, posts: [] };
        }

        const data = await response.json();
        const posts = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.posts)
                    ? data.posts
                    : [];

        return { success: true, message: "Posts par utilisateur trouvés", posts };
    } catch {
        return { success: false, message: "Erreur lors de la récupération des posts par utilisateur", posts: [] };
    }
};

/**
 * Like a post by sending a POST request to the API with the provided post ID. The function checks for a valid authentication token before making the request and returns an object indicating the success status and a message to be displayed to the user.
 * @param postId - The ID of the post to be liked
 * @returns An object containing the success status and a message to be displayed to the user
 */
export const likePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter." };
    }

    try {
        const response = await fetch(`${API_URL}/reactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                postId,
                type: "LIKE",
            }),
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

        return { success: true, message: "Post liké avec succès" };
    } catch {
        return { success: false, message: "Erreur lors de l'ajout du like" };
    }
};

/**
 * Remove a like from a post by sending a DELETE request to the API with the provided post ID. The function checks for a valid authentication token before making the request and returns an object indicating the success status and a message to be displayed to the user.
 * @param postId - The ID of the post from which the like is to be removed
 * @returns An object containing the success status and a message to be displayed to the user
 */
export const dislikePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter." };
    }

    try {
        const response = await fetch(`${API_URL}/reactions/${postId}`, {
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

        return { success: true, message: "Like retiré avec succès" };
    } catch {
        return { success: false, message: "Erreur lors du retrait du like" };
    }
};

/**
 * Retrieve the liked status of a post for the authenticated user by sending a GET request to the API with the provided post ID. The function checks for a valid authentication token before making the request and returns an object containing the success status, a message to be displayed to the user, and a boolean indicating whether the post is liked by the user.
 * @param postId - The ID of the post for which to check the liked status
 * @returns An object containing the success status, a message to be displayed to the user, and a boolean indicating whether the post is liked by the user
 */
export const getPostLikedStatus = async (postId: string): Promise<{ success: boolean; message: string; liked: boolean }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter.", liked: false };
    }

    try {
        const response = await fetch(`${API_URL}/reactions/posts/${postId}/liked`, {
            method: "GET",
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

            return { success: false, message: `Erreur: ${response.status} ${details}`, liked: false };
        }

        const data = (await response.json()) as { liked?: boolean };
        return { success: true, message: "Statut like récupéré", liked: Boolean(data?.liked) };
    } catch {
        return { success: false, message: "Erreur lors de la récupération du statut like", liked: false };
    }
};
