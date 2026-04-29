import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePublicProfile } from "../hooks/useProfile";
import { getUserProfile } from "../services/users.ts";
import LogoutButton from "../components/logout-button/LogoutButton.tsx";
import DeactivateAccountButton from "../components/disable-button/DisableButton.tsx";

const ProfilePage = ({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const { profile, loading, error } = usePublicProfile(myUserId || null, token);

    useEffect(() => {
        const loadMyProfile = async () => {
            const me = await getUserProfile();
            setMyUserId(me.id);
        };

        loadMyProfile();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#a237ff]/20 border-t-[#a237ff] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h2>
                    <p className="text-gray-600 mb-6">{error || "Impossible de charger le profil"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-2 px-6 transition duration-200"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-[#a237ff] text-lg transition"
                    >
                        ← Retour
                    </button>
                    <h1 className="text-2xl font-bold text-[#a237ff]">Mon profil</h1>
                    <div className="w-6"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto border-l border-r border-gray-200 min-h-screen">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex gap-6 items-start">
                        {profile.imageProfile ? (
                            <img
                                src={profile.imageProfile}
                                alt={profile.username}
                                className="w-24 h-24 rounded-full object-cover ring-2 ring-[#a237ff]/20"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-[#a237ff]/10 flex items-center justify-center">
                                <span className="text-3xl font-semibold text-[#a237ff]">
                                    {profile.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h2>
                            {profile.email && (
                                <p className="text-gray-600 mb-4">{profile.email}</p>
                            )}

                            <div className="mb-4 max-w-40 space-y-2">
                                <LogoutButton token={token} setToken={setToken} />
                                <DeactivateAccountButton token={token} setToken={setToken} />
                            </div>

                            <div className="flex gap-4 mb-4">
                                {profile.followedUsers && profile.followedUsers.length > 0 && (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">
                                            {profile.followedUsers.length}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {profile.followedUsers.length > 1 ? "Abonnements" : "Abonnement"}
                                        </span>
                                    </div>
                                )}

                                {profile.followedPages && profile.followedPages.length > 0 && (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">
                                            {profile.followedPages.length}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {profile.followedPages.length > 1 ? "Pages suivies" : "Page suivie"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {profile.topics && profile.topics.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.topics.map((topic) => (
                                        <span
                                            key={topic.id}
                                            className="px-3 py-1 rounded-full bg-[#a237ff]/10 text-[#a237ff] text-sm font-medium"
                                        >
                                            {topic.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 text-center text-gray-500">
                    <p className="py-16">Vos posts apparaîtront ici</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
