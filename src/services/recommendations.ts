import {API_URL, TOKEN_KEY} from '../utils/constants.ts';
import type {Post} from "../utils/types.ts";

export type RecommendedUser = {
    id: string;
    username: string;
    email?: string;
    imageProfile: string | null;
};

/**
 * Fetches personalized user suggestions (people you may know) for the authenticated user.
 * If the authentication is successful, the received a list of user suggestions (id, username, email, imageProfile).
 * Returns an object list indicating the success status and the user list component.
 * @returns An object containing a success boolean and a message string
 */
export const getRecommendedUsers = async (): Promise<{ success: boolean; message: string, suggestedUsers: RecommendedUser[]}> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: "Pas de token trouvé, utilisateur non connecté", suggestedUsers: [] };
    }

    try {
        const response = await fetch(`${API_URL}/recommendation/users`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return { success: false, message: `Erreur: ${response.statusText}`, suggestedUsers: [] };
        }

        const data = await response.json();
        const suggestedUsers = Array.isArray(data)
            ? data
            : Array.isArray(data?.suggestedUsers)
                ? data.suggestedUsers
                : [];

        return { success: true, message: "Comptes suggérés trouvés avec succès", suggestedUsers };
    } catch {
        return { success: false, message: "Erreur lors de la suggestion des comptes, veuillez réessayer", suggestedUsers: [] };
    }
};

/**
 * Retrieve recommended posts for the authenticated user by sending a GET request to the API. The function checks for a valid authentication token before making the request and returns an object containing the success status, an array of recommended posts if successful, and a message to be displayed to the user.
 * @param limit - Optional parameter to specify the maximum number of recommended posts to retrieve. Must be a positive integer. If not provided or invalid, the API's default limit will be used.
 * @returns An object containing the success status, an array of recommended posts if successful, and a message to be displayed to the user.
 */
export const getRecommendedPosts = async (
    limit = 1
): Promise<{ success: boolean; message: string; posts: Post[] }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Utilisateur non authentifié, veuillez vous connecter", posts: [] };
    }

    try {
        const url = new URL(`${API_URL}/recommendation/posts`);
        if (Number.isFinite(limit) && limit > 0) {
            url.searchParams.set("limit", String(Math.floor(limit)));
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            return { success: false, message: "Unauthorized: Authentication required to get personalized feed", posts: [] };
        }

        if (!response.ok) {
            if (response.status === 404) {
                return { success: true, message: "Aucune suggestion disponible pour le moment", posts: [] };
            }

            return { success: false, message: "Erreur lors de la récupération des posts suggérés", posts: [] };
        }

        const data = await response.json();
        const recommendedPosts = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.posts)
                    ? data.posts
                    : Array.isArray(data?.recommendedPosts)
                        ? data.recommendedPosts
                        : [];

        const posts = recommendedPosts.filter((post: Post | null | undefined) => Boolean(post?.id && post?.user));

        return { success: true, message: "Posts suggérés trouvés avec succès", posts };
    } catch {
        return { success: false, message: "Erreur lors de la suggestion des posts, veuillez réessayer", posts: [] };
    }
};