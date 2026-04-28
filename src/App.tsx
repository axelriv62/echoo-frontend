import { Routes, Route } from "react-router";
import './App.css'
import { deactivate } from './hooks/auth';
import RegisterPage from './pages/RegisterPage'
import {useState} from "react";
import { useNavigate } from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import {TOKEN_KEY} from "./utils/constants.ts";
import { useProfile } from "./hooks/useProfile";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import HomePage from "./pages/HomePage.tsx";

function HOME({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) {
    const navigate = useNavigate();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { profile, loading: profileLoading, error: profileError } = useProfile(token);

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setMessage({ type: 'success', text: 'Déconnexion réussie' });
        setTimeout(() => navigate('/'));
    };

    const handleDeactivate = async () => {
        const result = await deactivate();
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            setToken(null);
            setTimeout(() => navigate('/'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
            <div className="text-center">
                {message && (
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}
                <h2 className="text-4xl font-bold text-gray-800 mb-8">Bienvenue sur Echoo</h2>
                {token ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={() => setIsProfileOpen((prev) => !prev)}
                                className="rounded-lg bg-white text-blue-700 border border-blue-200 font-semibold py-3 px-6 transition duration-200 hover:bg-blue-50"
                            >
                                {profileLoading ? "Chargement..." : profile?.username ?? "Mon profil"}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200"
                            >
                                Se déconnecter
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 transition duration-200"
                            >
                                Désactiver mon compte
                            </button>
                        </div>
                        {isProfileOpen && (
                            <ProfileCard
                                profile={profile}
                                loading={profileLoading}
                                error={profileError}
                            />
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200"
                    >
                        Se connecter
                    </button>
                )}
            </div>
        </div>
    );
}

function ERROR() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Page non trouvée</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Oups ! La page que vous recherchez n'existe pas.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 transition duration-200 mb-4"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
}

function App() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

    return (
        <Routes>
            <Route path="/" element={<HOME token={token} setToken={setToken} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage setToken={setToken} />} />
            <Route path="*" element={<ERROR />} />
        </Routes>
    )
}

export default App;
