import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { getPosts, createPost, type CreatePostPayload } from "../services/posts.ts";
import { getTopics } from "../services/topics.ts";
import { getUserProfile } from "../services/users.ts";
import PostCard from "../components/post-card/PostCard";
import { useProfile } from "../hooks/useProfile";
import type { Post, Topic } from "../utils/types";
import RecommendedUsers from "../components/suggested_user/RecommendedUsers.tsx";
import RecommendedPosts from "../components/suggested_post/RecommendedPosts";
import TopicsModal from "../components/topics-modal/TopicsModal";
import { TOKEN_KEY } from "../utils/constants.ts";

interface PostFormState {
    title: string;
    description: string;
    urlImage: File | null;
    topicsIds: string[];
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

const RECOMMENDATION_INTERVAL = 10;

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<Post[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopicsModal, setShowTopicsModal] = useState(false);
    const highlightPostId = (location.state as { highlightPostId?: string } | null)?.highlightPostId ?? null;
    useProfile();
    const { profile: myProfile } = useProfile();
    const [ignoredUsersSet, setIgnoredUsersSet] = useState<Set<string>>(new Set(myProfile?.ignoredUsers ?? []));
    const token = localStorage.getItem(TOKEN_KEY);

    const [formData, setFormData] = useState<PostFormState>({
        title: '',
        description: '',
        urlImage: null,
        topicsIds: [],
        isLoading: false,
        error: null,
        success: null,
    });

    const refreshPosts = useCallback(async () => {
        const result = await getPosts();
        if (result.success && result.posts) {
            const filtered = result.posts.filter((p) => !ignoredUsersSet.has(p.user.id));
            setPosts(filtered);
        }
        setLoading(false);
    }, [ignoredUsersSet]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemoveImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, urlImage: file }));

            // Create a local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const refreshPostsRef = useRef(refreshPosts);
    useEffect(() => {
        refreshPostsRef.current = refreshPosts;
    }, [refreshPosts]);

    useEffect(() => {
        if (!highlightPostId) {
            return;
        }

        const element = document.getElementById(`post-${highlightPostId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [highlightPostId, posts]);

    const loadTopics = async () => {
        const result = await getTopics();
        if (result.success) {
            setTopics(result.topics);
        }
    };

    useEffect(() => {
        let isMounted = true;

        Promise.resolve().then(() => {
            if (isMounted) setIgnoredUsersSet(new Set(myProfile?.ignoredUsers ?? []));
        });

        const onIgnoredUsersChanged = async () => {
            try {
                const me = await getUserProfile();
                setIgnoredUsersSet(new Set(me.ignoredUsers ?? []));
                if (refreshPostsRef.current) await refreshPostsRef.current();
            } catch {
                // ignore
            }
        };

        window.addEventListener('ignoredUsersChanged', onIgnoredUsersChanged);

        (async () => {
            if (!token) {
                if (isMounted) {
                    setPosts([]);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);

            try {
                const postsResult = await getPosts();
                if (isMounted && postsResult.success && postsResult.posts) {
                    const ignoredSet = new Set(myProfile?.ignoredUsers ?? []);
                    const filtered = postsResult.posts.filter((p) => !ignoredSet.has(p.user.id));
                    setPosts(filtered);
                }

                // load topics as well
                const topicsResult = await getTopics();
                if (isMounted && topicsResult.success) {
                    setTopics(topicsResult.topics);
                }
            } catch {
                // ignore
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
            window.removeEventListener('ignoredUsersChanged', onIgnoredUsersChanged);
        };
    }, [token, myProfile?.ignoredUsers]);

    const topicNameById = new Map(topics.map((t) => [t.id, t.name]));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setFormData(prev => ({ ...prev, error: 'Le titre ne peut pas être vide' }));
            return;
        }

        if (!formData.description.trim()) {
            setFormData(prev => ({ ...prev, error: 'Le message ne peut pas être vide' }));
            return;
        }

        setFormData(prev => ({ ...prev, isLoading: true, error: null, success: null }));

        const payload: CreatePostPayload = {
            title: formData.title,
            description: formData.description,
            urlImage: formData.urlImage || undefined,
            topicsIds: formData.topicsIds.length > 0 ? formData.topicsIds : undefined,
        };

        const result = await createPost(payload);

        if (result.success) {
            setFormData({
                title: '',
                description: '',
                urlImage: null,
                topicsIds: [],
                isLoading: false,
                error: null,
                success: result.message,
            });

            await refreshPosts();

            setTimeout(() => {
                setFormData(prev => ({ ...prev, success: null }));
            }, 3000);
        } else {
            setFormData(prev => ({
                ...prev,
                isLoading: false,
                error: result.message,
            }));
        }
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
    };

    const renderFeed = () => {
        const items: React.ReactNode[] = [];

        posts.forEach((post, index) => {
            const isHighlighted = highlightPostId === post.id;

            items.push(
                <div
                    key={post.id}
                    id={`post-${post.id}`}
                    className={isHighlighted ? "rounded-2xl ring-2 ring-[#a237ff] ring-offset-2 ring-offset-[#f6efff]" : ""}
                >
                    <PostCard post={post} onDelete={handlePostDeleted} />
                </div>
            );

            if ((index + 1) % RECOMMENDATION_INTERVAL === 0) {
                items.push(
                    <section key={`recommendations-${index}`} className="space-y-6 rounded-2xl border border-[#a237ff]/25 bg-linear-to-br from-[#ffffff] to-[#f8f1ff] p-4 shadow-sm">
                        <RecommendedUsers onFollowSuccess={refreshPosts} />
                        <RecommendedPosts />
                    </section>
                );
            }
        });

        return items;
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#a237ff]/10 to-[#a237ff]/5 p-4">
                <div className="text-center">
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
                <div className="overflow-hidden rounded-2xl border border-[#a237ff]/20 bg-white shadow-[0_12px_40px_rgba(162,55,255,0.12)]">
                    <div className="border-b border-[#a237ff]/15 bg-linear-to-r from-[#a237ff]/20 via-[#a237ff]/10 to-[#ff6b9d]/10 px-4 py-3">
                        <p className="text-sm font-semibold text-[#5d1a91]">Nouveau post</p>
                        <p className="text-xs text-gray-600">Partage une idee a la communaute</p>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Titre du post"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-lg font-semibold text-[#000000] placeholder-gray-400 outline-none focus:border-[#a237ff]/40 focus:ring-2 focus:ring-[#a237ff]/20"
                                disabled={formData.isLoading}
                            />

                            <textarea
                                placeholder="Quoi de neuf?!"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-xl text-[#000000] placeholder-gray-500 outline-none resize-none focus:border-[#a237ff]/40 focus:ring-2 focus:ring-[#a237ff]/20"
                                rows={4}
                                disabled={formData.isLoading}
                            />

                            {formData.error && (
                                <div className="bg-[#ef4444]/10 border border-[#ef4444] text-[#ef4444] px-3 py-2 rounded text-sm">
                                    {formData.error}
                                </div>
                            )}
                            {formData.success && (
                                <div className="bg-[#10b981]/10 border border-[#10b981] text-[#10b981] px-3 py-2 rounded text-sm">
                                    {formData.success}
                                </div>
                            )}

                            {imagePreview && (
                                <div className="relative mt-4 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Aperçu"
                                        className="w-full h-auto max-h-96 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-4">
                                <div className="flex gap-2">
                                    <label className="cursor-pointer rounded-full p-2 text-[#a237ff] transition hover:bg-[#a237ff]/10">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={formData.isLoading}
                                        />
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-2 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </label>

                                    <button
                                        type="button"
                                        className="rounded-full p-2 text-[#a237ff] transition hover:bg-[#a237ff]/10"
                                        onClick={() => setShowTopicsModal(true)}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z" />
                                        </svg>
                                    </button>
                                </div>

                                {formData.topicsIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 flex-1 mx-4">
                                        {formData.topicsIds.map((topicId) => (
                                            <span key={topicId} className="badge-primary">
                                                {topicNameById.get(topicId) ?? topicId}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        topicsIds: prev.topicsIds.filter(id => id !== topicId)
                                                    }))}
                                                    className="cursor-pointer hover:text-[#8a1fb8]"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={formData.isLoading || !formData.title.trim() || !formData.description.trim()}
                                    className="btn-primary flex items-center gap-2 shadow-sm shadow-[#a237ff]/30"
                                >
                                    {formData.isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Poster'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-center text-gray-500 shadow-sm">
                        <p className="py-8">Chargement des posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-center text-gray-500 shadow-sm">
                        <p className="py-8">Les posts apparaîtront ici</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {renderFeed()}
                    </div>
                )}
            </div>

            <TopicsModal
                isOpen={showTopicsModal}
                onClose={() => setShowTopicsModal(false)}
                selectedTopicIds={formData.topicsIds}
                onTopicsChange={(topicIds) => setFormData(prev => ({ ...prev, topicsIds: topicIds }))}
                onTopicsUpdated={loadTopics}
            />
        </div>
    );
};

export default HomePage;
