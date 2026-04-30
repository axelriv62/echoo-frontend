import { useCallback, useEffect, useState } from "react";
import { getFollowers } from "../../services/users";
import type { FollowedUser } from "../../utils/types";

/**
 * Props for the FollowersModal component.
 */
type FollowersModalProps = {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
};

/**
 * FollowersModal
 *
 * Modal that lists followers for a given user with simple pagination.
 * It fetches pages of followers from the backend when opened and allows
 * navigating between pages. Displays loading and error states.
 */
const FollowersModal = ({ userId, isOpen, onClose }: FollowersModalProps) => {
    const [followers, setFollowers] = useState<FollowedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    /**
     * Fetch a page of followers. If reset is true, clear previous data.
     */
    const fetchFollowers = useCallback(async (page: number, reset = false) => {
        if (reset) {
            setFollowers([]);
            setCurrentPage(0);
            setTotalPages(0);
            setError(null);
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getFollowers(userId, page, pageSize);
            if (response) {
                setFollowers(response.content);
                setTotalPages(response.totalPages);
                setCurrentPage(page);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des followers");
        } finally {
            setLoading(false);
        }
    }, [pageSize, userId]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        // Load first page when modal opens
        void fetchFollowers(0, true);
    }, [isOpen, fetchFollowers]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Followers</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 transition hover:text-gray-700"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                {loading && (
                    <p className="text-center text-gray-600">Chargement des followers...</p>
                )}

                {error && (
                    <p className="text-center text-red-600 text-sm">{error}</p>
                )}

                {!loading && !error && followers.length === 0 && (
                    <p className="text-center text-gray-600">Aucun follower pour le moment</p>
                )}

                {!loading && !error && followers.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {followers.map((follower) => (
                            <div key={follower.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                {follower.imageProfile ? (
                                    <img
                                        src={follower.imageProfile}
                                        alt={follower.username}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{follower.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => fetchFollowers(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => fetchFollowers(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default FollowersModal;

