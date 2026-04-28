import { useState, type MouseEvent } from "react";
import { TOKEN_KEY } from "../../utils/constants";
import { followUser } from "../../services/api";

type FollowUserButtonProps = {
	userId: string;
	token?: string | null;
	initialIsFollowing?: boolean;
	onFollowSuccess?: () => void | Promise<void>;
	className?: string;
};

const FollowUserButton = ({ userId, token, initialIsFollowing = false, onFollowSuccess, className }: FollowUserButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [error, setError] = useState<string | null>(null);

	const handleFollow = async (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();

		if (isLoading) {
			return;
		}

		const authToken = token ?? localStorage.getItem(TOKEN_KEY);
		if (!authToken) {
			setError("Veuillez vous connecter pour suivre cet utilisateur");
			return;
		}

		setIsLoading(true);
		setError(null);

		const result = await followUser(userId, authToken);

		if (result.success) {
			setIsFollowing((prev) => !prev);
			if (onFollowSuccess) {
				await onFollowSuccess();
			}
		} else {
			setError(result.message);
		}

		setIsLoading(false);
	};

	return (
		<div className="mt-3 w-full" onClick={(event) => event.stopPropagation()}>
			<button
				type="button"
				onClick={handleFollow}
				disabled={isLoading}
				className={className ?? `w-full rounded-full text-white text-xs font-semibold py-1.5 px-3 transition ${isFollowing ? "bg-[#8a1fb8] hover:bg-[#74189c]" : "bg-[#a237ff] hover:bg-[#8a1fb8]"} disabled:bg-[#a237ff]/40 disabled:cursor-not-allowed`}
			>
				{isLoading ? "Mise a jour..." : isFollowing ? "Arreter de suivre" : "Suivre"}
			</button>
			{error && <p className="mt-1 text-[11px] text-[#ef4444]">{error}</p>}
		</div>
	);
};

export default FollowUserButton;


