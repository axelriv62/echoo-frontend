import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/profile-card/ProfileCard";
import { ROLES_KEY, TOKEN_KEY } from "../utils/constants";
import LogoutButton from "../components/logout-button/LogoutButton.tsx";
import DeactivateAccountButton from "../components/disable-button/DisableButton.tsx";
import PostCard from "../components/post-card/PostCard";
import { getPostsByUser } from "../services/posts";
import type { Post } from "../utils/types";

/**
 * Profile page for viewing and updating the authenticated user's account and posts.
 */
const ProfilePage = ({setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem(TOKEN_KEY);
    const { profile, loading, error, updateProfile, updating, updateError } = useProfile();
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);

    const handleUpdateProfile = async (payload: Parameters<typeof updateProfile>[0]) => {
        const result = await updateProfile(payload);

        if (result.requiresReauth) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ROLES_KEY);
            setToken(null);
            navigate("/login", { state: { message: "Votre nom d'utilisateur a changé, reconnectez-vous." } });
            return null;
        }

        return result.user;
    };

    useEffect(() => {
        let isMounted = true;

        const loadMyPosts = async () => {
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

        void loadMyPosts();

        return () => {
            isMounted = false;
        };
    }, [profile?.id]);

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId));
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#a237ff]/10 to-[#a237ff]/5 p-4">
                <div className="text-center rounded-2xl border border-[#a237ff]/15 bg-white/90 p-8 shadow-sm">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Veuillez vous connecter</h2>
                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-3 px-6 transition duration-200"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#f8f1ff] via-[#fcfafe] to-[#ffffff] px-4 py-6">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Account summary and editable profile card. */}
                <div className="rounded-2xl border border-[#a237ff]/20 bg-white p-4 shadow-[0_12px_40px_rgba(162,55,255,0.12)]">
                    <ProfileCard
                        profile={profile}
                        loading={loading}
                        error={error}
                        onUpdate={handleUpdateProfile}
                        updating={updating}
                        updateError={updateError}
                    />
                </div>

                {/* Current user's posts and deletion handling. */}
                <section className="space-y-4">
                    <div className="rounded-2xl border border-[#a237ff]/15 bg-white/90 px-4 py-3 shadow-sm">
                        <h2 className="text-base font-semibold text-[#5d1a91]">Mes posts</h2>
                    </div>

                    {postsLoading ? (
                        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-center text-gray-500 shadow-sm">
                            <p className="py-8">Chargement de vos posts...</p>
                        </div>
                    ) : postsError ? (
                        <div className="rounded-2xl border border-[#ef4444]/20 bg-white p-4 text-center text-[#ef4444] shadow-sm">
                            <p className="py-8">{postsError}</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-center text-gray-500 shadow-sm">
                            <p className="py-8">Vous n'avez pas encore publié de post</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Account actions such as logout and deactivation. */}
                <div className="mx-auto w-full max-w-sm rounded-2xl border border-[#a237ff]/15 bg-white/90 p-4 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a22bf]">Compte</p>
                    <div className="space-y-2">
                    <LogoutButton token={token} setToken={setToken} />
                    <DeactivateAccountButton token={token} setToken={setToken} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
