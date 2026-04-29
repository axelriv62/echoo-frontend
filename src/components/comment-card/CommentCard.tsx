import { useState } from "react";
import type { Comment } from "../../utils/types";
import { deleteComment } from "../../services/comments.ts";

interface CommentCardProps {
    comment: Comment;
    isReply?: boolean;
    currentUserId?: string;
    onReplyClick?: (comment: Comment) => void;
    onCommentDeleted?: (commentId: string, comment: Comment) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
                                                     comment,
                                                     isReply = false,
                                                     currentUserId,
                                                     onReplyClick,
                                                     onCommentDeleted,
                                                 }) => {
    const profileImage = comment.user.imageProfile || '/src/assets/no-profile-picture.jpg';
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletedComment, setDeletedComment] = useState(comment);

    const isAuthor = currentUserId === comment.user.id;
    const isDeleted = !deletedComment.content || deletedComment.content.trim() === '';

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteComment(deletedComment.id);
            if (result.success) {
                // Mettre à jour le commentaire avec un contenu vide
                const updatedComment = { ...deletedComment, content: '' };
                setDeletedComment(updatedComment);
                onCommentDeleted?.(deletedComment.id, updatedComment);
                setShowDeleteConfirm(false);
            } else {
                alert(result.message);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
            <img
                src={profileImage}
                alt={deletedComment.user.username}
                className="w-8 h-8 rounded-full object-cover bg-gray-200 flex-shrink-0"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/no-profile-picture.jpg';
                }}
            />
            <div className="flex-1 bg-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                            {deletedComment.user.username}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(deletedComment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                    {isAuthor && !isDeleted && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                            title="Supprimer le commentaire"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                            </svg>
                        </button>
                    )}
                </div>

                {isDeleted ? (
                    <p className="text-sm text-gray-500 italic mt-1">Ce commentaire a été supprimé</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-700 mt-1">{deletedComment.content}</p>
                        {onReplyClick && !isReply && (
                            <button
                                onClick={() => onReplyClick(deletedComment)}
                                className="text-xs text-[#a237ff] hover:text-[#8a1fb8] font-semibold mt-2"
                            >
                                Répondre
                            </button>
                        )}
                    </>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Supprimer le commentaire ?
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Cette action est irréversible. Le commentaire sera supprimé définitivement.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Suppression...
                                    </>
                                ) : (
                                    'Supprimer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentCard;