import {API_URL, TOKEN_KEY, ROLES_KEY, ID_KEY, USERNAME_KEY} from '../utils/constants';
import { getUserProfile } from '../services/api';

// Type to define the shape of the authentication payload for both signin and register functions
type AuthPayload = {
    username: string;
    password: string;
};

/**
 * Authentify a user by sending a POST request to the backend with the provided username and password.
 * If the authentication is successful, the received token is stored in localStorage for future authenticated requests.
 * Returns an object indicating the success status and a message to be displayed to the user.
 * @param username - The username of the user trying to authenticate
 * @param password - The password of the user trying to authenticate
 * @returns An object containing a success boolean and a message string
 */
export const signin = async ({ username, password }: AuthPayload): Promise<{ success: boolean; message: string, token?: string }> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            return { success: false, message: "Identifiant ou mot de passe incorrect" };
        }

        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USERNAME_KEY, username);

        try {
            const me = await getUserProfile(data.token);
            const roles = me.roles ?? [];
            const id = me.id;
            localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
            localStorage.setItem(ID_KEY, id);
        } catch (err) {
            localStorage.setItem(ROLES_KEY, JSON.stringify([]));
        }

        return { success: true, message: "Connexion réussie, redirection en cours...", token: data.token };
    } catch {
        return { success: false, message: "Erreur de lors de la connexion, veuillez réessayer" };
    }
};

/**
 * Register a new user by sending a POST request to the backend with the provided username and password.
 * If the registration is successful, a success message is returned. Otherwise, an error message is returned.
 * @param username - The desired username for the new user
 * @param password - The desired password for the new user
 * @returns An object containing a success boolean and a message string
 */
export const register = async ({ username, password }: AuthPayload): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            return { success: false, message: "Échec de l'inscription, veuillez vérifier vos informations et réessayer" };
        }

        return { success: true, message: "Inscription réussie, redirection vers la page de connexion..." };
    } catch {
        return { success: false, message: "Erreur lors de l'inscription, veuillez réessayer" };
    }
};

/**
 * Disable the current user's account by sending a DELETE request to the backend.
 * If the deactivation is successful, the authentication token is removed from localStorage and a success message is returned.
 * Otherwise, an error message is returned.
 * @returns An object containing a success boolean and a message string
 */
export const disable = async (): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return { success: false, message: "Pas de token trouvé" };
    }

    try {
        const response = await fetch(`${API_URL}/users/disable-me`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return { success: false, message: `Erreur: ${response.statusText}` };
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLES_KEY);
        localStorage.removeItem(ID_KEY);
        return { success: true, message: "Compte désactivé avec succès" };
    } catch {
        return { success: false, message: "Erreur lors de la désactivation du compte, veuillez réessayer" };
    }
};