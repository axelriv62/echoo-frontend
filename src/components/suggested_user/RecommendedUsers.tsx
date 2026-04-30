import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { getRecommendedUsers, type RecommendedUser } from '../../services/recommendations.ts';
import FollowUserButton from '../FollowUserButton/FollowUserButton';
import { getMyFollowedUsers } from '../../services/users.ts';
import { TOKEN_KEY } from '../../utils/constants.ts';

type RecommendedUsersProps = {
	onFollowSuccess?: () => void | Promise<void>;
};

const RecommendedUsers = ({ onFollowSuccess }: RecommendedUsersProps) => {
	const navigate = useNavigate();
	const [users, setUsers] = useState<RecommendedUser[]>([]);
	const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const carouselRef = useRef<HTMLDivElement | null>(null);
	const token = localStorage.getItem(TOKEN_KEY);


	useEffect(() => {
		let isMounted = true;

		const loadSuggestedUsers = async () => {
			const [result, followedResult] = await Promise.all([
				getRecommendedUsers(),
				getMyFollowedUsers(),
			]);
			if (!isMounted) {
				return;
			}

			setMessage(result.message);
			if (result.success) {
				setUsers(result.suggestedUsers);
			}

			if (followedResult.success) {
				setFollowedUserIds(new Set(followedResult.userIds));
			} else {
				setFollowedUserIds(new Set());
			}
			setLoading(false);
		};

		loadSuggestedUsers();

		return () => {
			isMounted = false;
		};
	}, [token]);

	return (
		<section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">Utilisateurs suggérés</h3>
				</div>

			</div>

			{loading ? (
				<p className="mt-3 text-sm text-gray-500">Chargement des suggestions...</p>
			) : (
				<>
					<p className="mb-3 text-sm text-gray-600">{message}</p>

					{users.length === 0 ? (
						<p className="text-sm text-gray-500">Aucune suggestion disponible pour le moment.</p>
					) : (
						<div
							ref={carouselRef}
							className="flex max-w-full gap-3 overflow-x-auto overflow-y-hidden pb-2 pr-1 snap-x snap-mandatory scroll-smooth"
						>
							{users.slice(0, 5).map((user) => (
								<div
									key={user.id}
									data-carousel-item
									className="w-40 flex-none snap-start rounded-xl border border-[#a237ff]/20 bg-[#a237ff]/5 px-3 py-3 shadow-sm transition hover:border-[#a237ff]/40 hover:bg-[#a237ff]/10"
								>
									<button
										type="button"
										onClick={() => navigate(`/user/${user.id}`)}
										className="w-full text-left cursor-pointer"
									>
									<div className="flex flex-col items-center text-center">
										{user.imageProfile ? (
											<img
												src={user.imageProfile}
												alt={`Photo de profil de ${user.username}`}
												className="h-16 w-16 rounded-full object-cover ring-2 ring-[#a237ff]/20"
											/>
										) : (
											<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#a237ff]/10 text-base font-semibold text-[#a237ff] ring-2 ring-[#a237ff]/20">
												{user.username.slice(0, 1).toUpperCase()}
											</div>
										)}

										<div className="mt-3 min-w-0">
											<p className="truncate font-medium text-gray-800">{user.username}</p>
										</div>
										<div className="mt-3 text-xs text-gray-500">Profil suggéré</div>
									</div>
									</button>
									<FollowUserButton
										key={`${user.id}-${followedUserIds.has(user.id) ? "following" : "not-following"}`}
										userId={user.id}
										initialIsFollowing={followedUserIds.has(user.id)}
										onFollowSuccess={onFollowSuccess}
									/>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</section>
	);
};

export default RecommendedUsers;
