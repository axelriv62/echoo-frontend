import { Routes, Route, Navigate } from "react-router";
import './App.css'
import RegisterPage from './pages/RegisterPage'
import LoginPage from "./pages/LoginPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import PublicProfilePage from "./pages/PublicProfilePage.tsx";
import GamePage from "./pages/GamePage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

// Redirects to login if no token, otherwise renders the element
function ProtectedRoute({element, token}: { element: React.ReactNode; token: string | null; }) {
    return token ? element : <Navigate to="/login" replace />;
}

function App({ token, setToken }: { token: string | null; setToken: (token: string | null) => void }) {
    return (
        <Routes>
            <Route path="/" element={<HomePage token={token} setToken={setToken} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage token={token} setToken={setToken} />} token={token} />} />
            <Route path="/user/:userId" element={<PublicProfilePage token={token} setToken={setToken} />} />
            <Route path="/game" element={<ProtectedRoute element={<GamePage token={token} setToken={setToken} />} token={token} />} />
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    );
}

export default App;
