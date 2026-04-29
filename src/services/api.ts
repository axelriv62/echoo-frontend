import { API_URL } from "../utils/constants";
import type { Post, UpdateUserProfilePayload, User } from "../utils/types";

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

export const getPublicProfileById = async (userId: string, token: string | null = null): Promise<User> => {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "GET",
            headers,
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

        throw new Error("Erreur lors de la récupération du profil public", { cause: error });
    }
};

export const followUser = async (
    userId: string,
    token: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/users/follow-user/${userId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok || response.status === 409) {
            return { success: true, message: "Utilisateur suivi avec succes" };
        }

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
    } catch {
        return { success: false, message: "Impossible de suivre cet utilisateur pour le moment" };
    }
};

export const toggleIgnoreUser = async (
    userId: string,
    token: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/users/ignore-user/${userId}`, {
            method: "PATCH",
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

        return { success: true, message: "Action ignore mise à jour" };
    } catch {
        return { success: false, message: "Impossible de mettre à jour l'ignore pour le moment" };
    }
};

export const getMyFollowedUsers = async (
    token: string
): Promise<{ success: boolean; message: string; userIds: string[] }> => {
    try {
        const response = await fetch(`${API_URL}/users/me/followed-users`, {
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

            return { success: false, message: `Erreur: ${response.status} ${details}`, userIds: [] };
        }

        const data = (await response.json()) as
            | Array<{ id?: string } | string>
            | { followedUsers?: Array<{ id?: string } | string>; content?: Array<{ id?: string } | string> };

        const followedUsers = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.followedUsers)
                    ? data.followedUsers
                    : [];

        const userIds = followedUsers
            .map((user) => {
                if (typeof user === "string") {
                    return user;
                }

                if (user?.id) {
                    return user.id;
                }

                return "";
            })
            .filter(Boolean);

        return { success: true, message: "Utilisateurs suivis recuperes", userIds };
    } catch {
        return { success: false, message: "Impossible de recuperer les utilisateurs suivis", userIds: [] };
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

export const searchUsers = async (
    query: string,
    token: string | null = null
): Promise<{ success: boolean; message: string; users: Array<{ id: string; username: string; imageProfile: string | null }> }> => {
    if (!query.trim()) {
        return { success: true, message: "Requête vide", users: [] };
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            return { success: false, message: `Erreur: ${response.status} ${response.statusText}`, users: [] };
        }

        const data = await response.json();
        const users = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        return { success: true, message: "Utilisateurs trouvés", users };
    } catch {
        return { success: false, message: "Erreur lors de la recherche", users: [] };
    }
};

export const searchPosts = async (
    query: string,
    token: string | null = null
): Promise<{ success: boolean; message: string; posts: Post[] }> => {
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


export const likePost = async (
    postId: string,
    token: string
): Promise<{ success: boolean; message: string }> => {
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

export const dislikePost = async (
    postId: string,
    token: string
): Promise<{ success: boolean; message: string }> => {
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

export const getPostLikedStatus = async (
    postId: string,
    token: string
): Promise<{ success: boolean; message: string; liked: boolean }> => {
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
