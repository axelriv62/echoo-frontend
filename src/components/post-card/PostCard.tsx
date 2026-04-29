import { useEffect, useState } from "react";
import type { Post } from "../../utils/types.ts";
import { dislikePost, getPostLikedStatus, likePost } from "../../services/api";
import { TOKEN_KEY } from "../../utils/constants";

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const profileImage = post.user.imageProfile || '/src/assets/no-profile-picture.jpg';
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(() => post.nbLikes);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingLike, setIsCheckingLike] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        let isMounted = true;

        if (!token) {
            return;
        }

        (async () => {
            const result = await getPostLikedStatus(post.id, token);

            if (!isMounted) {
                return;
            }

            if (result.success) {
                setIsLiked(result.liked);
            } else {
                setIsLiked(false);
            }

            setIsCheckingLike(false);
        })();

        return () => {
            isMounted = false;
        };
    }, [post.id]);

    const handleLikeClick = async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            alert("Vous devez être connecté pour liker un post");
            return;
        }

        if (isLoading || isCheckingLike) {
            return;
        }

        setIsLoading(true);
        try {
            if (isLiked) {
                const result = await dislikePost(post.id, token);
                if (result.success) {
                    setIsLiked(false);
                    setLikeCount((previousCount) => Math.max(0, previousCount - 1));
                }
            } else {
                const result = await likePost(post.id, token);
                if (result.success) {
                    setIsLiked(true);
                    setLikeCount((previousCount) => previousCount + 1);
                }
            }
        } catch (error) {
            console.error("Erreur lors de la gestion du like:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={profileImage}
                        alt={post.user.username}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/no-profile-picture.jpg';
                        }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{post.user.username}</span>
                    {post.page && <span className="text-sm text-gray-500">{post.page.name}</span>}
                </div>

                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-700 mb-4">{post.description}</p>

                {post.urlImage && (
                    <div
                        className="mb-4 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                        onClick={() => setIsImageOpen(true)}
                    >
                        <img
                            src={post.urlImage}
                            alt={post.title}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {post.topics?.map((topic) => (
                            <span key={topic.id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                {topic.name}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLikeClick}
                            disabled={isLoading || isCheckingLike}
                            aria-label={isLiked ? "Retirer la réaction" : "Réagir au post"}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                                isLiked
                                    ? "border-[#a237ff] bg-[#a237ff]/10 text-[#a237ff] hover:bg-[#a237ff]/15"
                                    : "border-[#e5e7eb] bg-white text-[#000000] hover:border-[#a237ff] hover:bg-[#a237ff]/5 hover:text-[#a237ff]"
                            } ${(isLoading || isCheckingLike) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <span className="text-base leading-none">{isLiked ? "💜" : "🤍"}</span>
                            <span>{likeCount}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isImageOpen && post.urlImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsImageOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-screen">
                        <img
                            src={post.urlImage}
                            alt={post.title}
                            className="w-full h-auto max-h-screen object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setIsImageOpen(false)}
                            className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center font-bold transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostCard;
