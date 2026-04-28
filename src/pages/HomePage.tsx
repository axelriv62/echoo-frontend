import { useState } from 'react';
import { createPost, type CreatePostPayload } from '../hooks/posts';
import { useNavigate } from 'react-router';
import { TOKEN_KEY } from '../utils/constants';

interface PostFormState {
    title: string;
    description: string;
    urlImage: string;
    topicsIds: string[];
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

export default function HomePage({ setToken }: { setToken: (token: string | null) => void }) {
    const navigate = useNavigate();
    const token = localStorage.getItem(TOKEN_KEY);

    const [formData, setFormData] = useState<PostFormState>({
        title: '',
        description: '',
        urlImage: '',
        topicsIds: [],
        isLoading: false,
        error: null,
        success: null,
    });

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Accès refusé</h2>
                    <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 transition duration-200"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        navigate('/');
    };

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
            urlImage: formData.urlImage || '',
            topicsIds: formData.topicsIds.length > 0 ? formData.topicsIds : [],
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

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur">
                <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">Echoo</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition duration-200"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto border-l border-r border-gray-200 min-h-screen">
                <div className="border-b border-gray-200 p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Titre du post"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full text-lg font-semibold bg-transparent placeholder-gray-400 text-gray-900 outline-none border-b border-gray-200 pb-2"
                            disabled={formData.isLoading}
                        />

                        <textarea
                            placeholder="Quoi de neuf?!"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full text-xl bg-transparent placeholder-gray-500 text-gray-900 outline-none resize-none"
                            rows={4}
                            disabled={formData.isLoading}
                        />

                        {formData.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                                {formData.error}
                            </div>
                        )}
                        {formData.success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                                {formData.success}
                            </div>
                        )}

                        {formData.urlImage && (
                            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
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

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <label className="cursor-pointer text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={formData.isLoading}
                                    />
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                    </svg>
                                </label>

                                <button
                                    type="button"
                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"
                                    onClick={() => {
                                        const topic = prompt('Ajouter un sujet:');
                                        if (topic && topic.trim()) {
                                            setFormData(prev => ({
                                                ...prev,
                                                topicsIds: [...prev.topicsIds, topic.trim()]
                                            }));
                                        }
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"/>
                                    </svg>
                                </button>
                            </div>

                            {formData.topicsIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 flex-1 mx-4">
                                    {formData.topicsIds.map((topic, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {topic}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    topicsIds: prev.topicsIds.filter((_, i) => i !== idx)
                                                }))}
                                                className="cursor-pointer hover:text-blue-900"
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
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-full transition duration-200 flex items-center gap-2"
                            >
                                {formData.isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </>
                                ) : (
                                    'Poster'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="p-4 text-center text-gray-500">
                    <p className="py-8">Les posts apparaîtront ici</p>
                </div>
            </div>
        </div>
    );
}