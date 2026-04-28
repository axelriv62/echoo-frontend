import { useNavigate } from "react-router";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/ProfileCard/ProfileCard";
import { TOKEN_KEY } from "../utils/constants";
import { deactivate } from "../hooks/auth";
import { useState } from "react";

const ProfilePage = ({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const {
        profile,
        loading,
        error,
        updateProfile,
        updating,
        updateError,
    } = useProfile(token);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    const handleProfileUpdate = async (payload: Parameters<typeof updateProfile>[0]) => {
        const result = await updateProfile(payload);
        if (result.requiresReauth) {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setTimeout(() =>
                navigate("/login", {
                    state: {
                        message: "Modification réussie : Reconnecte-toi avec ton nouveau nom d'utilisateur pour continuer.",
                    },
                })
            );
        }

        return result.user;
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
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur">
                <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">Echoo</h1>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => navigate("/")}
                            className="px-4 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-semibold rounded-full hover:bg-blue-50 transition duration-200"
                        >
                            Accueil
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition duration-200"
                        >
                            Déconnexion
                        </button>
                        <button
                            onClick={handleDeactivate}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-full transition duration-200"
                        >
                            Désactiver
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto border-l border-r border-gray-200 min-h-screen p-4">
                {message && (
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-center">
                    <ProfileCard
                        profile={profile}
                        loading={loading}
                        error={error}
                        onUpdate={handleProfileUpdate}
                        updating={updating}
                        updateError={updateError}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
