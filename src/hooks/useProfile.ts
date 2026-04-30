import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, getPublicProfileById } from "../services/users.ts";
import type { UpdateUserProfilePayload, User } from "../utils/types";
import {TOKEN_KEY} from "../utils/constants.ts";

/**
 * useProfile Hook
 *
 * This hook manages the current user's profile data and provides functionality to fetch,
 * display, and update the user's profile information. It handles authentication tokens,
 * loading states, error management, and profile updates.
 *
 * @returns {Object} An object containing:
 *   - profile: The current user's profile data or null if not authenticated
 *   - loading: Boolean indicating if profile data is being fetched
 *   - error: Error message if profile fetch fails
 *   - updateProfile: Async function to update the user's profile
 *   - updating: Boolean indicating if profile update is in progress
 *   - updateError: Error message if profile update fails
 */
export const useProfile = () => {
    // State to store the user's profile data
    const [profile, setProfile] = useState<User | null>(null);

    // Loading state for initial profile fetch
    const [loading, setLoading] = useState(false);

    // Error state for profile fetch operations
    const [error, setError] = useState<string | null>(null);

    // Loading state for profile update operations
    const [updating, setUpdating] = useState(false);

    // Error state for profile update operations
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Retrieve authentication token from local storage
    const token = localStorage.getItem(TOKEN_KEY);

    // If no token exists, return early with empty profile state
    if (!token) {
        return { profile: null, loading: false, error: null, updateProfile: async () => ({ user: null, requiresReauth: false }), updating: false, updateError: null };
    }

    // Effect hook to fetch user profile when token changes
    useEffect(() => {
        let isActive = true;

        if (!token) {
            // Clear all state when user logs out
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

        // Async IIFE to fetch user profile data
        (async () => {
            if (isActive) {
                setLoading(true);
                setError(null);
            }

            try {
                // Call API to get the user's profile
                const data = await getUserProfile();
                if (isActive) {
                    setProfile(data);
                }
            } catch (err) {
                // Handle fetch errors and set error message
                if (isActive) {
                    setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        })();

        // Cleanup function to prevent state updates on unmounted components
        return () => {
            isActive = false;
        };
    }, [token]);

    /**
     * Updates the user's profile with the provided payload
     *
     * @param {UpdateUserProfilePayload} payload - The new profile data to update
     * @returns {Promise<{user: User | null, requiresReauth: boolean}>}
     *   - user: The updated user profile or null if update fails
     *   - requiresReauth: Whether the user needs to re-authenticate (e.g., username changed)
     */
    const updateProfile = async (
        payload: UpdateUserProfilePayload
    ): Promise<{ user: User | null; requiresReauth: boolean }> => {

        setUpdating(true);
        setUpdateError(null);

        try {
            // Call API to update user profile
            const updated = await updateUserProfile(payload);

            // Check if username has changed, which requires re-authentication
            const requiresReauth = Boolean(profile?.username && updated.username !== profile.username);

            // Update profile state with new data
            setProfile(updated);
            return { user: updated, requiresReauth };
        } catch (err) {
            // Handle update errors
            setUpdateError(err instanceof Error ? err.message : "Erreur lors de la mise a jour du profil");
            return { user: null, requiresReauth: false };
        } finally {
            // Reset updating state
            setUpdating(false);
        }
    };

    // Return profile state and utility functions
    return { profile, loading, error, updateProfile, updating, updateError };
};

/**
 * usePublicProfile Hook
 *
 * This hook fetches and manages the public profile information for a specific user.
 * It handles loading states and errors separately from the current user's profile.
 * Does not support profile updates as it's read-only for public profiles.
 *
 * @param {string | null} userId - The ID of the user whose public profile to fetch
 * @param {string | null} token - Optional authentication token (not currently used)
 *
 * @returns {Object} An object containing:
 *   - profile: The public user's profile data or null
 *   - loading: Boolean indicating if profile data is being fetched
 *   - error: Error message if profile fetch fails
 */
export const usePublicProfile = (userId: string | null, token: string | null = null) => {
    // State to store the public user's profile data
    const [profile, setProfile] = useState<User | null>(null);

    // Loading state for profile fetch
    const [loading, setLoading] = useState(false);

    // Error state for profile fetch
    const [error, setError] = useState<string | null>(null);

    // Effect hook to fetch public profile when userId changes
    useEffect(() => {
        let isActive = true;

        // If no userId is provided, clear profile state
        if (!userId) {
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

        // Async IIFE to fetch public profile data
        (async () => {
            if (isActive) {
                setLoading(true);
                setError(null);
            }

            try {
                // Call API to get the public profile for the specified user
                const data = await getPublicProfileById(userId);
                if (isActive) {
                    setProfile(data);
                }
            } catch (err) {
                // Handle fetch errors and set error message
                if (isActive) {
                    setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        })();

        // Cleanup function to prevent state updates on unmounted components
        return () => {
            isActive = false;
        };
    }, [userId, token]);

    // Return profile state
    return { profile, loading, error };
};
