import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePublicProfile } from "../hooks/useProfile";
import FollowUserButton from "../components/FollowUserButton/FollowUserButton";
import IgnoreUserButton from "../components/IgnoreUserButton/IgnoreUserButton";
import BanUserButton from "../components/BanUserButton/BanUserButton";
import FollowersModal from "../components/followers-modal/FollowersModal";
import { getFollowers, getMyFollowedUsers, getUserProfile } from "../services/users.ts";
import { getPostsByUser } from "../services/posts";
import PostCard from "../components/post-card/PostCard";
import type { Post } from "../utils/types";
import { ROLES_KEY } from "../utils/constants.ts";

interface PublicProfilePageProps {
    token: string | null;
    setToken: (token: string | null) => void;
}

const PublicProfilePage = ({ token }: PublicProfilePageProps) => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { profile, loading, error } = usePublicProfile(userId || null, token);
    const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
    const [ignoredUserIds, setIgnoredUserIds] = useState<Set<string>>(new Set());
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const [relationsLoading, setRelationsLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const storedRoles = JSON.parse(localStorage.getItem(ROLES_KEY) ?? "[]") as string[];
    const isAdmin = storedRoles.includes("ROLE_ADMIN");
    const [followersCount, setFollowersCount] = useState<number | null>(null);
    const [followersModalOpen, setFollowersModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadUserRelations = async () => {
            if (!token) {
                if (isMounted) {
                    setFollowedUserIds(new Set());
                    setIgnoredUserIds(new Set());
                    setMyUserId(null);
                    setRelationsLoading(false);
                }
                return;
            }

            if (isMounted) {
                setRelationsLoading(true);
            }

            try {
                const [followedResult, me] = await Promise.all([
                    getMyFollowedUsers(),
                    getUserProfile(),
                ]);

                if (!isMounted) return;

                if (followedResult.success) {
                    setFollowedUserIds(new Set(followedResult.userIds));
                } else {
                    setFollowedUserIds(new Set());
                }

                setIgnoredUserIds(new Set(me.ignoredUsers ?? []));
                setMyUserId(me.id);
            } catch {
                if (!isMounted) return;

                setFollowedUserIds(new Set());
                setIgnoredUserIds(new Set());
                setMyUserId(null);
            } finally {
                if (isMounted) {
                    setRelationsLoading(false);
                }
            }
        };

        loadUserRelations();

        return () => {
            isMounted = false;
        };
    }, [token]);

    useEffect(() => {
        let isMounted = true;

        const loadUserPosts = async () => {
            if (!profile?.id) {
                if (isMounted) {
                    setPosts([]);
                    setPostsLoading(false);
                    setPostsError(null);
                }
                return;
            }

            if (isMounted) {
                setPostsLoading(true);
                setPostsError(null);
            }

            const result = await getPostsByUser(profile.id);

            if (!isMounted) {
                return;
            }

            if (result.success) {
                setPosts(result.posts);
                setPostsError(null);
            } else {
                setPosts([]);
                setPostsError(result.message);
            }

            setPostsLoading(false);
        };

        void loadUserPosts();

        return () => {
            isMounted = false;
        };
    }, [profile?.id]);

    useEffect(() => {
        let isMounted = true;

        const loadFollowersCount = async () => {
            if (!token || !profile?.id) {
                if (isMounted) {
                    setFollowersCount(null);
                }
                return;
            }

            try {
                const response = await getFollowers(profile.id, 0, 1);
                if (isMounted && response) {
                    setFollowersCount(response.totalElements);
                }
            } catch {
                if (isMounted) {
                    setFollowersCount(0);
                }
            }
        };

        void loadFollowersCount();

        return () => {
            isMounted = false;
        };
    }, [profile?.id, token]);

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#a237ff]/10 to-[#a237ff]/5 p-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Profil introuvable</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-2 px-6 transition duration-200"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f8f1ff] via-[#fcfafe] to-[#ffffff] px-4 py-6">
                <div className="rounded-2xl border border-[#a237ff]/15 bg-white p-8 text-center shadow-sm">
                    <div className="w-10 h-10 border-4 border-[#a237ff]/20 border-t-[#a237ff] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f8f1ff] via-[#fcfafe] to-[#ffffff] px-4 py-6">
                <div className="max-w-md rounded-2xl border border-[#a237ff]/15 bg-white p-8 text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h2>
                    <p className="text-gray-600 mb-6">{error || "Impossible de charger le profil"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-2 px-6 transition duration-200"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = Boolean(myUserId && profile.id === myUserId);
    const isIgnored = ignoredUserIds.has(profile.id);

    return (
        <div className="min-h-screen bg-linear-to-b from-[#f8f1ff] via-[#fcfafe] to-[#ffffff] px-4 py-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between rounded-2xl border border-[#a237ff]/15 bg-white px-4 py-3 shadow-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-full px-3 py-1.5 text-gray-600 transition hover:bg-[#a237ff]/10 hover:text-[#a237ff]"
                    >
                        ← Retour
                    </button>
                    <h1 className="text-2xl font-bold text-[#a237ff]">Profil</h1>
                    <div className="w-6"></div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#a237ff]/15 bg-white shadow-[0_12px_40px_rgba(162,55,255,0.12)]">
                    {/* Profil Header */}
                    <div className="border-b border-[#e8ddf5] bg-linear-to-br from-[#a237ff]/14 via-[#ffffff] to-[#ff6b9d]/12 p-6">
                        <div className="flex gap-6 items-start">
                            {profile.imageProfile ? (
                                <img
                                    src={profile.imageProfile}
                                    alt={profile.username}
                                    className="w-24 h-24 rounded-full object-cover ring-2 ring-[#a237ff]/20"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-[#a237ff]/10 flex items-center justify-center">
                                    <span className="text-3xl font-semibold text-[#a237ff]">
                                        {profile.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <div className="flex-1">
                                <h2 className="mb-2 text-3xl font-bold text-[#1f1330]">{profile.username}</h2>
                                {profile.email && (
                                    <p className="text-gray-600 mb-4">{profile.email}</p>
                                )}

                                {token && !isOwnProfile && (
                                    <div className="mb-4 max-w-40">
                                        {relationsLoading ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full rounded-full bg-[#a237ff]/40 text-white text-xs font-semibold py-1.5 px-3 cursor-wait"
                                            >
                                                Chargement...
                                            </button>
                                        ) : (
                                            <>
                                                <FollowUserButton
                                                    key={`${profile.id}-${followedUserIds.has(profile.id) ? 'following' : 'not-following'}`}
                                                    userId={profile.id}
                                                    initialIsFollowing={followedUserIds.has(profile.id)}
                                                />
                                                <IgnoreUserButton
                                                    key={`${profile.id}-${isIgnored ? 'ignored' : 'not-ignored'}`}
                                                    userId={profile.id}
                                                    token={token}
                                                    initialIsIgnored={isIgnored}
                                                    onIgnoreSuccess={() => {
                                                        setIgnoredUserIds((previousIds) => {
                                                            const nextIds = new Set(previousIds);
                                                            if (nextIds.has(profile.id)) {
                                                                nextIds.delete(profile.id);
                                                            } else {
                                                                nextIds.add(profile.id);
                                                            }
                                                            return nextIds;
                                                        });
                                                    }}
                                                />
                                                {isAdmin && (
                                                    <BanUserButton
                                                        userId={profile.id}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <button
                                        type="button"
                                        onClick={() => setFollowersModalOpen(true)}
                                        disabled={!token}
                                        className="rounded-xl border border-[#a237ff]/15 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:border-[#a237ff]/30 hover:bg-[#a237ff]/5 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <span className="block text-lg font-semibold text-[#1f1330]">
                                            {followersCount === null ? "..." : followersCount}
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-wide text-[#7a22bf]">
                                            {followersCount === 1 ? "Follower" : "Followers"}
                                        </span>
                                    </button>

                                    {profile.followedUsers && profile.followedUsers.length > 0 && (
                                        <div className="rounded-xl border border-[#a237ff]/15 bg-white/80 px-4 py-3 shadow-sm">
                                            <span className="block text-lg font-semibold text-[#1f1330]">
                                                {profile.followedUsers.length}
                                            </span>
                                            <span className="text-xs font-medium uppercase tracking-wide text-[#7a22bf]">
                                                {profile.followedUsers.length > 1 ? " Utilisateurs suivis" : " Utilisateur suivi"}
                                            </span>
                                        </div>
                                    )}

                                    {profile.followedPages && profile.followedPages.length > 0 && (
                                        <div className="rounded-xl border border-[#a237ff]/15 bg-white/80 px-4 py-3 shadow-sm">
                                            <span className="block text-lg font-semibold text-[#1f1330]">
                                                {profile.followedPages.length}
                                            </span>
                                            <span className="text-xs font-medium uppercase tracking-wide text-[#7a22bf]">
                                                {profile.followedPages.length > 1 ? " Pages suivies" : " Page suivie"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4">
                        {postsLoading ? (
                            <div className="rounded-xl border border-[#e8ddf5] bg-linear-to-r from-[#ffffff] to-[#f8f1ff] p-8 text-center text-gray-500">
                                <p className="py-8">Chargement des posts...</p>
                            </div>
                        ) : postsError ? (
                            <div className="rounded-xl border border-[#ef4444]/20 bg-white p-8 text-center text-[#ef4444]">
                                <p className="py-8">{postsError}</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="rounded-xl border border-[#e8ddf5] bg-linear-to-r from-[#ffffff] to-[#f8f1ff] p-8 text-center text-gray-500">
                                <p className="py-8">Cet utilisateur n'a pas encore publié de post</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {profile && (
                    <FollowersModal
                        userId={profile.id}
                        isOpen={followersModalOpen}
                        onClose={() => setFollowersModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default PublicProfilePage;

