import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { searchUsers } from '../../services/api';
import { TOKEN_KEY } from '../../utils/constants';

type SearchResult = {
	id: string;
	username: string;
	imageProfile: string | null;
};

const SearchBar: React.FC = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	const handleSearch = async (searchQuery: string) => {
		setQuery(searchQuery);

		if (!searchQuery.trim()) {
			setResults([]);
			setShowResults(false);
			return;
		}

		setIsLoading(true);
		const token = localStorage.getItem(TOKEN_KEY);
		const result = await searchUsers(searchQuery, token);

		if (result.success) {
			setResults(result.users);
			setShowResults(true);
		} else {
			setResults([]);
			setShowResults(false);
		}
		setIsLoading(false);
	};

	const handleUserClick = (userId: string) => {
		navigate(`/user/${userId}`);
		setQuery('');
		setResults([]);
		setShowResults(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div ref={searchRef} className="relative w-full max-w-sm">
			<div className="relative flex items-center">
				<input
					type="text"
					placeholder="Rechercher un utilisateur..."
					value={query}
					onChange={(e) => handleSearch(e.target.value)}
					onFocus={() => query && setShowResults(true)}
					className="w-full px-3 py-2 text-sm border border-[#a237ff]/30 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 outline-none transition focus:border-[#a237ff] focus:bg-white focus:shadow-[0_0_0_2px_rgba(162,55,255,0.1)]"
				/>
				{isLoading && <span className="absolute right-3 text-[#a237ff] font-bold">...</span>}
			</div>

			{showResults && results.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a237ff]/20 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
					{results.map((user) => (
						<button
							key={user.id}
							type="button"
							onClick={() => handleUserClick(user.id)}
							className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#a237ff]/5 active:bg-[#a237ff]/10 transition text-left border-b border-[#a237ff]/5 last:border-b-0"
						>
							<div className="shrink-0 w-8 h-8 rounded-full bg-[#a237ff]/10 flex items-center justify-center overflow-hidden">
								{user.imageProfile ? (
									<img
										src={user.imageProfile}
										alt={user.username}
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-xs font-semibold text-[#a237ff]">
										{user.username.slice(0, 1).toUpperCase()}
									</span>
								)}
							</div>
							<span className="text-sm font-medium text-gray-800 truncate">{user.username}</span>
						</button>
					))}
				</div>
			)}

			{showResults && query.trim() && results.length === 0 && !isLoading && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a237ff]/20 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500 z-50">
					Aucun utilisateur trouvé
				</div>
			)}
		</div>
	);
};

export default SearchBar;


