import { useNavigate } from "react-router";
import RecommendedUsers from "../components/suggested_user/RecommendedUsers";
import { TOKEN_KEY } from "../utils/constants";

const RecommendationsPage = ({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) => {
    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 bg-white shadow-md p-4 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Recommandations</h1>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition duration-200"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 flex justify-center">
                <RecommendedUsers />
            </div>
        </div>
    );
};

export default RecommendationsPage;
