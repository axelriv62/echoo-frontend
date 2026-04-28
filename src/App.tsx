import { Routes, Route } from "react-router";
import './App.css'
import RegisterPage from './pages/RegisterPage'
import {useState} from "react";
import { useNavigate } from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import {TOKEN_KEY} from "./utils/constants.ts";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

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
            <Route path="/" element={<HomePage token={token} setToken={setToken} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage token={token} setToken={setToken} />} />
            <Route path="*" element={<ERROR />} />
        </Routes>
    )
}

export default App;
