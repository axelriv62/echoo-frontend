import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getPosts } from "../hooks/posts";
import { deactivate } from "../hooks/auth";
import PostCard from "../components/post-card/PostCard";
import { TOKEN_KEY } from "../utils/constants";
import type { Post } from "../utils/types";

const HomePage2 = ({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const loadPosts = async () => {
            const result = await getPosts();
            if (result.success && result.posts) {
                setPosts(result.posts);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
            setLoading(false);
        };

        loadPosts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setMessage({ type: 'success', text: 'Déconnexion réussie' });
        setTimeout(() => navigate('/login'), 1500);
    };

    const handleDeactivate = async () => {
        const result = await deactivate();
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            setToken(null);
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Veuillez vous connecter</h2>
                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 bg-white shadow-md p-4 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Echoo</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition duration-200 text-sm"
                        >
                            Se déconnecter
                        </button>
                        <button
                            onClick={handleDeactivate}
                            className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 transition duration-200 text-sm"
                        >
                            Désactiver le compte
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                {message && (
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <h2 className="text-3xl font-bold text-gray-800 mb-8">Derniers posts</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-600">Chargement des posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <p className="text-center text-gray-600 py-12">Aucun post disponible</p>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </div>
    );
};

export default HomePage2;
