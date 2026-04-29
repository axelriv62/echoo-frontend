import { useEffect, useState } from "react";
import PostCard from "../post-card/PostCard";
import { getRecommendedPosts } from "../../services/recommendations";
import { TOKEN_KEY } from "../../utils/constants";
import type { Post } from "../../utils/types";

type RecommendedPostsProps = {
    limit?: number;
};

const RecommendedPosts = ({ limit = 1 }: RecommendedPostsProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const token = localStorage.getItem(TOKEN_KEY);

    useEffect(() => {
        let isMounted = true;

        const loadRecommendedPosts = async () => {
            const result = await getRecommendedPosts(limit);

            if (!isMounted) {
                return;
            }

            setMessage(result.message);
            setPosts(result.success ? result.posts : []);
            setLoading(false);
        };

        loadRecommendedPosts();

        return () => {
            isMounted = false;
        };
    }, [limit, token]);

    const handlePostDeleted = (postId: string) => {
        setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    };

    return (
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Posts suggérés</h3>
                    <p className="text-sm text-gray-500">Recommandations personnalisées pour vous</p>
                </div>
            </div>

            {loading ? (
                <p className="mt-3 text-sm text-gray-500">Chargement des suggestions de posts...</p>
            ) : (
                <>
                    <p className="mb-3 text-sm text-gray-600">{message}</p>

                    {posts.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucune suggestion disponible pour le moment.</p>
                    ) : (
                        <div className="space-y-4">
                            {posts.slice(0, 1).map((post) => (
                                <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default RecommendedPosts;

