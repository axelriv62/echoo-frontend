import { Routes, Route } from "react-router";
import './App.css'
import RegisterPage from './pages/RegisterPage'
import { useNavigate } from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import PublicProfilePage from "./pages/PublicProfilePage.tsx";
import RecommendationsPage from "./pages/RecommendationsPage.tsx";
import GamePage from "./pages/GamePage.tsx";

function ERROR() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#a237ff]/10 to-[#a237ff]/5 p-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-[#a237ff] mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Page non trouvée</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Oups ! La page que vous recherchez n'existe pas.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-3 px-8 transition duration-200 mb-4"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
}

function App({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) {
    return (
        <Routes>
            <Route path="/" element={<HomePage token={token} setToken={setToken} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage token={token} setToken={setToken} />} />
            <Route path="/user/:userId" element={<PublicProfilePage token={token} setToken={setToken} />} />
            <Route path="/recommendations" element={<RecommendationsPage token={token} setToken={setToken} />} />
            <Route path="*" element={<ERROR />} />
            <Route path="/game" element={<GamePage />} />
        </Routes>
    )
}

export default App;
