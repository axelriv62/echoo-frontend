import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { searchPosts, searchUsers, getPostsByUser, getUserProfile } from '../../services/api';
import { TOKEN_KEY } from '../../utils/constants';
import type { Post } from '../../utils/types';

type SearchMode = 'users' | 'posts';

type UserSearchResult = {
	id: string;
	username: string;
	imageProfile: string | null;
};

type SearchResult =
	| { type: 'user'; user: UserSearchResult }
	| { type: 'post'; post: Pick<Post, 'id' | 'title' | 'user' | 'page'> };

const modeLabels: Record<SearchMode, string> = {
	users: 'Utilisateurs',
	posts: 'Posts',
};

const SearchBar: React.FC = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [mode, setMode] = useState<SearchMode>('users');
	const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const searchRequestIdRef = useRef(0);
	const navigate = useNavigate();

	const performSearch = async (searchQuery: string, searchMode: SearchMode) => {
		const trimmedQuery = searchQuery.trim();

		if (!trimmedQuery) {
			setResults([]);
			setIsLoading(false);
			setShowResults(false);
			return;
		}

		const requestId = searchRequestIdRef.current + 1;
		searchRequestIdRef.current = requestId;
		setIsLoading(true);

		if (searchMode === 'users') {
			const token = localStorage.getItem(TOKEN_KEY);
			const result = await searchUsers(trimmedQuery, token);

			if (requestId !== searchRequestIdRef.current) {
				return;
			}

			if (result.success) {
				setResults(result.users.map((user) => ({ type: 'user', user })));
				setShowResults(true);
			} else {
				setResults([]);
				setShowResults(false);
			}
			setIsLoading(false);
			return;
		}

		const token = localStorage.getItem(TOKEN_KEY);
		const postsResult = await searchPosts(trimmedQuery, token);

		// find users matching the query to fetch their posts via backend
		const usersResult = await searchUsers(trimmedQuery, token);
		let creatorPosts: Post[] = [];
		// prepare list of users to fetch posts for (limit to first 5)
		const usersToFetch = usersResult.success ? usersResult.users.slice(0, 5) : [];

		// also include current authenticated user if their username matches the query
		try {
			if (token) {
				const me = await getUserProfile(token);
				const normalizedQuery = trimmedQuery.toLowerCase();
				if (me?.username && me.username.toLowerCase().includes(normalizedQuery)) {
					const alreadyIncluded = usersToFetch.some((u) => u.id === me.id);
					if (!alreadyIncluded) {
						usersToFetch.unshift({ id: me.id, username: me.username, imageProfile: me.imageProfile ?? null });
					}
				}
			}
		} catch {
			// ignore errors fetching current user profile
		}

		if (usersToFetch.length > 0) {
			// limit to 5 users to avoid too many requests
			const postsByUserPromises = usersToFetch.slice(0, 5).map((u) => getPostsByUser(u.id, token));
			const postsByUserResults = await Promise.all(postsByUserPromises);
			creatorPosts = postsByUserResults.flatMap((r) => (r.success ? r.posts : []));
		}

		if (requestId !== searchRequestIdRef.current) {
			return;
		}

		if (postsResult.success) {
			const normalizedQuery = trimmedQuery.toLowerCase();
			const creatorMatches = creatorPosts
				? creatorPosts.filter((post) => post.user.username.toLowerCase().includes(normalizedQuery))
				: [];

			const mergedPosts = [...postsResult.posts, ...creatorMatches].filter(
				(post, index, array) => array.findIndex((item) => item.id === post.id) === index
			);

			setResults(mergedPosts.map((post) => ({
				type: 'post',
				post: {
					id: post.id,
					title: post.title,
					user: post.user,
					page: post.page,
				},
			})));
			setShowResults(true);
		} else {
			setResults([]);
			setShowResults(false);
		}

		setIsLoading(false);
	};

	const handleModeChange = (nextMode: SearchMode) => {
		setMode(nextMode);
		setIsModeMenuOpen(false);
		setResults([]);
		void performSearch(query, nextMode);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		void performSearch(value, mode);
	};

	const handleUserClick = (userId: string) => {
		navigate(`/user/${userId}`);
		setQuery('');
		setResults([]);
		setShowResults(false);
	};

	const handlePostClick = (postId: string) => {
		navigate('/', { state: { highlightPostId: postId } });
		setQuery('');
		setResults([]);
		setShowResults(false);
	};

	const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
		const container = event.currentTarget;
		requestAnimationFrame(() => {
			if (!container.contains(document.activeElement)) {
				setShowResults(false);
				setIsModeMenuOpen(false);
			}
		});
	};

	return (
		<div ref={searchRef} className="relative w-full max-w-md" onBlur={handleContainerBlur}>
			<div className="relative flex items-stretch">
				<div className="relative shrink-0">
					<button
						type="button"
						onClick={() => setIsModeMenuOpen((value) => !value)}
						className="flex h-full items-center gap-2 rounded-l-lg border border-r-0 border-[#a237ff]/30 bg-white/95 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#a237ff]/5 hover:text-[#a237ff] focus:outline-none focus:ring-2 focus:ring-[#a237ff]/20"
						aria-haspopup="menu"
						aria-expanded={isModeMenuOpen}
					>
						<span>{modeLabels[mode]}</span>
						<span className="text-xs text-gray-400">▾</span>
					</button>

					{isModeMenuOpen && (
						<div className="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-[#a237ff]/20 bg-white shadow-lg">
							{(Object.keys(modeLabels) as SearchMode[]).map((value) => (
								<button
									key={value}
									type="button"
									onClick={() => handleModeChange(value)}
									className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${mode === value
										? 'bg-[#a237ff]/10 font-semibold text-[#a237ff]'
										: 'text-gray-700 hover:bg-[#a237ff]/5 hover:text-[#a237ff]'
									}`}
								>
									<span>{modeLabels[value]}</span>
									{mode === value && <span className="text-xs">✓</span>}
								</button>
							))}
						</div>
					)}
				</div>

				<div className="relative flex-1 items-center">
					<input
						type="text"
						placeholder={mode === 'users' ? 'Rechercher un utilisateur...' : 'Rechercher un post (titre ou créateur)...'}
						value={query}
						onChange={(e) => handleQueryChange(e.target.value)}
						onFocus={() => query && setShowResults(true)}
						className="w-full rounded-r-lg border border-[#a237ff]/30 border-l-0 bg-white/95 px-3 py-2 text-sm text-gray-800 placeholder-gray-500 outline-none transition focus:border-[#a237ff] focus:bg-white focus:shadow-[0_0_0_2px_rgba(162,55,255,0.1)]"
					/>
					{isLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a237ff] font-bold">...</span>}
				</div>
			</div>

			{showResults && results.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a237ff]/20 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
					{results.map((result) => (
						<button
							key={result.type === 'user' ? result.user.id : result.post.id}
							type="button"
							onClick={() => result.type === 'user' ? handleUserClick(result.user.id) : handlePostClick(result.post.id)}
							className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#a237ff]/5 active:bg-[#a237ff]/10 transition text-left border-b border-[#a237ff]/5 last:border-b-0"
						>
							{result.type === 'user' ? (
								<>
									<div className="shrink-0 w-8 h-8 rounded-full bg-[#a237ff]/10 flex items-center justify-center overflow-hidden">
										{result.user.imageProfile ? (
											<img
												src={result.user.imageProfile}
												alt={result.user.username}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-xs font-semibold text-[#a237ff]">
												{result.user.username.slice(0, 1).toUpperCase()}
											</span>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-gray-800 truncate">{result.user.username}</p>
										<p className="text-xs text-gray-500">Utilisateur</p>
									</div>
								</>
							) : (
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-gray-800 truncate">{result.post.title}</p>
									<p className="text-xs text-gray-500 truncate">
										Par {result.post.user.username}{result.post.page?.name ? ` · ${result.post.page.name}` : ''}
									</p>
								</div>
							)}
						</button>
					))}
				</div>
			)}

			{showResults && query.trim() && results.length === 0 && !isLoading && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a237ff]/20 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500 z-50">
					{mode === 'users' ? 'Aucun utilisateur trouvé' : 'Aucun post trouvé'}
				</div>
			)}
		</div>
	);
};

export default SearchBar;


