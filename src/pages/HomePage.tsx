import {useState, useEffect, useCallback, useRef} from "react";
import { useLocation, useNavigate } from "react-router";
import { getPosts, getTopic, createPost, type CreatePostPayload } from "../hooks/posts";
import { getUserProfile } from "../services/api";
import PostCard from "../components/post-card/PostCard";
import { useProfile } from "../hooks/useProfile";
import type { Post, Topic } from "../utils/types";
import RecommendedUsers from "../components/suggested_user/RecommendedUsers.tsx";
import TopicsModal from "../components/topics-modal/TopicsModal";

interface PostFormState {
    title: string;
    description: string;
    urlImage: string;
    topicsIds: string[];
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

const HomePage = ({ token}: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<Post[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopicsModal, setShowTopicsModal] = useState(false);
    const highlightPostId = (location.state as { highlightPostId?: string } | null)?.highlightPostId ?? null;
    useProfile(token);
    const { profile: myProfile } = useProfile(token);
    const [ignoredUsersSet, setIgnoredUsersSet] = useState<Set<string>>(new Set(myProfile?.ignoredUsers ?? []));

    const [formData, setFormData] = useState<PostFormState>({
        title: '',
        description: '',
        urlImage: '',
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

    // keep a ref to the latest refreshPosts so effects can call it without listing it as dependency
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
        const result = await getTopic();
        if (result.success) {
            setTopics(result.topics);
        }
    };

    useEffect(() => {
        let isMounted = true;

        // keep local ignored set in sync with profile (defer to avoid sync setState in effect)
        Promise.resolve().then(() => {
            if (isMounted) setIgnoredUsersSet(new Set(myProfile?.ignoredUsers ?? []));
        });

        const onIgnoredUsersChanged = async () => {
            if (!token) return;
            try {
                const me = await getUserProfile(token);
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
                const topicsResult = await getTopic();
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
                urlImage: '',
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, urlImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
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
        <div className="max-w-2xl mx-auto border-l border-r border-[#e5e7eb] min-h-screen">
            <div className="border-b border-[#e5e7eb] p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Titre du post"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full text-lg font-semibold bg-transparent placeholder-gray-400 text-[#000000] outline-none border-b border-[#e5e7eb] pb-2"
                        disabled={formData.isLoading}
                    />

                    <textarea
                        placeholder="Quoi de neuf?!"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full text-xl bg-transparent placeholder-gray-500 text-[#000000] outline-none resize-none"
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

                    {formData.urlImage && (
                        <div className="relative rounded-2xl overflow-hidden border border-[#e5e7eb] bg-gray-100">
                            <img
                                src={formData.urlImage}
                                alt="Aperçu"
                                className="w-full h-64 object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, urlImage: '' }))}
                                className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-[#e5e7eb]">
                        <div className="flex gap-2">
                            <label className="cursor-pointer text-[#a237ff] hover:bg-[#a237ff]/10 p-2 rounded-full transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={formData.isLoading}
                                />
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                </svg>
                            </label>

                            <button
                                type="button"
                                className="text-[#a237ff] hover:bg-[#a237ff]/10 p-2 rounded-full transition"
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
                            className="btn-primary flex items-center gap-2"
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

                  <RecommendedUsers token={token} onFollowSuccess={refreshPosts} />


            {loading ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="py-8">Chargement des posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="py-8">Les posts apparaîtront ici</p>
                </div>
            ) : (
                <div className="divide-y divide-[#e5e7eb]">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            id={`post-${post.id}`}
                            className={highlightPostId === post.id ? "rounded-lg ring-2 ring-[#a237ff] ring-offset-2 ring-offset-white" : ""}
                        >
                            <PostCard post={post} onDelete={handlePostDeleted} />
                        </div>
                    ))}
                </div>
            )}

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