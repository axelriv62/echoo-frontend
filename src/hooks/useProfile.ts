import { useEffect, useState } from "react";
import { getUserProfile } from "../services/api";
import type { User } from "../utils/types";

export const useProfile = (token: string | null) => {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return { profile, loading, error };
};

