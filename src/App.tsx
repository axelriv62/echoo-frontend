import { Routes, Route } from "react-router";
import './App.css'
import { deactivate } from './hooks/auth';
import RegisterPage from './pages/RegisterPage'
import AuthForm from "./components/login/Login";

function DEACTIVATE() {
    const handleDeactivate = async () => {
        await deactivate();
    };

    return (
        <div>
            <button onClick={handleDeactivate}>
                Désactiver mon compte
            </button>
        </div>
    );
}

function HOME() {
    return (
        <div>
            <h2>Bienvenue sur Echoo</h2>
            <p>Ceci est la page d'accueil.</p>
        </div>
    );
}

function ERROR() {
    return (
        <div>
            <h2>404 - Page non trouvée</h2>
            <p>La page que vous recherchez n'existe pas.</p>
        </div>
    );
}

function LOGIN() {
    return <AuthForm token={null} />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HOME />} />
            <Route path="/login" element={<LOGIN />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/deactivate" element={<DEACTIVATE />} />
            <Route path="*" element={<ERROR />} />
        </Routes>
    )
}

export default App
