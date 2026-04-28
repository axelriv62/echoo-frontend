import {API_URL, TOKEN_KEY} from '../utils/constants';

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