import { API_URL } from "../utils/constants";
import type { UpdateUserProfilePayload, User } from "../utils/types";

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

export const updateUserProfile = async (
    token: string,
    payload: UpdateUserProfilePayload
): Promise<User> => {
    try {
        const params = new URLSearchParams();
        payload.topicsIds.forEach((topicId) => params.append("topics", topicId));
        const url = params.toString()
            ? `${API_URL}/users/update-me?${params.toString()}`
            : `${API_URL}/users/update-me`;

        const formData = new FormData();
        formData.append("username", payload.username);
        formData.append("imageProfile", payload.imageProfile ?? "");
        formData.append("email", payload.email ?? "");
        payload.topicsIds.forEach((topicId) => formData.append("topicsIds", topicId));

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            let details = response.statusText;
            try {
                const errorBody = (await response.json()) as { message?: string };
                if (errorBody?.message) {
                    details = errorBody.message;
                }
            } catch {
                // Ignore parsing errors and fall back to statusText.
            }

            throw new Error(`Erreur: ${response.status} ${details}`);
        }

        const data = (await response.json()) as User;
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Erreur lors de la mise a jour du profil", { cause: error });
    }
};
