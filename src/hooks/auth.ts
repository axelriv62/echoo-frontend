import {API_URL} from "../utils/constants.ts";

/**
 * Deactivate the user's account by sending a request to the backend API.
 * @returns {Promise<Object>} The response from the API after deactivation.
 * @throws {Error} If there is no token found or if the API request fails.
 */
export async function deactivate(): Promise<object> {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Pas de token trouvé, veuillez vous connecter.');
    }

    const response = await fetch(`${API_URL}/users/disable-me`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert(`Erreur lors de la désactivation du compte: ${response.statusText}`);
    }

    localStorage.removeItem('authToken');

    return await response.json();
};
