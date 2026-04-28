import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import type { UpdateUserProfilePayload, User } from "../utils/types";

export const useProfile = (token: string | null) => {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        if (!token) {
            Promise.resolve().then(() => {
                if (!isActive) {
                    return;
                }

                setProfile(null);
                setError(null);
                setLoading(false);
                setUpdating(false);
                setUpdateError(null);
            });

            return () => {
                isActive = false;
            };
        }

        (async () => {
            if (isActive) {
                setLoading(true);
                setError(null);
            }

            try {
                const data = await getUserProfile(token);
                if (isActive) {
                    setProfile(data);
                }
            } catch (err) {
                if (isActive) {
                    setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            isActive = false;
        };
    }, [token]);

    const updateProfile = async (
        payload: UpdateUserProfilePayload
    ): Promise<{ user: User | null; requiresReauth: boolean }> => {
        if (!token) {
            setUpdateError("Token manquant");
            return { user: null, requiresReauth: false };
        }

        setUpdating(true);
        setUpdateError(null);

        try {
            const updated = await updateUserProfile(token, payload);
            const requiresReauth = Boolean(profile?.username && updated.username !== profile.username);
            setProfile(updated);
            return { user: updated, requiresReauth };
        } catch (err) {
            setUpdateError(err instanceof Error ? err.message : "Erreur lors de la mise a jour du profil");
            return { user: null, requiresReauth: false };
        } finally {
            setUpdating(false);
        }
    };

    return { profile, loading, error, updateProfile, updating, updateError };
};
