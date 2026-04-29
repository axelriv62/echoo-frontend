import { useState } from "react";
import type { Comment } from "../../utils/types";

interface CommentFormProps {
    onSubmit: (content: string, parentCommentId?: string | null) => Promise<void>;
    isLoading?: boolean;
    placeholder?: string;
    parentComment?: Comment | null;
    onCancelReply?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
                                                     onSubmit,
                                                     isLoading = false,
                                                     placeholder = "Ajouter un commentaire...",
                                                     parentComment,
                                                     onCancelReply,
                                                 }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Le commentaire ne peut pas être vide");
            return;
        }

        setError(null);
        try {
            await onSubmit(content, parentComment?.id || null);
            setContent("");
        } catch (err) {
            setError("Erreur lors de l'envoi du commentaire");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            {parentComment && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded flex items-center justify-between">
                    <span>Répondre à {parentComment.user.username}</span>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="text-red-500 hover:text-red-700 font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 outline-none focus:bg-gray-200 transition disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="btn-primary px-6 py-2"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Répondre"
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                </div>
            )}
        </form>
    );
};

export default CommentForm;