import { useState, useEffect } from "react";
import type { Post, Comment } from "../../utils/types.ts";
import { createComment } from "../../hooks/comments";
import CommentCard from "../comment-card/CommentCard";
import CommentForm from "../comment-form/CommentForm";
import { ID_KEY } from "../../utils/constants.ts";
import { dislikePost, getPostLikedStatus, likePost } from "../../services/api";
import { TOKEN_KEY } from "../../utils/constants";
import { deletePost } from "../../hooks/posts";

const PostCard: React.FC<{ post: Post; onDelete?: (postId: string) => void | Promise<void> }> = ({ post, onDelete }) => {
    const profileImage = post.user.imageProfile || '/src/assets/no-profile-picture.jpg';
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(() => post.nbLikes);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingLike, setIsCheckingLike] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const canDelete = currentUserId === post.user.id;

    // Récupérer l'ID utilisateur actuel
    useEffect(() => {
        const userId = localStorage.getItem(ID_KEY);
        let isMounted = true;

        if (userId) {
            setCurrentUserId(userId);
        }

        (async () => {
            const result = await getPostLikedStatus(post.id);

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

    const handleDeletePost = async () => {
        setIsLoading(true);
        try {
            const result = await deletePost(post.id);
            if (result.success) {
                if (onDelete) {
                    await onDelete(post.id);
                }
                setShowDeleteModal(false);
            } else {
                alert(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommentSubmit = async (content: string, parentCommentId?: string | null) => {
        setIsCommentLoading(true);
        try {
            const result = await createComment({
                postId: post.id,
                parentCommentId: parentCommentId || undefined,
                content,
            });

            if (result.success && result.comment) {
                setComments([...comments, result.comment]);
                setReplyingTo(null);
            }
        } finally {
            setIsCommentLoading(false);
        }
    };

    const handleLikeClick = async () => {
        if (isLoading || isCheckingLike) {
            return;
        }

        setIsLoading(true);
        try {
            if (isLiked) {
                const result = await dislikePost(post.id);
                if (result.success) {
                    setIsLiked(false);
                    setLikeCount((previousCount) => Math.max(0, previousCount - 1));
                }
            } else {
                const result = await likePost(post.id);
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

                <div className="flex items-center justify-between mb-4">
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

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="text-gray-600 hover:text-[#a237ff] font-semibold text-sm flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-2"
                            aria-label="Supprimer le post"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                            </svg>
                            Supprimer
                        </button>
                    )}
                </div>

                {/* Commentaires */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    Aucun commentaire pour le moment
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                        isReply={!!comment.parentCommentId}
                                        currentUserId={currentUserId ?? undefined}
                                        onReplyClick={setReplyingTo}
                                    />
                                ))
                            )}
                        </div>

                        <CommentForm
                            onSubmit={handleCommentSubmit}
                            isLoading={isCommentLoading}
                            parentComment={replyingTo}
                            onCancelReply={() => setReplyingTo(null)}
                        />
                    </div>
                )}
            </div>

            {/* Lightbox image */}
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

            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !isLoading && setShowDeleteModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce post ?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Cette action est irreversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isLoading}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleDeletePost}
                                disabled={isLoading}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLoading ? "Suppression..." : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostCard;
