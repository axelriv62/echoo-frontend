import { useEffect, useState } from 'react';
import { getRecommendedUsers, type RecommendedUser } from '../../hooks/RecommendedUsers';

const RecommendedUsers = () => {
	const [users, setUsers] = useState<RecommendedUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		const loadSuggestedUsers = async () => {
			const result = await getRecommendedUsers();
			if (!isMounted) {
				return;
			}

			setMessage(result.message);
			if (result.success) {
				setUsers(result.suggestedUsers);
			}
			setLoading(false);
		};

		loadSuggestedUsers();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<section className="mt-8 w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow">
			<h3 className="text-xl font-semibold text-gray-800">Utilisateurs suggérés</h3>

			{loading ? (
				<p className="mt-3 text-sm text-gray-500">Chargement des suggestions...</p>
			) : (
				<>
					<p className="mt-3 text-sm text-gray-600">{message}</p>

					{users.length === 0 ? (
						<p className="mt-4 text-sm text-gray-500">Aucune suggestion disponible pour le moment.</p>
					) : (
						<ul className="mt-4 space-y-3">
							{users.map((user) => (
								<li key={user.id} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
									{user.imageProfile ? (
										<img
											src={user.imageProfile}
											alt={`Photo de profil de ${user.username}`}
											className="h-10 w-10 rounded-full object-cover"
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
											{user.username.slice(0, 1).toUpperCase()}
										</div>
									)}

									<div>
										<p className="font-medium text-gray-800">{user.username}</p>
										{user.email && <p className="text-sm text-gray-500">{user.email}</p>}
									</div>
								</li>
							))}
						</ul>
					)}
				</>
			)}
		</section>
	);
};

export default RecommendedUsers;

