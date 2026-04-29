import { useNavigate } from "react-router";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/ProfileCard/ProfileCard";
import { ROLES_KEY, TOKEN_KEY } from "../utils/constants";

const ProfilePage = ({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const { profile, loading, error, updateProfile, updating, updateError } = useProfile(token);

    const handleUpdateProfile = async (payload: Parameters<typeof updateProfile>[0]) => {
        const result = await updateProfile(payload);

        if (result.requiresReauth) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ROLES_KEY);
            setToken(null);
            navigate("/login", { state: { message: "Votre nom d'utilisateur a changé, reconnectez-vous." } });
            return null;
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
            <div className="max-w-2xl mx-auto border-l border-r border-gray-200 min-h-screen p-4">
                <div className="flex justify-center">
                    <ProfileCard
                        profile={profile}
                        loading={loading}
                        error={error}
                        onUpdate={handleUpdateProfile}
                        updating={updating}
                        updateError={updateError}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
