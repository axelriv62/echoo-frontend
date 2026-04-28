import { useState } from "react";
import type { UpdateUserProfilePayload, User } from "../../utils/types";

type ProfileDraft = {
    username: string;
    email: string;
    topicsIdsText: string;
};

type ProfileCardProps = {
    profile: User | null;
    loading: boolean;
    error: string | null;
    onUpdate: (payload: UpdateUserProfilePayload) => Promise<User | null>;
    updating: boolean;
    updateError: string | null;
};

const ProfileCard = ({ profile, loading, error, onUpdate, updating, updateError }: ProfileCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<ProfileDraft | null>(null);

    const joinedAt = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("fr-FR")
        : "-";
    const accountStatus = profile?.enabled === false ? "désactivé" : "activé";

    const startEditing = () => {
        if (!profile) {
            return;
        }

        const topicsIdsText = profile.topics?.map((topic) => topic.id).join(", ") ?? "";

        setDraft({
            username: profile.username,
            email: profile.email ?? "",
            topicsIdsText,
        });
        setIsEditing(true);
    };

    const stopEditing = () => {
        setIsEditing(false);
        setDraft(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!profile || !draft) {
            return;
        }

        const topicsIds = draft.topicsIdsText
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        const payload: UpdateUserProfilePayload = {
            username: draft.username.trim() || profile.username,
            imageProfile: null,
            email: draft.email.trim() || null,
            topicsIds,
        };

        const updated = await onUpdate(payload);
        if (updated) {
            stopEditing();
        }
    };

    return (
        <div className="relative w-full max-w-md rounded-2xl bg-white/80 p-4 text-left shadow-lg">
            {profile && !loading && !error && !isEditing && (
                <button
                    type="button"
                    onClick={startEditing}
                    aria-label="Modifier le profil"
                    className="absolute right-3 top-3 text-gray-500 transition hover:text-gray-700"
                >
                    ✎
                </button>
            )}
            {loading && (
                <p className="text-sm text-gray-600">Chargement du profil...</p>
            )}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {profile && !loading && !error && !isEditing && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profil</p>
                    <p className="text-lg font-semibold text-gray-800">{profile.username}</p>
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
            {profile && !loading && !error && isEditing && draft && (
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Edition du profil</p>
                    <label className="block text-sm text-gray-700">
                        Nom d'utilisateur
                        <input
                            type="text"
                            value={draft.username}
                            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                            disabled={updating}
                        />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Email
                        <input
                            type="email"
                            value={draft.email}
                            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                            disabled={updating}
                        />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Topics (IDs separes par des virgules)
                        <input
                            type="text"
                            value={draft.topicsIdsText}
                            onChange={(event) => setDraft({ ...draft, topicsIdsText: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                            disabled={updating}
                        />
                    </label>
                    {updateError && (
                        <p className="text-sm text-red-600">{updateError}</p>
                    )}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={stopEditing}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                            disabled={updating}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                            disabled={updating}
                        >
                            {updating ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfileCard;
