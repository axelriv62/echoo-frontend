import type { User } from "../../utils/types";

type ProfileCardProps = {
    profile: User | null;
    loading: boolean;
    error: string | null;
};

const ProfileCard = ({ profile, loading, error }: ProfileCardProps) => {
    const joinedAt = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("fr-FR")
        : "-";
    const accountStatus = profile?.enabled === false ? "désactivé" : "activé";

    return (
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-4 text-left shadow-lg">
            {loading && (
                <p className="text-sm text-gray-600">Chargement du profil...</p>
            )}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {profile && !loading && !error && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profil</p>
                    <p className="text-lg font-semibold text-gray-800">{profile.username}</p>
                    {profile.imageProfile && (
                        <img
                            src={profile.imageProfile}
                            alt={`Avatar de ${profile.username}`}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    )}
                    <p className="text-sm text-gray-600">Email : {profile.email ?? "-"}</p>
                    <p className="text-sm text-gray-600">Etat du compte : {accountStatus}</p>
                    <p className="text-sm text-gray-600">Membre depuis : {joinedAt}</p>
                    <p className="text-sm text-gray-600">
                        Pages suivies : {profile.followedPages?.length ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Utilisateurs suivis : {profile.followedUsers?.length ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Centres d'interet : {profile.topics?.length ?? 0}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
