// ProfileCard component
// ---------------------
// Renders a user's profile summary and an optional inline editor. The
// component accepts the current profile, loading and error states and
// delegates updates to the provided onUpdate callback.
//
// Inline comments and English docstrings describe the edit flow and
// state transitions.
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
    onUpdate?: (payload: UpdateUserProfilePayload) => Promise<User | null>;
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

    // Initialize the editing draft from the provided profile and switch the
    // component to editing mode. If there is no profile available this is a
    // no-op.
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

    // Cancel editing and reset the draft state.
    const stopEditing = () => {
        setIsEditing(false);
        setDraft(null);
    };

    // Handle the form submission: build the payload from the draft and call
    // the onUpdate callback. If the update succeeds, exit edit mode.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!profile || !draft || typeof onUpdate !== "function") {
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
        <div className="relative w-full rounded-2xl border border-[#a237ff]/15 bg-linear-to-b from-white to-[#fcf8ff] p-5 text-left shadow-sm">
            {profile && !loading && !error && !isEditing && typeof onUpdate === "function" && (
                <button
                    type="button"
                    onClick={startEditing}
                    aria-label="Modifier le profil"
                    className="absolute right-3 top-3 rounded-full p-1 text-gray-500 transition hover:bg-[#a237ff]/10 hover:text-[#7a22bf]"
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a22bf]">Profil</p>
                    <p className="text-lg font-semibold text-[#1f1330]">{profile.username}</p>
                    <p className="text-sm text-gray-600">Email : {profile.email ?? "-"}</p>
                    <p className="text-sm text-gray-600">Etat du compte : {accountStatus}</p>
                    <p className="text-sm text-gray-600">Membre depuis : {joinedAt}</p>
                    <p className="text-sm text-gray-600">
                        Utilisateurs suivis : {profile.followedUsers?.length ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">
                        Nombre de likes : {profile.reactions?.length ?? 0}
                    </p>
                </div>
            )}
            {profile && !loading && !error && isEditing && draft && (
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a22bf]">Edition du profil</p>
                    <label className="block text-sm text-gray-700">
                        Nom d'utilisateur
                        <input
                            type="text"
                            value={draft.username}
                            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#a237ff]/40 focus:ring-2 focus:ring-[#a237ff]/20"
                            disabled={updating}
                        />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Email
                        <input
                            type="email"
                            value={draft.email}
                            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#a237ff]/40 focus:ring-2 focus:ring-[#a237ff]/20"
                            disabled={updating}
                        />
                    </label>
                    <label className="block text-sm text-gray-700">
                        Topics (IDs separes par des virgules)
                        <input
                            type="text"
                            value={draft.topicsIdsText}
                            onChange={(event) => setDraft({ ...draft, topicsIdsText: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#a237ff]/40 focus:ring-2 focus:ring-[#a237ff]/20"
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
                            className="rounded-lg bg-[#a237ff] px-4 py-2 text-sm text-white hover:bg-[#8a1fb8]"
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
